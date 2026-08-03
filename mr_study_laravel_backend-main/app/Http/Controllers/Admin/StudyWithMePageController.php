<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppConfig;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;

class StudyWithMePageController extends Controller
{
    public function setLink(Request $request){
        $request->validate([
            'study_stream'=>'required|url'
        ]);
        AppConfig::first()->update($request->only(['study_stream']));

        return ResultResponse::success();
    }   
    public function disableStream(){
    
        
        AppConfig::first()->update(['study_stream'=>null]);

        return ResultResponse::success();
    }   
    public function getLink(){
        $config=AppConfig::select(['study_stream'])->first();
        
        return ResultResponse::success($config);

    }


    public function getMessages(){
        $room = ChatRoom::where('name','STUDY_ROOM')->first();
        $msgs=$room->messages()->with('sender')->paginate(50);

        return ResultResponse::success($msgs);
    }

    public function clearChat(){
        $room = ChatRoom::where('name','STUDY_ROOM')->first();
        $msgs=$room->messages()->delete();

        return ResultResponse::success($msgs);
    }
    
    
    public function deleteMsg(ChatMessage $message){

        $message->delete();
        
        return ResultResponse::success();
    }
}