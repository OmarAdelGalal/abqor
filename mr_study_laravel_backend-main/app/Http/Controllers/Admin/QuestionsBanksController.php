<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\QuestionsBank;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use LDAP\Result;

class QuestionsBanksController extends Controller
{
    //store
    public function store(Request $request){
        $request->validate([
            'name'=>'required|string',
            'education_level_id'=>'required|integer|exists:education_levels,id',
            'education_year_id'=>'required|integer|exists:education_years,id',
            'subject_id'=>'required|integer|exists:subjects,id',
            'education_major_id'=>'nullable|integer',

        ]);

        $questionsBank = QuestionsBank::create($request->only([
            'name',
            'education_level_id',
            'education_year_id',
            'subject_id',
            'education_major_id',
        ]));

        return ResultResponse::success($questionsBank);    
    }


    //update
    public function update(Request $request,QuestionsBank $bank){
        $request->validate([
            'name'=>'required|string',
            'education_level_id'=>'required|integer|exists:education_levels,id',
            'education_year_id'=>'required|integer|exists:education_years,id',
            'subject_id'=>'required|integer|exists:subjects,id',
            'education_major_id'=>'nullable|integer',

            
        ]);

        $bank->update($request->only([
            'name',
            'education_level_id',
            'education_year_id',
            'subject_id',
            'education_major_id',

              ]));

        return ResultResponse::success($bank);
    }

    //delete
    public function destroy(QuestionsBank $bank){
        $bank->delete();
        return ResultResponse::success();
    }

    //show
    public function show(Request $request,QuestionsBank $bank){
        $bank->load('educationLevel','educationYear','subject','educationMajor');
        
        $questions=$bank->questions()->when($request->has('archived'),function($query){
            $query->where('archived',true);
        },
        function($query){
            $query->where('archived',false);
        })->orderBy('priority')->get();
        $data=[
            'bank'=>$bank,
            'questions'=>$questions
        ];

        
        return ResultResponse::success($data);
    }

    //index
    public function index(Request $request){
        $request->validate([
            'education_level_id'=>'nullable|integer|exists:education_levels,id',
            'education_year_id'=>'nullable|integer|exists:education_years,id',
            'subject_id'=>'nullable|integer|exists:subjects,id',
            'name'=>'nullable|string',
        ]);

        $banks=QuestionsBank::withCount('questions')->with('educationLevel','educationYear','subject','educationMajor')
        ->when($request->education_level_id,fn($query) => $query->where('education_level_id',$request->education_level_id))
        ->when($request->education_year_id,fn($query) => $query->where('education_year_id',$request->education_year_id))
        ->when($request->subject_id,fn($query) => $query->where('subject_id',$request->subject_id))
        ->when($request->name,fn($query) => $query->where('name','like','%'.$request->name.'%'))
        ->latest()
        ->paginate(10);
        return ResultResponse::success($banks);

    }


    public function createQuestion(Request $request){
        //validate
        $request->validate([
            'questions_bank_id'=>'required|integer|exists:questions_banks,id',
            'text'=>'required|string',
            'explanation'=>'string|nullable',
            'answers'=>'required|array',
        ]);
        
        $answers =$request->json('answers');   
        //validate answers
        if(count(array_filter($answers,fn($answer) => isset($answer['text']) && isset($answer['correct'])))!=count($answers)){
            //return error
            return ResultResponse::error(message:'answers are not valid', code: 'ANSWERS_NOT_VALID');
        }
        //ensure have 1 correct answer
        if(count(array_filter($answers,fn($answer) => $answer['correct']))!=1){
            //return error
            return ResultResponse::error(message:'must have 1 correct answer', code: 'MUST_HAVE_1_CORRECT_ANSWER');
        }

        //get max priority in the bank
        $maxPriority=Question::where('questions_bank_id',$request->questions_bank_id)->max('priority') ?? 0;
        $priority=$maxPriority+1;


        DB::transaction(function () use ($request,$answers,$priority){
            //create the question
            $question=Question::create([
                'correct_answer_id'=>null,
                'questions_bank_id'=>$request->questions_bank_id,
                'explanation'=>$request->explanation,
                'text'=>$request->text,
                'priority'=>$priority
            ]);
            //create the answers
            foreach($answers as $ans){

                 $answer = $question->answers()->create($ans);
                if($ans['correct']){
                    $question->correct_answer_id=$answer->id;
                    $question->save();
                }
            }

        });
        return ResultResponse::success();

    }
    // delete question
    public function deleteQuestion(Request $request, Question $question){
        $question->delete();
        return ResultResponse::success();
    }

    //show question
    public function showQuestion(Question $question){
        $question->load('answers');
        $question->append('bank_questions');
        return ResultResponse::success($question);
    }

    //update question
    public function updateQuestion(Request $request,Question $question){
        //validate
        $request->validate([
            'text'=>'required|string',
            'explanation'=>'nullable|string',
            'answers'=>'required|array',
        ]);
        
        $answers =$request->json('answers');   
        //validate answers
        if(count(array_filter($answers,fn($answer) => isset($answer['text']) && isset($answer['correct'])))!=count($answers)){
            //return error
            return ResultResponse::error(message:'answers are not valid', code: 'ANSWERS_NOT_VALID');
        }
        //ensure have 1 correct answer
        if(count(array_filter($answers,fn($answer) => $answer['correct']))!=1){
            //return error
            return ResultResponse::error(message:'must have 1 correct answer', code: 'MUST_HAVE_1_CORRECT_ANSWER');
        }
        DB::transaction(function () use ($request,$answers,$question){
            //update the question
            $question->update([
                'correct_answer_id'=>null,
                'explanation'=>$request->explanation,
                'text'=>$request->text
            ]);
            //delete the old answers
            $question->answers()->delete();
            //create the answers
            foreach($answers as $ans){
                 $answer = $question->answers()->create($ans);
                if($ans['correct']){
                    $question->correct_answer_id=$answer->id;
                    $question->save();
                }
            }

        });
        return ResultResponse::success();
    }


    //set archive
    public function setArchive(Request $request,Question $question){
        $request->validate([
            'archived'=>'required|boolean'
        ]);

        $question->update([
            'archived'=>$request->archived
        ]);
        return ResultResponse::success($question);
    
 
    }


    //copy question
    public function copyQuestion(Request $request,Question $question){
        //get max priority in the bank
        $maxPriority=Question::where('questions_bank_id',$question->questions_bank_id)->max('priority') ?? 0;
        $priority=$maxPriority+1;

        //create the question
        $question2=Question::create([
            'correct_answer_id'=>null,
            'questions_bank_id'=>$question->questions_bank_id,
            'explanation'=>$question->explanation,
            'priority'=>$priority,
            'text'=>$question->text

        ]);
        //create the answers
        foreach($question->answers as $ans){
            $answer = $question2->answers()->create([

                'text'=>$ans->text
            ]);
            if($ans->id==$question->correct_answer_id){
                $question2->correct_answer_id=$answer->id;
                $question2->save();
            }
        }
        return ResultResponse::success($question2);
    }
    //update priorities
    public function updatePriorities(Request $request){
        $request->validate([
            'ids'=>'required|array',
        ]);
        $p=1;
        foreach($request->ids as $id){
            $question=Question::find($id);
            $question->priority=$p;
            $question->save();
            $p++;
        }
        return ResultResponse::success();
    }
}
