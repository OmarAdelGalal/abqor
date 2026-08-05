<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppConfig;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;

class AdminAppConfigController extends Controller
{

    public function getAppConfig(){
        $config=AppConfig::first();
        return ResultResponse::success($config);
    }

    public function updateAppConfig(Request $request){
        $request->validate([
//            'mobile'=>'required|max:15',
            'whatsapp'=>'required|url',
            'facebook'=>'required|url',
            'instagram'=>'required|url',
            'tiktok'=>'required|url',
            'youtube'=>'required|url',
            'twitter'=>'required|url',
            'telegram'=>'required|url',
            'email'=>'required|email',
            'app_store'=>'required|url',
            'play_store'=>'required|url',
            'trying_numbers'=>'required|numeric',
            'instagramConnect'=>'required|url',
            'telegramConnect'=>'required|url',
            'android_build_number'=>'required|integer',
            'ios_build_number'=>'required|integer',
            'android_version'=>'required|string',
            'ios_version'=>'required|string',
            'windows_build_number'=>'required|integer',
            'windows_version'=>'required|string',
            'macos_build_number'=>'required|integer',
            'macos_version'=>'required|string',
        ]);
        $config=AppConfig::first();
        $config->update($request->only(['whatsapp','facebook','instagram','tiktok','youtube','twitter', 'email',
                        'telegram','app_store','play_store', 'trying_numbers','instagramConnect','telegramConnect',
                        'android_build_number','ios_build_number','android_version','ios_version','windows_build_number','windows_version','macos_build_number','macos_version'
                    ]));
        return ResultResponse::success($config);
    }

}
