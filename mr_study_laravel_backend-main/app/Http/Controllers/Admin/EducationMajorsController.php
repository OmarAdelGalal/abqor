<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EducationMajor;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EducationMajorsController extends Controller
{
       // store
       public function store(Request $request)
       {
        
           $request->validate([
               'title' => 'required|string',
               'description' => 'required|string',
               'image' => 'required|image|mimes:jpeg,png,jpg|max:512',
               'education_level_id'=>['nullable','required_without:education_year_id',Rule::exists('education_levels','id')],
               'education_year_id'=>['nullable','required_without:education_level_id',Rule::exists('education_years','id')],
         
           ]);
   
           $major= EducationMajor::make($request->only(['title','description','education_level_id','education_year_id']));
           if ($request->hasFile('image')) {
               $major->image = $request->file('image')->store('education_majors','public');
           }
           $major->save();
           return ResultResponse::success($major);
       }
   
       //destroy
       public function destroy(EducationMajor $major)
       {
           $major->update(['hide'=>true]);
           return ResultResponse::success();
       }
   
       //show
       public function show(EducationMajor $major)
       {
           return ResultResponse::success($major);
       }
   
       //update
       public function update(Request $request, EducationMajor $major)
       {
           $request->validate([
               'title' => 'required|string',
               'description' => 'required|string',
               'image' => 'nullable|image|mimes:jpeg,png,jpg|max:512',
           ]);
           $major->update($request->only(['title','description']));
           if ($request->hasFile('image')) {
               $major->image = $request->file('image')->store('education_majors','public');
               
               $major->save();
           }
           return ResultResponse::success($major);
       }
   
       //index
       public function index(Request $request){
           $request->validate([
               'education_level_id'=>['nullable','required_without:education_year_id',Rule::exists('education_levels','id')],
               'education_year_id'=>['nullable','required_without:education_level_id',Rule::exists('education_years','id')],
               'title'=>['nullable','string']
           ]);
           $majors=EducationMajor::where('hide',false)->where('title','like','%'.$request->title.'%')->when($request->education_level_id,
           function($q){
              $q->where('education_level_id',request()->education_level_id); 
           },
           function($q){
               $q->where('education_year_id',request()->education_year_id);
           }
             )->get();
           return ResultResponse::success($majors);
       }
}
