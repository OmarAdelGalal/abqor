<?php

namespace Database\Seeders;

use App\Enums\OtpType;
use App\Enums\UserRole;
use App\Models\Course;
use App\Models\OtpCode;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentsSeeder2 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        

        
$array = array(
    array("name"=>"Bellili Sarah", "phone"=>"556574092", "email"=>"mbellili860@gmail.com "),
    array("name"=>"Louiza boukhannoufa", "phone"=>"792682117", "email"=>"louizaboukhannoufa@gmail.com "),
    array("name"=>"بن جامع ندى", "phone"=>"656177087", "email"=>"bendjamaanada1@gmail.com "),
    array("name"=>"زرارتي سيرين", "phone"=>"796104099", "email"=>"zerarticerine@gmail.com "),
    array("name"=>"أسماء دهيمي", "phone"=>"556830057", "email"=>"asmadehimi213@gmail.com "),
    array("name"=>"الاء قاسم", "phone"=>"542935819", "email"=>"kassemalaa100@gmail.com "),
    array("name"=>"والي خديجة", "phone"=>"670603692", "email"=>"oualikhadidja109@gmail.com "),
    array("name"=>"هاجر أحمد سرير", "phone"=>"776976105", "email"=>"hadjerahmedserir836@gmail.com "),
    array("name"=>"حفصة يومبعي", "phone"=>"668587124", "email"=>"oueenhafsa730@gmail.com "),
    array("name"=>"عطاف عرافة ايمان", "phone"=>"671023022", "email"=>"rfatt1224@gmail.com "),
    array("name"=>"إيمان شطوف", "phone"=>"557727105", "email"=>"amhmdhklof@gmail.com "),
    array("name"=>"Gouri Baya", "phone"=>"542217528", "email"=>"kharfirahima5@gmail.com "),
    array("name"=>"حمادي الاء", "phone"=>"793193426", "email"=>"allahamadi600@gmail.com "),
    array("name"=>"بويحمد يمينة", "phone"=>"554259989", "email"=>"bouyahmedyamina2000@gmail.com "),
    array("name"=>"Ouahba amine", "phone"=>"783798275", "email"=>"amineouahba71@gmail.com "),
    array("name"=>"عبيبسي جمانة", "phone"=>"777710464", "email"=>"joum9613@gmail.com "),
    array("name"=>"خليل سالمي", "phone"=>"541945547", "email"=>"khalilsalmi2026n@gmail.com "),
    array("name"=>"قرة علي", "phone"=>"541572178", "email"=>"geurraali4@gmail.com "),
    array("name"=>"بلونيس وهيبة", "phone"=>"674145776", "email"=>"belouniswahiba9@gmail.com "),
    array("name"=>"خليفاتي ليدية", "phone"=>"562493108", "email"=>"khelifatilydia13@gmail.com "),
    array("name"=>"زيوان غادة", "phone"=>"779304355", "email"=>"ghadaziouane59@gmail.com "),
    array("name"=>"منوشي تسنيم", "phone"=>"657037870", "email"=>"tesnimtesnimmennouchi@gmail.com "),
    array("name"=>"خميس امينة", "phone"=>"655715993", "email"=>"Aminakhemis07@gmail.com "),
    array("name"=>"صفي الدين برويس", "phone"=>"675847816", "email"=>"safaiberrois@gmail.com "),
    array("name"=>"بوزنونة إيمان", "phone"=>"667878780", "email"=>"imenbouzenouna@gmail.com "),
    array("name"=>"نوار ألاء الرحمان", "phone"=>"775921602", "email"=>"alaanouar36@gmail.com "),
    array("name"=>"اسراء بن ساسي", "phone"=>"676642004", "email"=>"israa.siisa@gmail.com "),
    array("name"=>"غزة خنيوة", "phone"=>"797187550", "email"=>"kheniouaghazaghaazamadrid@gmail.com "),
    array("name"=>"مكي سرين", "phone"=>"657455426", "email"=>"mekicerine39@gmail.com "),
    array("name"=>"علاهم سارة", "phone"=>"775569073", "email"=>"allahoumsaraania46@gmail.com "),
    array("name"=>"شاقر آية", "phone"=>"797443740", "email"=>"ayaayach2007@gmail.com "),
    array("name"=>"سمر بوصبيع صالح", "phone"=>"795553578", "email"=>"bousbiasamar39@gmail.com "),
    array("name"=>"سماش مريم", "phone"=>"557657916", "email"=>"semmachemeriem17@gmail.com "),
    array("name"=>"إسراء بوزيناوي", "phone"=>"698251731", "email"=>"israabouzi17@gmail.com "),
    array("name"=>"Farah taieb kherafa", "phone"=>"558121362", "email"=>"taibf558@gmail.com "),
    array("name"=>"فراحي ايناس", "phone"=>"778579202", "email"=>"farahiines4@gmail.com "),
    array("name"=>"لمباركية رفيدة", "phone"=>"667556977", "email"=>"queenarmy1177@gmail.com "),
    array("name"=>"توهامي ريتاج", "phone"=>"793512008", "email"=>"ritadjetouhami@gmail.com "),
    array("name"=>"نصراوي محمد", "phone"=>"542492299", "email"=>"sodehamd@gmail.com "),
    array("name"=>"خليفي عبد الغاني", "phone"=>"775025944", "email"=>"ghanoukh2008@gmail.com "),
    array("name"=>"Bouchra idris", "phone"=>"791325369", "email"=>"bouchra.idris@icloud.com "),
    array("name"=>"محمد الامين غنجيو", "phone"=>"563854614", "email"=>"momokoko12689@gmail.com "),
    array("name"=>"فقيه ريحان", "phone"=>"778382784", "email"=>"fekihrayhane22@gmail.com "),
    array("name"=>"Amira gouasmi", "phone"=>"656818874", "email"=>"amira45286@gmail.com "),
    array("name"=>"بوكبوس بلسم غزلان", "phone"=>"667535172", "email"=>"balsemboukebous@gmail.com "),
    array("name"=>"اكرام بلحاج", "phone"=>"794823688", "email"=>"ikrambelhadj814@gmail.com "),
    array("name"=>"زعروري مريم", "phone"=>"560909508", "email"=>"latifamouri82@gmail.com "),
    array("name"=>"دراعو زينب", "phone"=>"671388788", "email"=>"draouzainab@gmail.com "),
    array("name"=>"Zarat yasmine", "phone"=>"556273538", "email"=>"yasminezarat5@gmail.com "),
    array("name"=>"قولسمية فرح", "phone"=>"675177114", "email"=>"naouelgouasmia2009@gmail.com "),
    array("name"=>"لقصير آمنة", "phone"=>"776088820", "email"=>"ameenalekcir05@gmail.com "),
    array("name"=>"ياسمين بن خليف", "phone"=>"699444458", "email"=>"yasminebenkhelif7@gmail.com "),
    array("name"=>"سلام سعاد", "phone"=>"674372982", "email"=>"bchrahbb@gmail.com "),
    array("name"=>"سندس بن سعدي", "phone"=>"671779105", "email"=>"sondos.benssadi34@icloud.com ")
);        
    $course=Course::find(23);
    $i=0;
    $addedEmails=[];

        foreach($array as $userData){

            
            //check if the email exists in users table
            $user=User::where('email',$userData['email'])->exists();
            if($user){
                continue;
            }
            //check for phone
            $user=User::where('phone',$userData['phone'])->exists();
            if($user){
                    continue;
                }
            //create user
            $user=User::create([
                'name'=>$userData['name'],
                'email'=>$userData['email'],
               
                'password'=>Hash::make('12345678'),
                'phone'=>$userData['phone'],
                'role'=>UserRole::STUDENT
            ]);
            
            //create student
            $user->student()->create([
                'gender'=>'male',
                'state'=>'Algiers',
                'know_by'=>'ADMIN',
                'health'=>Student::DEFAULT_HEALTH
            ]);
            //create program for the user 
            $user->programs()->create([
                'education_level_id'=>3,
                'education_year_id'=>15,
                'education_major_id'=>13,
            ]);

            
            $i++;
            array_push($addedEmails,$userData['email']);
        }
        dump("seeded ".$i." students");
        dump("added emails:");
        dump($addedEmails);
    }
}
