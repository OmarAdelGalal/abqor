<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SelectNext;
use App\Http\Controllers\Controller;
use App\Models\EducationLevel;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EducationLevelsController extends Controller
{
    //store education level
    public function store(Request $request)
    {
        $request->validate([
            'name'=>'required|string',
            'subtitle'=>'required|string',
            'image'=>'required|image|mimes:jpeg,png,jpg|max:512',
            'description'=>'required|string',
            'select_next'=>['required',Rule::enum(SelectNext::class)]
        ]);
        $level= EducationLevel::make($request->only(['name','subtitle','description','select_next']));
        $level->image=$request->file('image')->store('education_levels','public');
        $level->save();
        return ResultResponse::success($level);
    }

    //destroy education level
    public function destroy(EducationLevel $level)
    {
        $level->update(['hide'=>true]);
        return ResultResponse::success();
    }

    //update education level
    public function update(EducationLevel $level,Request $request)
    {
        $request->validate([
            'name'=>'required|string',
            'subtitle'=>'required|string',
            'image'=>'nullable|image|mimes:jpeg,png,jpg|max:512',
            'description'=>'required|string'
        ]);
        $level->update($request->only(['name','subtitle','description']));
        if($request->hasFile('image')){
            $level->image=$request->file('image')->store('education_levels','public');
            $level->save();
        }
        return ResultResponse::success($level);
    }

    //show education level
    public function show(EducationLevel $level)
    {
        return ResultResponse::success($level);
    }

    //index education level
    public function index(Request $request)
    {

        $levels=EducationLevel::where('hide',false)->when($request->name,fn($query) => $query->where('name','like','%'.request()->name.'%'))->get();
        return ResultResponse::success($levels);
    }

}
