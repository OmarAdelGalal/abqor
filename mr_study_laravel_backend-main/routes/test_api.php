<?php

use Illuminate\Support\Facades\Route;

Route::get('/my-test-route', function () {
    return 'HELLO FROM LOCAL BACKEND';
});
