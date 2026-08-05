<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Enums\UserRole;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Kreait\Laravel\Firebase\Facades\Firebase;

class Permission extends Authenticatable
{
    use HasFactory;



    protected $table = 'permissions';
    protected $fillable = ['name', 'slugs'];

    public function getSlugsAttribute()
    {
        return json_decode($this->attributes['slugs']);
    }

}
