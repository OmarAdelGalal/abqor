<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HelpQuestion;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Termwind\Components\Hr;

class HelpCenterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $questions=HelpQuestion::
        when($request->type,fn($q)=>$q->where('type',request()->type))
        ->when($request->search,fn($q)=>$q->where('title','like','%'.request()->search.'%'))
        ->latest()->get();

        return ResultResponse::success($questions);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //validate
        $request->validate([
            'title'=>'required|max:255',
            'answer'=>"required",
            'type'=>'required|string'
        ]);
        $question=HelpQuestion::create($request->only(['title','answer','type']));
        return ResultResponse::success($question);
    }

    

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, HelpQuestion $question)
    {
        //validate
        $request->validate([
            'title'=>'required|max:255',
            'answer'=>"required",
            'type'=>'required|string'
        ]);
        $question->update($request->only(['title','answer','type']));
        return ResultResponse::success($question);
        
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HelpQuestion $question)
    {
        $question->delete();
        return ResultResponse::success();
    }
    //show question
    public function show(HelpQuestion $question){
        return ResultResponse::success($question);
    }
}
