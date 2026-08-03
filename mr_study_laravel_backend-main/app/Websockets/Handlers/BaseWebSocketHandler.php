<?php 

namespace App\Websockets\Handlers;

use App\Models\User;
use App\Websockets\Channels\ChannelsManager;
use App\Websockets\Exceptions\AuthorizeException;
use BeyondCode\LaravelWebSockets\Apps\App;
use BeyondCode\LaravelWebSockets\QueryParameters;
use BeyondCode\LaravelWebSockets\WebSockets\Exceptions\UnknownAppKey;
use Laravel\Sanctum\PersonalAccessToken;
use Ratchet\ConnectionInterface;

use Ratchet\WebSocket\MessageComponentInterface;


abstract class BaseWebSocketHandler implements MessageComponentInterface
{
    
    
    public function onOpen(ConnectionInterface $connection)
    {
        
        
    $this->verifyAppKey($connection)->generateSocketId($connection);
 
    $tokenTxt=$connection->httpRequest->getHeader('token')[0];
    $token=PersonalAccessToken::findToken($tokenTxt);
        if($token&&!$token->tokenable->isBlocked){
          
            $connection->user=$token->tokenable;
        }
        if(!$this->authorized($connection)){
        
            $connection->close();
             throw new AuthorizeException();
         }
         
        // $connection->send('test');

    }

    protected function verifyAppKey(ConnectionInterface $connection)
    {
        $appKey = QueryParameters::create($connection->httpRequest)->get('appKey');

        if (! $app = App::findByKey($appKey)) {
            throw new UnknownAppKey($appKey);
        }

        $connection->app = $app;

        return $this;
    }


    protected function generateSocketId(ConnectionInterface $connection)
    {
        $socketId = sprintf('%d.%d', random_int(1, 1000000000), random_int(1, 1000000000));

        $connection->socketId = $socketId;

        return $this;
    }
 
    
    public function onClose(ConnectionInterface $connection)
    {
        ChannelsManager::removeAllSubscriptions($connection);

    }

    public function onError(ConnectionInterface $connection, \Exception $e)
    {

    }
    
    abstract public function authorized(ConnectionInterface $connection);
       
}