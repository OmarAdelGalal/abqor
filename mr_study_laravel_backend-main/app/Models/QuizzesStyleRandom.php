<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizzesStyleRandom extends Model
{

    protected $guarded=[];

    use HasFactory;


    private const colors=[
        '3DAFC1',
        'F4C23B',
        'A75758',
        'F47C27',
        '1A9E93',
        '80B4DB',
        'FF6060',
    ];
    public function toStyle($day){
        return [

            "id"=>$this->id,
            "education_level_id"=>0,
            "education_year_id"=>0,
            "education_major_id"=>0,
            "term"=>0,
            "week"=>0,
            "day"=>$day,
            "color"=>fake()->randomElement(self::colors),
            "image"=>$this->image,
            "image_gray"=>$this->image,
            "created_at"=>$this->created_at,
            "updated_at"=>$this->updated_at,            
        ];
    }
}
