<?php

namespace App\Websockets\Channels;

use Ratchet\ConnectionInterface;

class Channel{
    private $connections=[];
    
    public function addConnection(ConnectionInterface $connection){
        $this->connections[$connection->socketId]=$connection;
    }
    public function removeConnection(ConnectionInterface $connection){
        if(array_key_exists($connection->socketId,$this->connections)){
            unset($this->connections[$connection->socketId]);
        }
    }

    public function broadcast($msg){
        foreach ($this->connections as $connection) {
            $connection->send(json_encode($msg));
        }
    }
    public function broadcastExcept($msg,ConnectionInterface $conn){
        foreach ($this->connections as $connection) {
            if($conn->socketId!=$connection->socketId){
            $connection->send(json_encode($msg));
            }
        }
    }
}