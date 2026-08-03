<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OtpCode extends Model
{
    use HasFactory;

    protected $guarded=[];
    //generate random code
    public static function genCode(){
        $code='';
        for($i=0;$i<4;$i++){
            $code = $code . (string) random_int(0,9);
        }
        return $code;
    }
    public function pendingStudent(){
        return $this->hasOne(PendingStudent::class);
    }
}
