<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatRoom extends Model
{
    protected $fillable=['name','description'];
    use HasFactory;
    public function messages()
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function lastMessage():Attribute
    {
        return Attribute::get(function() {
             $msg=$this->messages()->with('sender')->latest()->first();
             if($msg){
                $msg->append('sent');
                 return $msg;
             }
             return null;
        });
    }
}
