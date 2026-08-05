<?php

namespace App\Http\Controllers\Common;

use App\Http\Controllers\Controller;
use App\Models\ChatRoom;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function getRoomMessages(Request $request,ChatRoom $room){
        $messages = $room->messages()->with('sender')->latest()->paginate(25);
        $messages->append('sent');
        return ResultResponse::success($messages);
    }

    public function getRooms(Request $request){
        $rooms = ChatRoom::where('active',true)->get();
        $rooms->append('last_message');
        return ResultResponse::success($rooms);
    }
}
