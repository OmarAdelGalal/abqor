<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemNotification;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;

class SystemNotificationsController extends Controller
{
    //index
    public function index(){
        $notis=SystemNotification::latest()->paginate(10);

        return ResultResponse::success($notis);
    }
}
