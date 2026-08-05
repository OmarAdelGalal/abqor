<?php

namespace Database\Seeders;

use App\Enums\OtpType;
use App\Enums\UserRole;
use App\Models\OtpCode;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

$emails = [
    'allaee15dine032005@gmail.com',
    'rabhiaziz39@gmail.com',
    'ahmedboudjatit20@gmail.com',
    'zerfaachi@gmail.com',
    'djihanedraoui920@gmail.com',
    'tegiachahrazed@gmail.com',
    'saidabenharira125@gmail.com',
    'achouek88@gmail.com',
    'lalalimereim@gmail.com',
    'zizou.f2009@gmail.com',
    'yara.nesrine7@gmail.com',
    'lamrharoun@gmail.com',
    'mohamadalmire04@gmail.com',
    'tasnimballaoui297@gmail.com',
    'assilassil23916@gmail.com',
    'hacinegharbimohamed@gmail.com',
    'asmaa20322@gmail.com',
    'assmaassma3746489@gmail.com',
    'hliloroufaida@gimail.com',
    'fkisrane@gmail.com',
    'ritajtaibi89@gmail.com',
    'zianemaria456@gmail.com',
    'amiraadimi93@gmail.com',
    'rachaebz10@gmail.com',
    'asalaman705@gmail.com',
    'dikra3636@gmail.com',
    'hibatalrahmandjeddou@gmail.com',
    'anfel5133@gmail.com',
    'dounialaib70@gmail.com',
    'meriemothmani35@icloud.com',
    'rayhane18farah@gmail.com',
    'amirabeng7@gmail.com',
    'foobeauty26042008@gmail.com',
    'doujakm1@gmail.com',
    'sedx574@gmail.com',
    'siham12dia@gmail.com',
    'yakopya2023@gmail.com',
    'dhmykhty@gmail.com',
    'benchahinaze0@gmail.com',
    'mariabouazza@icloud.com',
    'fatimazahraa2924@gmail.com',
    'anesyasine@gmail.com',
    'hdr93603@gmail.com',
    'chahrazed.benn@icloud.com',
    'shhndtshwshw@gmail.com',
    'minakhadidja500@gmail.com',
    'farikilyas617@gmail.com',
    'hassadmaysam26@gmail.com',
    'saralahelag@gmail.com',
    'belkessourfoufa@gmail.com',
    'razanesamai3@gmail.com',
    'seraichewassila@gmail.com',
    'lamisseselt@gmail.com',
    'mimaomayma281@gmail.com',
    'naoussemboukheloua@gmail.com',
    'wissambdjou36@gmail.com',
    'tsnymalalm243@gmail.com',
    'amirabrik249@gmail.com',
    'mounatigha18@gmail.com',
    'zoulikha.ziane@univ-msila.dz',
    'bac55923@gmail.com',
    'wisala71124@gmail.com',
    'israeguessas@gmail.com',
    'ahmedahmeddz1000@gmail.com',
    'sohaibxoxo4@gmail.com',
    'aymenmoussa436@gmail.com',
    'romaissa.zalikh05@gmail.com',
    'fatmazahrafarhari@gmail.com',
    'cmeriem315@gmail.com',
    'mohammedmezouar66@gmail.com',
    'akramikjouane@gmail.com',
    'mohmedelmed2007@gmail.com',
    'douaakhelifa7@gmail.com',
    'ilefsouri3@gmail.com',
    'lalaouirita239@gmail.com',
    'aze047050@gmail.com',
    'zeraibsoundous17@gmail.com',
    'kawther.31dz@gmail.com',
    'nariemselmani2007@gmail.com',
    'abablg133@gmail.com',
    'achergui044@gmail.com',
    'linamezaache74@gmail.com',
    'imen111douu@gmail.com',
    'chorfiyasmine61@gmail.com',
    'djamelchalgham@gmail.com',
    'takouchtakouch2022@gmail.com',
    'zikai855@gmail.com',
    'ineshagabi8@gmail.com',
    'ayahoughni@gmail.com',
    'wmahrouz10@gmail.com',
    'loukmanechouchane@gmail.com',
    'amanirahmouni67@gmail.com',
    'oumaimazarzouni@gmail.com',
    'amanimalak528@gmail.com',
    'djihanabbas@gmail.com',
    'sacimalak101@gmail.com',
    'hadilrb45@gmail.com',
    'a42992188@gmail.com',
    'aichoucheyasmine2007@gmail.com',
    'marouahadjadj@gmail.com',
    'zeroualyasser356@gmail.com',
    'bouadaminsaf@gmail.com',
    'samiataou93@gmail.com',
    'benzoghlimeriem@gmail.com',
    'ritaaritt919@gmail.com',
    'habiballah19092000@gmail.com',
    'sebbahimaissaa3@gmail.com',
    'amine_belouassa19@icloud.com',
    'benyoucefrafik612@gmail.com',
    'massylia05@gmail.com',
    'lechnour993@gmail.com',
    'imane.drh29@gmail.com',
    'aouraghnidhal187@gmail.com',
    'kimstar015@gmail.com',
    'bougouizimaroua@gmail.com',
    'wiamtcheir@gmail.com',
    'chemini.nourelhouda@gmail.com',
    'chaimazinelkelma2@gmail.com',
    'khaladghazali915@gmail.com',
    'allaoua.dalal.eng.ps@gmail.com',
    'ami678coco5nona@gmail.com',
    'sabrizeghbib021@gmail.com',
    'rimm25079@gmail.com',
    'rihamboudebouz@gmail.com',
    'kahinahassnaa@gmail.com',
    'anesbouregba27@gmail.com',
    'amouramehdaoui@gmail.com',
    'tahanibeldjatit@gmail.com',
    'bezai.imane23@gmail.com',
    'gherairiaghhadil@gmail.com',
    'za90.lymon@gmail.com',
    'ainsouya.oumaima@yahoo.com',
    'khadidjamohamadi968@gmail.com',
    'saadymaahdy@gmail.com',
    'abdelmounaimbou3@gmail.com',
    'mariaazara523@gmail.com',
    'firasyoubi0@gmail.com',
    'itts5227@gmail.com',
    'ranymblyr439@gmail.com',
    'esraissaad95@gmail.com',
    'boulahelhmedd@gmail.com',
    'raihaneslimi4@gmail.com',
    'abdoumtn485@gmail.com',
    'chaimabenyousef38@gmail.com',
    'laminemaria0306@gmail.com',
    'rahimaterras762@gmail.com',
    'sirinbouhant@gmail.com',
    'mr.houssem28@gmail.com',
    'halimagrabsi7@gmail.com',
    'mayahalimi49@gmail.com',
    'lynadania8@gmail.com',
    'djellsouj@gmail.com',
    'litissiaseghier762@icloud.com',
    'chahednouibat@icloud.com',
    'ayamahdjoub21@gmail.com',
    'yasmineboualii@icloud.com',
    'aymengara2323@gmail.com',
    's.melais@univ-soukahras.dz',
    'nourdogha7@gmail.com',
    'ayayoya05a@gmail.com',
    'dadiydido873@gmail.com',
    'sisisiri6738@gmail.com',
    'chineabdallah1@gmail.com',
    'belalakamar@gmail.com',
    'kamel.nour.elhouda.2006@gmail.com',
    'loudjainebenchikch@gmail.com',
    'samsoman65@gmail.com',
    'lamraouiines1@gmail.com',
    'nanaanfel3@gmail.com',
];
    $addedEmails=[];
    
        $otps=OtpCode::where('type',OtpType::REGISTER)
                    ->where('used',false);
        $i=0;
        $count=$otps->count();
        foreach($otps->cursor() as $otp){
               $otp->used=true;
            $otp->save();
            //get the pending student
            $pendingStudent=$otp->pendingStudent;
            if(!$pendingStudent||!$pendingStudent->email||!$pendingStudent->phone||!in_array($pendingStudent->email,$emails)){
                continue;
            }
            //check if the email exists in users table
            $user=User::where('email',$pendingStudent->email)->exists();
            if($user){
                continue;
            }
            //check for phone
            $user=User::where('phone',$pendingStudent->phone)->exists();
            if($user){
                    continue;
                }
            //create user
            $user=User::create([
                'name'=>$pendingStudent->name,
                'email'=>$pendingStudent->email,
                'password'=>Hash::make('12345678'),
                'phone'=>$pendingStudent->phone,
                'role'=>UserRole::STUDENT
            ]);
            
            //create student
            $user->student()->create([
                'gender'=>$pendingStudent->gender,
                'state'=>$pendingStudent->state,
                'know_by'=>$pendingStudent->know_by,
                'health'=>Student::DEFAULT_HEALTH
            ]);
            //create program for the user 
            $user->programs()->create([
                'education_level_id'=>$pendingStudent->education_level_id,
                'education_year_id'=>$pendingStudent->education_year_id,
                'education_major_id'=>$pendingStudent->education_major_id
            ]);

            //delete pending student
            // $pendingStudent->delete();
            $i++;
            array_push($addedEmails,$pendingStudent->email);
        }
        dump("seeded ".$i." students");
        dump("skipped ".($count-$i)." students due to existing email or phone");
        dump("total pending students: ".$count);
        dump("added emails:");
        dump($addedEmails);
    }
}
