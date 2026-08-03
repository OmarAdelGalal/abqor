<?php

namespace App\Helpers;

use Exception;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class NotificationsHelper{
    
    public static function createNotification($title, $body,$type, $data): CloudMessage{
        $msg=CloudMessage::new()->withData([
            
            'type'=>$type,
            'title'=>$title,
            'body'=>$body,
            'localized'=>'False',
            ...$data

        ])->withNotification(Notification::create($title, $body));
        
        
        return $msg;
    }  public static function createLocalizedNotification($title, $body, $titleArgs, $bodyArgs,$type, $data): CloudMessage{
        $msg=CloudMessage::new()->withData([
            'type'=>$type,
            'title'=>$title,
            'titleArgs'=>json_encode($titleArgs),
            'body'=>$body,
            'bodyArgs'=>json_encode($bodyArgs),
            'localized'=>'True',
            ...$data
        ])->withAndroidConfig([
            'notification'=>[
                'title_loc_key'=>$title,
                'title_loc_args'=>$titleArgs,
                'body'=>$body,
                'body_loc_args'=>$bodyArgs
                ]
        ])->withApnsConfig([
            'payload'=>[
                'aps'=>[
                    'alert'=>[
                        'title_loc_key'=>$title,
                        'title_loc_args'=>$titleArgs,
                        'loc_key'=>$body,
                        'loc_args'=>$bodyArgs
                    ]
                ]
            ]
                    ]);
     return $msg;
    }

    public static function sendMsg(CloudMessage $msg){
        $messaging = app('firebase.messaging');

        $messaging->send($msg);
        

    }
}