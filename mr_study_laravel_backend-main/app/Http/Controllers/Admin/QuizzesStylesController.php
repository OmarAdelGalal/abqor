<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppConfig;
use App\Models\QuizzesStyle;
use App\Models\QuizzesStyleRandom;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;

class QuizzesStylesController extends Controller
{
    //store
    public function store(Request $request){
        $request->validate([
            'education_level_id'=>['required','integer'],
            'education_year_id'=>['required','integer'],
            'education_major_id'=>['required','integer'],
            'term'=>'required|integer|max:3|min:0',
            'week'=>'required|integer|max:13|min:0',
            'day'=>'required|integer|max:7|min:0',
            'color'=>'required|string',
            'color2'=>'nullable|string',
            'image'=>'required|image|mimes:gif|max:2048',
            'image_gray'=>'required|image|mimes:gif|max:2048',
        ]);


        $style=QuizzesStyle::make($request->only(['color','color2','term','week','day']));

        $style->education_level_id=$request->education_level_id==0 ? null : $request->education_level_id;
        $style->education_year_id=$request->education_year_id==0 ? null : $request->education_year_id;
        $style->education_major_id=$request->education_major_id==0 ? null : $request->education_major_id;
       
         
        $style->image=$request->file('image')->store('quizzes_style','public');
        $style->image_gray=$request->file('image_gray')->store('quizzes_style','public');
       
        $style->save();
        
        return ResultResponse::success($style);
            
     
    }
    public function update(Request $request,QuizzesStyle $style){
        $request->validate([
            'education_level_id'=>['required','integer'],
            'education_year_id'=>['required','integer'],
            'education_major_id'=>['required','integer'],
            'term'=>'required|integer|max:3|min:0',
            'week'=>'required|integer|max:13|min:0',
            'day'=>'required|integer|max:7|min:0',
            'color'=>'required|string',
            'color2'=>'nullable|string',
            'image'=>'nullable|image|mimes:gif|max:2048',
            'image_gray'=>'nullable|image|mimes:gif|max:2048',
        ]);


        $style->education_year_id=$request->education_year_id==0?null:$request->education_year_id;
        $style->education_major_id=$request->education_major_id==0?null:$request->education_major_id;
        $style->education_level_id=$request->education_level_id==0?null:$request->education_level_id;
        $style->term=$request->term;
        $style->week=$request->week;
        $style->day=$request->day;
        $style->color=$request->color;
        if($request->color2){
            $style->color2=$request->color2;
        }
        
        if($request->hasFile('image')){
            $style->image=$request->file('image')->store('quizzes_style','public');
        }
        
        if($request->hasFile('image_gray')){
            $style->image_gray=$request->file('image_gray')->store('quizzes_style','public');
        }
        $style->save();
        return ResultResponse::success($style);
            
     
    }
    //show
    public function show(QuizzesStyle $style){
        $style->load(['educationLevel','educationYear','educationMajor']);
        return ResultResponse::success($style);
    }

    //destroy
    public function destroy(QuizzesStyle $style){
        $style->delete();
        return ResultResponse::success($style);
    }
    //index
    public function index(Request $request){
        $request->validate([
            'education_level_id'=>['nullable','integer'],
            'education_year_id'=>['nullable','integer'],
            'term'=>'nullable|integer|max:3|min:0',
            'week'=>'nullable|integer|max:13|min:0',
            'day'=>'nullable|integer|max:7|min:0'
        ]);
        $styles=QuizzesStyle::with(['educationLevel','educationYear','educationMajor'])->when($request->education_level_id, function($q) {
            return $q->where('education_level_id', request()->education_level_id===0?null:request()->education_level_id);
        })
        ->when($request->education_year_id, function($q) {
            return $q->where('education_year_id', request()->education_year_id===0?null:request()->education_year_id);
        })
        ->when($request->term,fn($q)=>$q->where('term',request()->term))
        ->when($request->week,fn($q)=>$q->where('week',request()->week))
        ->when($request->day,fn($q)=>$q->where('day',request()->day))
        ->get();
        $randomMode=AppConfig::select(['quizzes_style_random'])->first()->quizzes_style_random;
        $data=[
            'random_mode'=>$randomMode,
            'style'=>$styles,
        ];

        return ResultResponse::success($data);
    }


    public function launchRandomMode(Request $request){
        $request->validate([
            'files.*' => 'required|file|mimes:gif,pdf|max:2048', 
        ]);


        QuizzesStyleRandom::truncate();
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $filePath = $file->store('quizzes_style', 'public'); // Store in `storage/app/public/uploads`
                QuizzesStyleRandom::create(['image'=>$filePath]);
            }
        }
        AppConfig::first()->update(['quizzes_style_random'=>true]);
        return ResultResponse::success();
    }
    
    public function stopRandomMode(){

        AppConfig::first()->update(['quizzes_style_random'=>false]);
        return ResultResponse::success();
    }
}
