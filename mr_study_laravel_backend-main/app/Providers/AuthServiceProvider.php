<?php

namespace App\Providers;

// use Illuminate\Support\Facades\Gate;

use App\Enums\PricingPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        
        Gate::define('own-lecture',
        fn($user,$lecture) => $user->id == $lecture->course->teacher_id);
  
        Gate::define('student-sub-lecture',
        function ($user, $lecture) {
            $course = $lecture?->group?->course;

            if (!$course) {
                return false;
            }

            if ($course->pricing_policy === PricingPolicy::FREE->value) {
                return true;
            }

            return $course->subscribes()
                ->where('users.id', $user->id)
                ->wherePivot('lectures_group_id', $lecture->lectures_group_id)
                ->exists();
        });
        Gate::define('student-sub-course',
        fn($user,$course) => $user->subscribedCourses()->find($course->id)!=null);

    }
}
