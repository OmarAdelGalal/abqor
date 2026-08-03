<?php

use App\Http\Controllers\Admin\ZoomController;
use App\Http\Controllers\PagesContoller;
use App\Websockets\Handlers\ChatWebSocket;
use BeyondCode\LaravelWebSockets\Facades\WebSocketsRouter;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return 'hello world PAGEZ';
});

// Backward-compatibility: older/mobile links may point to /meeting, but the Zoom web client is served at /std_zoom/.
Route::get('/meeting/{any?}', fn () => redirect('/std_zoom/'))->where('any', '.*');




Route::prefix('zoom')->group(function () {
    Route::get('redirect', [ZoomController::class, 'redirectToZoom'])->middleware('auth');
    Route::get('callback', [ZoomController::class, 'handleZoomCallback']);


});


Route::view('meeting_leave', 'meeting_leave');





Route::get('/login', [PagesContoller::class,'telescopeLogin'])->name('login');
Route::post('/login', [PagesContoller::class,'telescopeLogin']);


Route::get('/terms',[PagesContoller::class,'terms']);

WebSocketsRouter::webSocket('ws/chat',ChatWebSocket::class);


Route::get('/download_app', fn()=>redirect('https://abqor.com/'));

Route::get('/in_app/{any}',fn()=>redirect()->route('downloadapp'))->where('any','.*');


Route::view('youtube', 'youtube');

// YouTube Video Player (signed URL, one-time token)
Route::get('/video-player/{token}', [\App\Http\Controllers\Students\YoutubePlayerController::class, 'renderPlayer'])
    ->name('youtube.player')
    ->middleware('signed');
