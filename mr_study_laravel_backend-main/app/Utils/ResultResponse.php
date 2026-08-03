<?php

namespace App\Utils;

use Illuminate\Contracts\Support\Responsable;

class ResultResponse implements Responsable{

    public $status;
    public $message;
    public $data;
    public $code;
    public $isSuccess;

    public function __construct($data, $message,  $code,$isSuccess,$status){
        $this->status = $status;
        $this->message = $message;
        $this->data = $data;
        $this->code = $code;
        $this->isSuccess = $isSuccess; 
    }

    public static function success($data = null, $message = 'success', $code = "SUCCESS", $isSuccess = true, $status = 200){
        return new self($data, $message, $code, $isSuccess, $status);
    }
    
    public static function error($data = null, $message = 'error', $code = "ERROR", $isSuccess = false, $status = 400){
        return new self($data, $message, $code, $isSuccess, $status);
     }
    public static function validationError($errors){
    
        $code=array_values($errors)[0][0];
        return new self(null, $code, $code, false, 400); 
        
    }
    //server error
    public static function serverError($data, $message = 'server error', $code = "SERVER_ERROR", $isSuccess = false, $status = 500){
        return new self(env('APP_DEBUG')? $data:null, $message, $code, $isSuccess, $status);
    }
      public function toResponse($request){
        return response()->json([
            'status' => $this->status,
            'message' => $this->message,
            'data' => $this->data,
            'code' => $this->code,
            'isSuccess' => $this->isSuccess
        ],$this->status);
    }   
    
}