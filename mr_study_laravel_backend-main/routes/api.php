<?php

use App\Enums\LectureType;
use App\Exceptions\ZoomException;
use App\Helpers\ZoomHelper;
use App\Http\Controllers\Admin\AboutMePageController;
use App\Http\Controllers\Admin\AdminAppConfigController;
use App\Http\Controllers\Admin\AdminChatRoomsController;
use App\Http\Controllers\Admin\AdminCoursesController;
use App\Http\Controllers\Admin\AdminGeneralController;
use App\Http\Controllers\Admin\AdminLecturesController;
use App\Http\Controllers\Admin\AdminLecturesGroupsController;
use App\Http\Controllers\Admin\AuthAdminController;
use App\Http\Controllers\Admin\BooksAdminController;
use App\Http\Controllers\Admin\CoursesReviewController;
use App\Http\Controllers\Admin\EducationLevelsController;
use App\Http\Controllers\Admin\EducationMajorsController;
use App\Http\Controllers\Admin\EducationSubjectsController;
use App\Http\Controllers\Admin\EducationYearsController;
use App\Http\Controllers\Admin\HelpCenterController;
use App\Http\Controllers\Admin\LectureQuizzesController;
use App\Http\Controllers\Admin\QuizzesManagementController;
use App\Http\Controllers\Admin\QuizzesStylesController;
use App\Http\Controllers\Admin\StatisticsController;
use App\Http\Controllers\Admin\TeachersManagementController;
use App\Http\Controllers\Admin\TermsController;
use App\Http\Controllers\Admin\UsersManagementController;
use App\Http\Controllers\Admin\ZoomController;
use App\Http\Controllers\Common\AccountManagementController;
use App\Http\Controllers\Common\AuthController;
use App\Http\Controllers\Common\ChatController;
use App\Http\Controllers\Student\GeneralController;
use App\Http\Controllers\Students\AuthStudentsController;
use App\Http\Controllers\Students\ProfileController;
use App\Http\Controllers\Students\QuizzesController;
use App\Http\Controllers\Students\StudentAccountManagementController;
use App\Http\Controllers\Students\StudentsCourseController;
use App\Http\Controllers\Students\E2EEController;
use App\Http\Controllers\Teacher\AuthTeacherController;
use App\Http\Controllers\Teacher\TeacherCoursesController;
use App\Http\Controllers\Admin\AdminManagementController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\Admin\AdminStudentsController;
use App\Http\Controllers\Admin\QuestionsBanksController;
use App\Http\Controllers\Admin\BacPageController;
use App\Http\Controllers\Admin\NotificationsController;
use App\Http\Controllers\Admin\StudyWithMePageController;
use App\Http\Controllers\Admin\SystemNotificationsController;
use App\Jobs\DownloadZoomRecording;
use App\Models\Lecture;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Nette\Utils\Strings;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


Route::get('/', function (Request $request) {

    // Storage::disk('local')->delete("lectures/zoom_recording_06-11-2024_14-23-3017ff0502-a3e4-4cfa-b321-0af6a90e5ef3.MP4");
    // ZoomHelper::downloadRecording('83811022646');
    // DownloadZoomRecording::dispatch(Lecture::find(1));
});

// Video streaming route with signed URL (no auth header needed - for direct video player)
Route::get('stream-video/{record}', [\App\Http\Controllers\Students\RecordedLectureController::class, 'streamVideo'])
    ->name('video.stream')
    ->whereNumber('record');

// Video decrypt endpoint (called from player page JS, protected by nonce)
Route::post('video-decrypt', [\App\Http\Controllers\Students\YoutubePlayerController::class, 'decryptVideoId']);
Route::post('video-progress', [\App\Http\Controllers\Students\YoutubePlayerController::class, 'updateVideoProgress']);

// Zero-Visibility Playback: Session key handshake (requires auth + device binding)
Route::middleware(['auth:sanctum', 'abilities:student', 'device.policy'])->group(function () {
    Route::post('video/handshake', [\App\Http\Controllers\Students\YoutubePlayerController::class, 'handshake']);
});

