<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    protected $guarded = ['id'];
    protected $appends=['sent_at'];
    use HasFactory;

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function getSentAtAttribute(){
        return $this->created_at;
    }

    public function sent():Attribute{
        return Attribute::get(fn()=>request()->user()->id==$this->sender_id);
    }

}
