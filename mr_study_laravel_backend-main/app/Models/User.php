<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\HasApiTokens;
use App\Enums\UserRole;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Kreait\Laravel\Firebase\Facades\Firebase;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;


    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'firebase_id',
        'role',
        'position'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'firebase_id',
        'fcmToken',
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'role' => UserRole::class,
    ];

    public function student(){
        return $this->hasOne(Student::class);
    }
    public function programs(){
        return $this->hasMany(Program::class)->with(['educationLevel','educationYear','educationMajor']);
            }

    public function finishedLessons(){
        return $this->hasMany(QuizLessonStudent::class);
    }

    public function followers(){
        return $this->hasManyThrough(User::class,Follows::class,'followed_id','id','id','follower_id');
    }

    public function following(){
        return $this->hasManyThrough(User::class,Follows::class,'follower_id','id','id','followed_id');
    }

    public function blocks(){
        return $this->hasManyThrough(User::class,Blocks::class,'user_id','id','id','blocked_id');
    }
    public function blocked(){
        return $this->hasManyThrough(User::class,Blocks::class,'blocked_id','id','id','user_id');
    }

    public function notifications() {
        return $this->hasMany(Notification::class);
    }

    public function finishedQuizzes() {
        return $this->belongsToMany(Quiz::class,'finished_quizzes');
    }

    public function givenCourses() {
        return $this->hasMany(Course::class,'teacher_id');
    }

    public function subscribedCourses() {
        return $this->belongsToMany(Course::class,'course_subscribes')->with(['teacher','subject'])->withPivot('lectures_group_id');
    }

    public function finishedLectureQuizzes() {
        return $this->belongsToMany(LectureQuiz::class,'finished_lecture_quizzes');
    }

    public function getIamFollowingAttribute():bool{
        return $this->followers->map(fn($e)=>$e->id)->contains(request()->user()->id);
    }

    public function teacher(){
        return $this->hasOne(Teacher::class)->with('reviews','subject');
    }

    public function subscribeTopics(){

        $coursesTopic=$this->subscribedCourses->map(fn($e)=>"course-group-{$e->pivot->lectures_group_id}")->toArray();
        $massaging=Firebase::messaging();
        $program=$this->programs()->first();
        $programTopics=["level-{$program->education_level_id}","year-{$program->education_year_id}"];
        if($program->education_major_id){
            $programTopics[]="major-".$program->education_major_id;
        }
        $massaging->subscribeToTopics(['all','student',...$coursesTopic,...$programTopics],$this->fcmToken);

    }

    public function getTopicsAttribute(){
        $coursesTopic=$this->subscribedCourses->map(fn($e)=>"course-group-{$e->pivot->lectures_group_id}")->toArray();
        $otherTopics=['all','student'];
        $program=$this->programs()->first();
        $programTopics=["level-{$program->education_level_id}","year-{$program->education_year_id}"];
        if($program->education_major_id){
            $programTopics[]="major-".$program->education_major_id;
        }
       
        return [...$otherTopics,...$coursesTopic,...$programTopics];
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'users_permissions', 'user_id', 'permission_id');
    }

  
    
    public function transformItem(): array
    {

        return array(
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'position' => $this->position,
            'permissions' => $this->permissions->map(function ($p) {
                return json_decode($p->slugs);
            })->collapse()
        );
    }



    public function lastLogin(){
        return $this->hasOne(LoginLog::class,)->latestOfMany();
    }



    public function getQuizzesProgressAttribute(){
        $program=$this->programs->first();
        $allLessons=QuizLesson::whereHas('quiz',function($q)use($program){
            $q->where('education_level_id',$program->education_level_id)
            ->where('education_year_id',$program->education_year_id)->where('education_major_id',$program->education_major_id);
        })->count();

        $completedLessons=QuizLessonStudent::where('user_id',$this->id)->whereHas('lesson',function($q)use($program){
            $q->whereHas('quiz',function($q)use($program){
                $q->where('education_level_id',$program->education_level_id)
                ->where('education_year_id',$program->education_year_id)->where('education_major_id',$program->education_major_id);
                });
        })->count();
        
        $quizzesProgress=(int)($allLessons>0?($completedLessons/$allLessons)*100:0);
        

        return $quizzesProgress;
    }
}
