<?php 

namespace App\Websockets\Handlers;

use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Websockets\Channels\ChannelsManager;
use BeyondCode\LaravelWebSockets\QueryParameters;
use Ratchet\ConnectionInterface;
use Ratchet\RFC6455\Messaging\MessageInterface;

class ChatWebSocket extends BaseWebSocketHandler
{
    
    public function onOpen(ConnectionInterface $connection)
    {
        $roomId= QueryParameters::create($connection->httpRequest)->get('room');
        $room=ChatRoom::find($roomId);
        $connection->room=$room;
        
        parent::onOpen($connection);
        ChannelsManager::subscribe("room.{$roomId}",$connection);


        $lastMessageId= QueryParameters::create($connection->httpRequest)->get('last_message');
        if($lastMessageId){

            $messages=ChatMessage::where([['chat_room_id',$roomId],['id','>',(int)$lastMessageId]])
            ->whereNot('sender_id',$connection->user->id)->get();
            $messages->each(function($msg)use($connection){
                $this->sendMessageSelf($msg,$connection);
               
            });
        }
    }
    
    

    
    
    public function onMessage(ConnectionInterface $connection, MessageInterface $msg)
    {


        
        if($msg->getPayload()==' '){
            return;
        }
        $data=collect(json_decode($msg->getPayload(),true));
        $data->put('sender_id',$connection->user->id);            
        $data->put('chat_room_id',$connection->room->id);
        $message=ChatMessage::create($data->only(['chat_room_id','sender_id','text'])->toArray());
        $this->sendMessage($message,$connection);
            
            
        
    }

    public function authorized(ConnectionInterface $connection)
    {
        return $connection->room!=null;
    }

    public function sendMessage(ChatMessage $message,ConnectionInterface $connection){
        $message->load(['sender']);
        $data=collect($message->toArray());
        $data->put('event','message');
        $data->put('sent',false);
        ChannelsManager::share("room.{$message->chat_room_id}",$data->toJson(),$connection);
    }
    public function sendMessageSelf(ChatMessage $message,ConnectionInterface $connection){
        $message->load(['sender']);
        $data=collect($message->toArray());
        $data->put('event','message');
        $data->put('sent',false);
        $connection->send($data->toJson());
    }
}