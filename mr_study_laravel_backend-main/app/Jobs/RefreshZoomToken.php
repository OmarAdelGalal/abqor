<?php

namespace App\Jobs;

use App\Helpers\ZoomHelper;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RefreshZoomToken implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 0;
    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        ZoomHelper::refreshToken();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        //
    }
}