//students routes
Route::prefix('user')->group(function () {
    //auth
    Route::prefix('auth')->group(function () {
        Route::post('register_by_phone', [AuthStudentsController::class, 'registerByPhone']);
        Route::post('verify_register_otp', [AuthStudentsController::class, 'verifyRegisterOtp']);
        Route::post('check_otp', [AuthStudentsController::class, 'checkOtp']);
        Route::post('login', [AuthStudentsController::class, 'login']);
        Route::post('register_by_firebase', [AuthStudentsController::class, 'registerByFirebase']);
        Route::post('login_by_firebase', [AuthStudentsController::class, 'loginByFirebase']);
        Route::post('forgot_password', [AuthController::class, 'forgotPassword']);
        Route::post('reset_password', [AuthController::class, 'resetPassword']);
        Route::post('auto_login', [AuthStudentsController::class, 'autoLogin']);
        Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
        Route::post('check_user', [AuthStudentsController::class, 'checkUser']);
        Route::get('education_levels', [AuthStudentsController::class, 'getEducationLevels']);
        Route::get('education_years', [AuthStudentsController::class, 'getEducationYears']);
        Route::get('education_majors', [AuthStudentsController::class, 'getEducationMajors']);

    });

    //quizzes
    Route::prefix('quizzes')->group(function () {

        Route::get('guest/{term}/{week}', [QuizzesController::class, 'getQuizzesGuest'])->whereNumber('term')->whereNumber('week');
        Route::get('/{lesson}', [QuizzesController::class, 'getLesson'])->whereNumber('lesson');

    });




    Route::prefix('general')->group(function () {
        Route::get('app_reviews/{type}/{id}', [GeneralController::class, 'getAppReviews'])->whereIn('type', ['teacher', 'book'])->whereNumber('id');
        Route::get('book_reviews/{book}', [GeneralController::class, 'bookReviews'])->whereNumber('book');
        Route::get('teacher_reviews/{teacher}', [GeneralController::class, 'teacherReviews'])->whereNumber('teacher');
        Route::get('teachers', [GeneralController::class, 'getTeachers']);
        Route::get('books', [GeneralController::class, 'getBooks']);
        Route::get('terms', [GeneralController::class, 'getTerms']);
        Route::get('about', [GeneralController::class, 'aboutUs']);
        Route::get('help_center', [GeneralController::class, 'helpCenter']);
        Route::get('app_config', [GeneralController::class, 'getAppConfig']);
        Route::get('teachers_by_subject', [GeneralController::class, 'getTeachersBySubject']);
        Route::get('pay_info', [GeneralController::class, 'getPayInfo']);

    });

    //courses
    Route::prefix('courses')->group(function () {
        Route::get('/', [StudentsCourseController::class, 'index']);

    });
    Route::middleware(['auth:sanctum', 'abilities:student', 'device.policy'])->group(function () {
        Route::prefix('auth/e2ee')->group(function () {
            Route::get('server-public-key', [E2EEController::class, 'serverPublicKey']);
            Route::post('register', [E2EEController::class, 'register']);
        });

        //account
        Route::prefix('account')->group(function () {
            Route::get('/', [StudentAccountManagementController::class, 'getUserProfile']);

            Route::post('change_password', [AccountManagementController::class, 'changePassword']);
            Route::get('account_view', [StudentAccountManagementController::class, 'accountView']);
            Route::put('update_profile', [StudentAccountManagementController::class, 'updateProfile']);
            Route::post('change_avatar', [AccountManagementController::class, 'changeAvatar']);
            Route::post('delete_account', [StudentAccountManagementController::class, 'deleteAccount']);
            Route::post('change_email', [StudentAccountManagementController::class, 'changeEmail']);
            Route::post('verify_email_change', [StudentAccountManagementController::class, 'verifyEmailChangeOtp']);
            Route::post('update_fcm_token', [StudentAccountManagementController::class, 'updateFcmToken']);
            Route::post('update_program', [StudentAccountManagementController::class, 'updateProgram']);
            Route::get('ranking', [StudentAccountManagementController::class, 'getRanking']);
        });

        // ! deprecated
        //profile
        // Route::prefix('profile')->group(function () {
        //     Route::get('/',[ProfileController::class,'getUserProfile']);
        //     Route::get('/{user}',[ProfileController::class,'getProfile'])->whereNumber('user');
        //     Route::post('follow/{user}',[ProfileController::class,'toggleFollow']);
        //     Route::get('suggested_friends',[ProfileController::class,'getSuggestedFriends']);
        //     Route::post('find_contacts',[ProfileController::class,'findContacts']);
        //     Route::post('block/{user}',[ProfileController::class,'blockUser'])->whereNumber('user');
        //     Route::post('report/{user}',[ProfileController::class,'reportUser'])->whereNumber('user');
        //     Route::get('search_friends',[ProfileController::class,'searchFriends']);
        // });

        Route::prefix('general')->group(function () {
            Route::get('bac_time', [GeneralController::class, 'bacTime']);

            Route::get('notifications', [GeneralController::class, 'getNotifications']);


        });


        //quizzes
        Route::prefix('quizzes')->group(function () {
            Route::get('/{term}/{week}', [QuizzesController::class, 'getQuizzes'])->whereNumber('term')->whereNumber('week');
            // Route::post('finish_quiz/{quiz}',[QuizzesController::class,'finishQuiz'])->whereNumber('quiz');
            Route::post('finish_lesson/{lesson}', [QuizzesController::class, 'finishLesson'])->whereNumber('lesson');
            Route::put('decrement_health', [QuizzesController::class, 'decrementHealth']);
            Route::put('increment_health', [QuizzesController::class, 'incrementHealth']);
            Route::get('weeks', [QuizzesController::class, 'getWeeks']);
        });

        //courses
        Route::prefix('courses')->group(function () {
            Route::get('get_reviews/{course}', [StudentsCourseController::class, 'getCourseReviews'])->whereNumber('course');
            Route::get('lectures_group/{type}/{course}', [StudentsCourseController::class, 'showLecturesGroup'])->whereIn('type', LectureType::values())->whereNumber('course');
            Route::get('/{course}', [StudentsCourseController::class, 'show'])->whereNumber('course');
            Route::get('link/{link}', [StudentsCourseController::class, 'showByLink']);
            Route::get('pay_info/{course}', [StudentsCourseController::class, 'getPayInfo'])->whereNumber('course');

            Route::get('my_courses', [StudentsCourseController::class, 'myCourses']);
            Route::post('meeting/{lecture}', [StudentsCourseController::class, 'getMeeting'])->middleware('validate.e2ee')->whereNumber('lecture');
            Route::post('meeting/{lecture}/passcode', [StudentsCourseController::class, 'unwrapPasscode'])->whereNumber('lecture');
            Route::post('meeting/{lecture}/passcode/e2ee', [StudentsCourseController::class, 'unwrapPasscodeE2EE'])->middleware('validate.e2ee')->whereNumber('lecture');
            Route::get('record/{lecture}', [StudentsCourseController::class, 'downloadLectureRecord'])->whereNumber('lecture');
            Route::post('recorded-lecture-path', [\App\Http\Controllers\Students\RecordedLectureController::class, 'getRecordedLecturePath']);
            Route::post('youtube-lecture', [\App\Http\Controllers\Students\YoutubePlayerController::class, 'getYoutubeLectureUrl']);
            Route::get('questions/{quiz}', [StudentsCourseController::class, 'getQuestions'])->whereIn('type', ['course', 'lecture'])->whereNumber('id');
            Route::post('finish/{quiz}', [StudentsCourseController::class, 'finishLecture'])->whereNumber('group');
            Route::get('lecture_pdf/{lecture}', [StudentsCourseController::class, 'getLecturePdf'])->whereNumber('lecture');
            Route::get('get_pdf/{course}', [StudentsCourseController::class, 'getPdf'])->whereNumber('course');
        });

        Route::prefix('chat')->group(function () {
            Route::get('', [ChatController::class, 'getRooms']);
            Route::get('{room}', [ChatController::class, 'getRoomMessages'])->whereNumber('room');
        });
    });

});



