<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AboutTitle;
use App\Models\PagesConfig;
use App\Models\TeamMember;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;

class AboutMePageController extends Controller
{
    public function index(){
        $titles=AboutTitle::oldest()
        ->when(request()->search,fn($query) => $query->where('title','like','%'.request()->search.'%'))
        ->get();
        $baseTitles=PagesConfig::select(['about_us_title','about_us_subtitle'])->first();

        $members=TeamMember::all();

        $data=[
            'base_titles'=>$baseTitles,
            'titles'=>$titles,
            'members'=>$members
        ];
        return ResultResponse::success($data);
    }
    public function updateTitles(Request $request){
        $request->validate([
            'about_us_title'=>'required',
            'about_us_subtitle'=>'nullable',
        ]);
        $config=PagesConfig::first();
        $config->update($request->only(['about_us_title','about_us_subtitle']));

        return ResultResponse::success();
    }
    //store title
    public function store(Request $request){
        $request->validate([
            'title'=>'required|string',
            'text'=>'required|string',
        ]);
        $title= AboutTitle::create($request->only(['title','text']));
        return ResultResponse::success($title);
    }

    //update title
    public function update(Request $request, AboutTitle $title){
        $request->validate([
            'title'=>'required|string',
            'text'=>'required|string',
        ]);
        
        $title->update($request->only(['title','text']));
        return ResultResponse::success($title);
    }

    //delete title
    public function destroy(AboutTitle $title){     
        $title->delete();
        return ResultResponse::success();
    }
    //show title
    public function show(AboutTitle $title){
        return ResultResponse::success($title);
    }


    public function createTeamMember(Request $request){
        $request->validate([
            'name'=>'required|string',
            'position'=>'required|string',
            'youtube'=>'required|url',
            'facebook'=>'required|url',
            'instagram'=>'required|url',
            'image'=>'required|image|max:2048',
            'subject_id'=>'required|integer|exists:subjects,id'
        ]);

        $member=TeamMember::make($request->only(['name',
                                                'position',
                                                'youtube',
                                                'facebook',
                                                'instagram',
                                                'subject_id']));
        $member->image=$request->file('image')->store('members','public');
        $member->save();

        return ResultResponse::success($member);
    }

    public function deleteMember(TeamMember $member){
        $member->delete();

        return ResultResponse::success();
    }
}
