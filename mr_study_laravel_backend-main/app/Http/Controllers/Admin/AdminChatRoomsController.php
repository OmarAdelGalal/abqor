<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatRoom;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use LDAP\Result;

class AdminChatRoomsController extends Controller
{
    //index
    public function index()
    {
        $rooms = ChatRoom::all();
        return ResultResponse::success($rooms);
    }
    //create
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'description' => 'required',
        ]);
        $room = ChatRoom::create($request->only(['name', 'description']));
        return ResultResponse::success($room);
    }

    //update
    public function update(Request $request, ChatRoom $room)
    {
        $request->validate([
            'name' => 'required',
            'description' => 'required',
        ]);
        $room->update($request->only(['name', 'description']));
        return ResultResponse::success($room);
    }
    //show
    public function show(ChatRoom $room)
    {
        return ResultResponse::success($room);
    }
    // toggle room active
    public function toggleActive(Request $request, ChatRoom $room)
    {
        $room->active = !$room->active;
        $room->save();
        return ResultResponse::success($room);
    }
    
}
