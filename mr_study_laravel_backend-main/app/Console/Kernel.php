<?php

namespace App\Console;

use App\Jobs\RefreshZoomToken;
use App\Jobs\SendRemindLectureNoti;
use App\Jobs\UseRemindNoti;
use App\Jobs\ZeroFlames;
use App\Models\Lecture;
use App\Models\Student;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // $schedule->command('inspire')->hourly();

        
        $schedule->call(function () {
            Student::where('health', '<', 7)-> increment('health', 1);
        })->everyThreeHours();
        

        // $schedule->call(function () {
        //     Student::query()->update(['health'=>5]);
        // })->daily();
        
        $schedule->call(function () {
            SendRemindLectureNoti::dispatch();
        })->everyFourMinutes();
        
        $schedule->call(function () {
            RefreshZoomToken::dispatch();
        })->everyFifteenMinutes();
       
        $schedule->call(function () {
            ZeroFlames::dispatch();
        })->dailyAt('23:58');

        // $schedule->call(function () {
        //     UseRemindNoti::dispatch(UseRemindNoti::FLAME_REMINDER);
        // })->dailyAt('20:00');

        // $schedule->call(function () {
        //     UseRemindNoti::dispatch(UseRemindNoti::MINUTES515);
        // })->dailyAt('23:45');

        // $schedule->call(function () {
        //     UseRemindNoti::dispatch(UseRemindNoti::MINUTES5);
        // })->twiceDaily(12, 18);

        $schedule->command('telescope:prune')->weekly();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
