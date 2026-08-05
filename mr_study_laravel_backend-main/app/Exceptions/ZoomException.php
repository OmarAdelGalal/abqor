<?php

namespace App\Exceptions;

class ZoomException extends \Exception
{
    public $code;
    public $message;

    public function __construct($code, $message)
    {
        
        $this->code = $code;
        $this->message = $message;
    }
}