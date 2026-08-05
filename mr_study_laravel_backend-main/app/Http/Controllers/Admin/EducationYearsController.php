<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EducationYear;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EducationYearsController extends Controller
{
    // store
    public function store(Request $request)
    {
     
        $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'image' => 'required|image|mimes:jpeg,png,jpg|max:512',
            'education_level_id'=>['nullable','required_without:education_major_id',Rule::exists('education_levels','id')],
            'education_major_id'=>['nullable','required_without:education_level_id',Rule::exists('education_majors','id')],
            'subject_ids'=>'required'
        ]);
        
        $year= EducationYear::make($request->only(['title','description','education_level_id','education_major_id']));
        if ($request->hasFile('image')) {
            $year->image = $request->file('image')->store('education_years','public');
        }
        $year->save();
        $year->subjects()->sync(json_decode($request->subject_ids));
        return ResultResponse::success($year);
    }

    //destroy
    public function destroy(EducationYear $year)
    {
        $year->update(['hide'=>true]);
        return ResultResponse::success();
    }

    //show
    public function show(EducationYear $year)
    {
        $year->load('subjects');
        return ResultResponse::success($year);
    }

    //update
    public function update(Request $request, EducationYear $year)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:512',
            'subject_ids'=>'required'
        ]);
        $year->subjects()->sync(json_decode($request->subject_ids));
        $year->update($request->only(['title','description']));
        if ($request->hasFile('image')) {
            $year->image = $request->file('image')->store('education_years','public');
            
            $year->save();
        }
        return ResultResponse::success($year);
    }

    //index
    public function index(Request $request){
        $request->validate([
            'education_level_id'=>['nullable','required_without:education_major_id',Rule::exists('education_levels','id')],
            'education_major_id'=>['nullable','required_without:education_level_id',Rule::exists('education_majors','id')],
            'title'=>['nullable','string']
        ]);
        $years=EducationYear::where('hide',false)->withCount('subjects')->where('title','like','%'.$request->title.'%')->when($request->education_level_id,
        function($q){
           $q->where('education_level_id',request()->education_level_id); 
        },
        function($q){
            $q->where('education_major_id',request()->education_major_id);
        }
          )->get();
        return ResultResponse::success($years);
    }
}
