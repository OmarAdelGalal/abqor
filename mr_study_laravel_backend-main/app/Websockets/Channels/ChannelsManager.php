<?php

namespace App\Websockets\Channels;

use App\Websockets\Handlers\BaseWebSocketHandler;
use Ratchet\ConnectionInterface;

class ChannelsManager{
    private static $channels=[];


    public static function subscribe($channelName,ConnectionInterface $connection){
        if(!array_key_exists($channelName,self::$channels)){
            self::$channels[$channelName]=new Channel();
        
        }
        self::$channels[$channelName]->addConnection($connection);
    }

    public static function removeAllSubscriptions(ConnectionInterface $connection){
        foreach(self::$channels as $channel){
            $channel->removeConnection($connection);
        }
    }
    public static function publish($channelName,$msg){
        if(array_key_exists($channelName,self::$channels)){
         
            self::$channels[$channelName]->broadcast($msg);
        }
    }
    public static function share($channelName,$msg,ConnectionInterface $connection){
        if(array_key_exists($channelName,self::$channels)){
         
            self::$channels[$channelName]->broadcastExcept($msg,$connection);
        }
    }
    public function removeSubscriptions(ConnectionInterface $connection,$channelName){
        if(array_key_exists($channelName,self::$channels)){
         
            self::$channels[$channelName]->removeConnection($connection);
          }

    
    }
}