//admin routes
Route::prefix('admin')->group(function () {
    //auth
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthAdminController::class, 'login']);
        Route::get('me', [AuthController::class, 'me']);

    });


    Route::middleware(['auth:sanctum', 'abilities:admin'])->group(function () {

        Route::prefix('admins')->middleware('ability:all,admins')->group(function () {
            Route::get('/', [AdminManagementController::class, 'index']);
            Route::get('/{user}', [AdminManagementController::class, 'show'])->whereNumber('user');
            Route::get('all_permissions', [AdminManagementController::class, 'getAllPermissions']);
            Route::post('', [AdminManagementController::class, 'store']);
            Route::put('/{user}', [AdminManagementController::class, 'updateAdmin'])->whereNumber('user');
            Route::post('/block/{user}', [AdminManagementController::class, 'deleteAdmin'])->whereNumber('user');
        });

        Route::prefix('general')->group(function () {
            Route::get('filters', [AdminGeneralController::class, 'filters']);
        });


        Route::prefix('statistics')->group(function () {
            Route::get('home', [StatisticsController::class, 'homeStatistics']);


            Route::middleware('ability:all,statistics')->group(function () {
                //todo: other routes here
                Route::get('std_counts', [StatisticsController::class, 'studentCountsStatistics']);
                Route::get('courses', [StatisticsController::class, 'coursesReport']);
                Route::get('students', [StatisticsController::class, 'studentsReport']);

            });
        });

        Route::middleware('ability:all,education_levels')->group(function () {


            Route::prefix('education_levels')->group(function () {
                Route::post('', [EducationLevelsController::class, 'store']);
                Route::post('update/{level}', [EducationLevelsController::class, 'update'])->whereNumber('level');
                Route::delete('{level}', [EducationLevelsController::class, 'destroy'])->whereNumber('level');
                Route::get('', [EducationLevelsController::class, 'index']);
                Route::get('{level}', [EducationLevelsController::class, 'show'])->whereNumber('level');
            });

            Route::prefix('education_years')->group(function () {
                Route::post('', [EducationYearsController::class, 'store']);
                Route::post('update/{year}', [EducationYearsController::class, 'update'])->whereNumber('year');
                Route::delete('{year}', [EducationYearsController::class, 'destroy'])->whereNumber('year');
                Route::get('', [EducationYearsController::class, 'index']);
                Route::get('{year}', [EducationYearsController::class, 'show'])->whereNumber('year');
            });

            //education_majors
            Route::prefix('education_majors')->group(function () {
                Route::post('', [EducationMajorsController::class, 'store']);
                Route::post('update/{major}', [EducationMajorsController::class, 'update'])->whereNumber('major');
                Route::delete('{major}', [EducationMajorsController::class, 'destroy'])->whereNumber('major');
                Route::get('', [EducationMajorsController::class, 'index']);
                Route::get('{major}', [EducationMajorsController::class, 'show'])->whereNumber('major');
            });



            //subject
            Route::prefix('subjects')->group(function () {
                Route::post('', [EducationSubjectsController::class, 'store']);
                Route::get('{subject}', [EducationSubjectsController::class, 'show'])->whereNumber('subject');
                Route::post('{subject}', [EducationSubjectsController::class, 'update'])->whereNumber('subject');
                Route::delete('{subject}', [EducationSubjectsController::class, 'destroy'])->whereNumber('subject');
                Route::get('', [EducationSubjectsController::class, 'index']);
            });

        });


        //account
        Route::prefix('system_notifications')->group(function () {
            Route::get('', [SystemNotificationsController::class, 'index']);
        });
        Route::prefix('profile')->group(function () {
            Route::get('', [AdminProfileController::class, 'getProfile']);
            Route::post('change_password', [AccountManagementController::class, 'changePassword']);
            Route::put('update_profile', [AdminProfileController::class, 'updateProfile']);
            Route::post('change_avatar', [AccountManagementController::class, 'changeAvatar']);

        });
        //teachers
        Route::prefix('teachers')->middleware('ability:all,teachers')->group(function () {
            Route::post('create', [TeachersManagementController::class, 'createTeacher']);
            Route::get('/{user}', [TeachersManagementController::class, 'getTeacher'])->whereNumber('user');
            Route::post('/update/{user}', [TeachersManagementController::class, 'updateTeacher'])->whereNumber('user');
            Route::get('/all', [TeachersManagementController::class, 'all']);
            Route::get('/', [TeachersManagementController::class, 'index']);
            Route::post('/set_status/{user}', [TeachersManagementController::class, 'setStatus'])->whereNumber('user');
            Route::post('/financial_info/{user}', [TeachersManagementController::class, 'financialInfo'])->whereNumber('user');
            Route::post('create_review/{user}', [TeachersManagementController::class, 'createReview'])->whereNumber('book');
            Route::get('get_reviews/{user}', [TeachersManagementController::class, 'getReviews'])->whereNumber('book');
            Route::delete('delete_review/{review}', [TeachersManagementController::class, 'destroyReview'])->whereNumber('review');

        });

        Route::prefix('questions_banks')->middleware('ability:all,questions_banks')->group(function () {
            Route::post('', [QuestionsBanksController::class, 'store']);
            Route::put('{bank}', [QuestionsBanksController::class, 'update'])->whereNumber('bank');
            Route::delete('{bank}', [QuestionsBanksController::class, 'destroy'])->whereNumber('bank');
            Route::get('', [QuestionsBanksController::class, 'index']);
            Route::get('{bank}', [QuestionsBanksController::class, 'show'])->whereNumber('bank');
            Route::post('create_question', [QuestionsBanksController::class, 'createQuestion']);
            Route::post('update_question/{question}', [QuestionsBanksController::class, 'updateQuestion'])->whereNumber('question');
            Route::delete('delete_question/{question}', [QuestionsBanksController::class, 'deleteQuestion'])->whereNumber('question');
            Route::get('get_question/{question}', [QuestionsBanksController::class, 'showQuestion'])->whereNumber('question');
            Route::post('set_archive/{question}', [QuestionsBanksController::class, 'setArchive'])->whereNumber('question');
            Route::post('copy_question/{question}', [QuestionsBanksController::class, 'copyQuestion'])->whereNumber('question');
            Route::post('update_priorities', [QuestionsBanksController::class, 'updatePriorities']);
        });


        //quizzes styles
        Route::prefix('quizzes_styles')->middleware('ability:all,quizzes_styles')->group(function () {
            Route::post('launch_random_mode', [QuizzesStylesController::class, 'launchRandomMode']);
            Route::post('stop_random_mode', [QuizzesStylesController::class, 'stopRandomMode']);
            Route::post('', [QuizzesStylesController::class, 'store']);
            Route::post('update/{style}', [QuizzesStylesController::class, 'update'])->whereNumber('style');
            Route::delete('{style}', [QuizzesStylesController::class, 'destroy'])->whereNumber('style');
            Route::get('', [QuizzesStylesController::class, 'index']);
            Route::get('{style}', [QuizzesStylesController::class, 'show'])->whereNumber('style');
        });
        //quizzes
        Route::prefix('quizzes')->middleware('ability:all,quizzes')->group(function () {
            Route::post('create', [QuizzesManagementController::class, 'createQuiz']);
            Route::delete('/{quiz}', [QuizzesManagementController::class, 'deleteQuiz'])->whereNumber('quiz');
            Route::get('/{quiz}', [QuizzesManagementController::class, 'show'])->whereNumber('quiz');
            Route::post('update/{quiz}', [QuizzesManagementController::class, 'updateQuiz'])->whereNumber('quiz');
            Route::get('/', [QuizzesManagementController::class, 'getQuizzes']);

        });

        Route::prefix('notifications')->middleware('ability:all,notifications')->group(function () {
            Route::get('', [NotificationsController::class, 'index']);
            Route::post('send', [NotificationsController::class, 'sendNotification']);
            Route::delete('{notification}', [NotificationsController::class, 'destroy'])->whereNumber('notifications');

        });
        // ! deprecated
        Route::prefix('users')->group(function () {
            Route::get('reports', [UsersManagementController::class, 'getReports']);
            Route::post('block/{user}', [UsersManagementController::class, 'blockUser'])->whereNumber('user');
            Route::post('unblock/{user}', [UsersManagementController::class, 'unblockUser'])->whereNumber('user');
            Route::put('review_report/{report}', [UsersManagementController::class, 'reviewReport'])->whereNumber('report');
            Route::get('/', [UsersManagementController::class, 'getUsers']);
            Route::post('/', [UsersManagementController::class, 'store']);
        });


        Route::prefix('help_center')->middleware('ability:all,help_center')->group(function () {
            Route::get('', [HelpCenterController::class, 'index']);
            Route::post('', [HelpCenterController::class, 'store']);
            Route::get('{question}', [HelpCenterController::class, 'show'])->whereNumber('question');
            Route::put('{question}', [HelpCenterController::class, 'update'])->whereNumber('question');
            Route::delete('{question}', [HelpCenterController::class, 'destroy'])->whereNumber('question');
        });


        Route::prefix('app_config')->middleware('ability:all,app_config')->group(function () {
            Route::get('', [AdminAppConfigController::class, 'getAppConfig']);
            Route::put('', [AdminAppConfigController::class, 'updateAppConfig']);
        });
        Route::prefix('books')->middleware('ability:all,books')->group(function () {
            Route::get('', [BooksAdminController::class, 'index']);
            Route::post('', [BooksAdminController::class, 'store']);
            Route::get('{book}', [BooksAdminController::class, 'show'])->whereNumber('book');
            Route::post('update/{book}', [BooksAdminController::class, 'update'])->whereNumber('book');
            Route::post('set_status/{book}', [BooksAdminController::class, 'setStatus'])->whereNumber('book');
            Route::delete('{book}', [BooksAdminController::class, 'destroy'])->whereNumber('book');
            Route::post('create_review/{book}', [BooksAdminController::class, 'createReview'])->whereNumber('book');
            Route::get('get_reviews/{book}', [BooksAdminController::class, 'getReviews'])->whereNumber('book');
            Route::delete('delete_review/{review}', [BooksAdminController::class, 'destroyReview'])->whereNumber('review');

        });
        // ! deprecated
        // Route::prefix('chat_rooms')->group(function(){
        //     Route::get('',[AdminChatRoomsController::class,'index']);
        //     Route::post('',[AdminChatRoomsController::class,'store']);
        //     Route::get('{room}',[AdminChatRoomsController::class,'show'])->whereNumber('room');
        //     Route::put('{room}',[AdminChatRoomsController::class,'update'])->whereNumber('room');
        //     Route::put('toggle_active/{room}',[AdminChatRoomsController::class,'toggleActive'])->whereNumber('room');
        // });

        //courses
        Route::middleware('ability:all,courses')->group(function () {
            Route::prefix('courses')->group(function () {
                Route::get('', [AdminCoursesController::class, 'index']);

                Route::post('create', [AdminCoursesController::class, 'createCourse']);
                // Route::post('',[AdminCoursesController::class,'store']);
                Route::get('{course}', [AdminCoursesController::class, 'show'])->whereNumber('course');
                Route::post('{course}', [AdminCoursesController::class, 'update'])->whereNumber('course');
                Route::post('publish/{course}', [AdminCoursesController::class, 'publish'])->whereNumber('course');
                Route::post('pricing/{course}', [AdminCoursesController::class, 'pricing'])->whereNumber('course');
                Route::post('pdf/{course}', [AdminCoursesController::class, 'uploadPdf'])->whereNumber('course');
                Route::get('pdf/{course}', [AdminCoursesController::class, 'getPdf'])->whereNumber('course');
                Route::post('video/{course}', [AdminCoursesController::class, 'uploadVideo'])->whereNumber('course');
                Route::get('subscribed_students/{course}', [AdminCoursesController::class, 'subscribedStudents'])->whereNumber('course');
            });

            Route::prefix('lectures_groups')->group(function () {
                Route::post('', [AdminLecturesGroupsController::class, 'create']);
                Route::get('{group}', [AdminLecturesGroupsController::class, 'show'])->whereNumber('group');
                Route::put('{group}', [AdminLecturesGroupsController::class, 'update'])->whereNumber('group');
                Route::delete('{group}', [AdminLecturesGroupsController::class, 'destroy'])->whereNumber('group');
                Route::get('course_groups/{course}', [AdminLecturesGroupsController::class, 'getGroupsByCourse'])->whereNumber('course');
                Route::post('subscribe/{group}', [AdminLecturesGroupsController::class, 'subscribeUser'])->whereNumber('group');
                Route::post('unsubscribe/{group}', [AdminLecturesGroupsController::class, 'unsubscribeUser'])->whereNumber('group');
                Route::get('subscribers/{group}', [AdminLecturesGroupsController::class, 'groupSubscribers'])->whereNumber('group');
            });
            Route::prefix('lectures')->group(function () {
                Route::post('', [AdminLecturesController::class, 'store']);
                Route::get('{lecture}', [AdminLecturesController::class, 'show'])->whereNumber('lecture');
                Route::get('group_lectures/{group}', [AdminLecturesController::class, 'getLecturesByGroup'])->whereNumber('group');
                Route::post('update/{lecture}', [AdminLecturesController::class, 'update'])->whereNumber('lecture');
                Route::put('schedule/{lecture}', [AdminLecturesController::class, 'scheduleLecture'])->whereNumber('lecture');
                Route::delete('{lecture}', [AdminLecturesController::class, 'destroy'])->whereNumber('lecture');
                Route::post('pdf/{lecture}', [AdminLecturesController::class, 'uploadPdf'])->whereNumber('lecture');
                Route::get('pdf/{lecture}', [AdminLecturesController::class, 'getPdf'])->whereNumber('lecture');
                Route::post('download_zoom/{lecture}', [AdminLecturesController::class, 'downloadFromZoom'])->whereNumber('lecture');
                Route::post('upload_record/{lecture}', [AdminLecturesController::class, 'uploadRecord'])->whereNumber('lecture');
                Route::get('questions_banks', [AdminLecturesController::class, 'questionsBanksList']);

                // YouTube video management
                Route::post('youtube/{lecture}', [AdminLecturesController::class, 'setYoutubeVideo'])->whereNumber('lecture');
                Route::get('youtube/{lecture}', [AdminLecturesController::class, 'getYoutubeVideo'])->whereNumber('lecture');
                Route::delete('youtube/{lecture}', [AdminLecturesController::class, 'removeYoutubeVideo'])->whereNumber('lecture');
            });

            // ! deprecated
            Route::prefix('lectures_quizzes')->group(function () {
                Route::post('', [LectureQuizzesController::class, 'store']);
                Route::get('{quiz}', [LectureQuizzesController::class, 'show'])->whereNumber('quiz');
                Route::get('questions/{quiz}', [LectureQuizzesController::class, 'getQuestions'])->whereNumber('quiz');
                Route::put('{quiz}', [LectureQuizzesController::class, 'update'])->whereNumber('quiz');
                Route::get('course_quizzes/{course}', [LectureQuizzesController::class, 'courseQuizzes'])->whereNumber('course');
            });



            Route::prefix('courses_reviews')->group(function () {
                Route::get('{course}', [CoursesReviewController::class, 'index'])->whereNumber('course');
                Route::delete('{review}', [CoursesReviewController::class, 'destroy'])->whereNumber('review');
                Route::post('{course}', [CoursesReviewController::class, 'store'])->whereNumber('course');
            });
        });

        Route::prefix('students')->middleware('ability:all,students')->group(function () {
            Route::get('', [AdminStudentsController::class, 'index']);
            Route::get('{user}', [AdminStudentsController::class, 'show'])->whereNumber('user');
            Route::delete('{user}', [AdminStudentsController::class, 'deleteUser'])->whereNumber('user');
            Route::post('update/{user}', [AdminStudentsController::class, 'update'])->whereNumber('user');
            Route::post('change_avatar/{user}', [AdminStudentsController::class, 'changeAvatar'])->whereNumber('user');
            Route::post('block/{user}', [AdminStudentsController::class, 'blockUser'])->whereNumber('user');
            Route::post('unblock/{user}', [AdminStudentsController::class, 'unblockUser'])->whereNumber('user');
            Route::post('subscribe_course', [AdminStudentsController::class, 'subscribeUser']);
            Route::post('unsubscribe_course', [AdminStudentsController::class, 'unsubscribeUser']);
            Route::get('course_list', [AdminStudentsController::class, 'allCourses']);
            Route::post('create', [AdminStudentsController::class, 'createStudentByAdmin']);


        });
        Route::prefix('bac')->middleware('ability:all,bac')->group(function () {
            Route::get('get_data', [BacPageController::class, 'getData']);
            Route::post('set_dates', [BacPageController::class, 'setDates']);
            Route::post('add_course/{course}', [BacPageController::class, 'addCourse']);
            Route::post('remove_course/{course}', [BacPageController::class, 'removeCourse']);
            Route::get('filter_courses', [BacPageController::class, 'filterCourses']);
        });

        Route::prefix('study_with_me')->middleware('ability:all,study_with_me')->group(function () {
            Route::post('set_link', [StudyWithMePageController::class, 'setLink']);
            Route::get('get_link', [StudyWithMePageController::class, 'getLink']);
            Route::post('disable_stream', [StudyWithMePageController::class, 'disableStream']);
            Route::get('get_messages', [StudyWithMePageController::class, 'getMessages']);
            Route::post('clear_chat', [StudyWithMePageController::class, 'clearChat']);
            Route::delete('delete_message/{message}', [StudyWithMePageController::class, 'deleteMsg']);

        });

        Route::prefix('terms')->middleware('ability:all,terms')->group(function () {
            Route::get('', [TermsController::class, 'index']);
            Route::post('', [TermsController::class, 'store']);
            Route::post('update_titles', [TermsController::class, 'updateTitles']);
            Route::get('{term}', [TermsController::class, 'show'])->whereNumber('term');
            Route::put('{term}', [TermsController::class, 'update'])->whereNumber('term');
            Route::delete('{term}', [TermsController::class, 'destroy'])->whereNumber('term');
        });

        Route::prefix('about_us')->middleware('ability:all,about_us')->group(function () {
            Route::get('', [AboutMePageController::class, 'index']);
            Route::post('', [AboutMePageController::class, 'store']);
            Route::post('create_member', [AboutMePageController::class, 'createTeamMember']);
            Route::post('update_titles', [AboutMePageController::class, 'updateTitles']);
            Route::get('{title}', [AboutMePageController::class, 'show'])->whereNumber('title');
            Route::put('{title}', [AboutMePageController::class, 'update'])->whereNumber('title');
            Route::delete('{title}', [AboutMePageController::class, 'destroy'])->whereNumber('title');
            Route::delete('delete_member/{member}', [AboutMePageController::class, 'deleteMember'])->whereNumber('member');
        });
    });
});

