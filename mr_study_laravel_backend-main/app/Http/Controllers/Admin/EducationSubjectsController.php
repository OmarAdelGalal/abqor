<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Mockery\Matcher\Subset;

class EducationSubjectsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        //validate
        $request->validate([
            'name'=>'nullable|string',

        ]);
        
        $subjects=Subject::where('hidden',false)->when($request->name,function ($query) {
            $search=request()->name;
            $query->where('name','like',"%{$search}%");
        })->get();

        return ResultResponse::success($subjects);
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //validate
        $request->validate([
            'name'=>'required|string',
            'icon'=>'required|file|mimes:svg'
        ]);
        $subject=Subject::make($request->only('name'));
        $subject->icon=$request->file('icon')->store('subject','public');
        $subject->save();
        return ResultResponse::success($subject);
    }

    

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Subject $subject)
    {
        //validate
        $request->validate([
            'name'=>'required|string',
            'icon'=>'nullable|file|mimes:svg'
        ]);
        $subject->update($request->only('name'));
        if($request->hasFile('icon')){
            $subject->icon=$request->file('icon')->store('subject','public');
            $subject->save();

        }
        return ResultResponse::success($subject);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subject $subject)
    {
        
        $subject->hidden=true ;
        $subject->save();
     
        return ResultResponse::success();
    }
    public function show(Subject $subject)
    {
        
     
        return ResultResponse::success($subject);
    }
}