// ! deprecated
//!teacher routes
Route::prefix('teacher')->group(function () {
    //auth
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthTeacherController::class, 'login']);
        Route::post('forgot_password', [AuthController::class, 'forgotPassword']);
        Route::post('reset_password', [AuthController::class, 'resetPassword']);
    });
    Route::middleware(['auth:sanctum', 'abilities:teacher'])->group(function () {
        //account
        Route::prefix('account')->group(function () {
            Route::post('change_password', [AccountManagementController::class, 'changePassword']);
        });

        //courses
        Route::prefix('courses')->group(function () {
            Route::get('', [TeacherCoursesController::class, 'index']);
            Route::get('{course}', [TeacherCoursesController::class, 'show'])->whereNumber('course');
            Route::put('live_lecture/{lecture}', [TeacherCoursesController::class, 'liveLecture'])->whereNumber('lecture');
            Route::put('finish_lecture/{lecture}', [TeacherCoursesController::class, 'finishLecture'])->whereNumber('lecture');
            Route::get('generate_token/{lecture}', [TeacherCoursesController::class, 'generateRtcToken'])->whereNumber('lecture');
        });


    });
});


Route::prefix('zoom')->group(function () {

    Route::prefix('webhook')->group(function () {
        Route::post('meetings', [ZoomController::class, 'meetingsWebHook']);
        Route::post('recordings', [ZoomController::class, 'recordingsWebHook']);
    });
});

Route::get('/ai-subscribe-user', function (\Illuminate\Http\Request $request) {
    $email = $request->get('email', 'john.doe@0example.com');
    $user = \App\Models\User::where('email', $email)->first();
    
    if (!$user) {
        return response()->json(['success' => false, 'message' => 'User not found for email: ' . $email]);
    }
    
    // Subscribe to course 26
    $courseId = 26;
    $course = \App\Models\Course::find($courseId);
    if (!$course) return response()->json(['success' => false, 'message' => 'Course 26 not found']);
    
    $isSubscribed = $course->subscribes()->where('user_id', $user->id)->exists();
    if ($isSubscribed) {
        return response()->json(['success' => true, 'message' => 'User is already subscribed', 'user' => $user->id]);
    }
    
    $group = \App\Models\LecturesGroup::where('course_id', $courseId)->first();
    if ($group) {
        $course->subscribes()->attach($user->id, ['lectures_group_id' => $group->id]);
        return response()->json(['success' => true, 'message' => 'User subscribed successfully!', 'user' => $user->id]);
    }
    
    return response()->json(['success' => false, 'message' => 'No lectures group found for course 26']);
});
