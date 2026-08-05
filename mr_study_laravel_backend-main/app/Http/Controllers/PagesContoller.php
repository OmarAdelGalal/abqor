<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\AppConfig;
use App\Models\TermsItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PagesContoller extends Controller
{
    public function telescopeLogin(Request $request){
        Auth::logout();
        if(auth()->check()){
            return redirect('/telescope');    

        }
        if(request()->method()=="GET"){
        return view('login');
    }     
    
    //validate
    $request->validate([
                'phone'=>'required',
                'password'=>'required',
            ]);
            if(Auth::attempt(['phone'=>$request->phone, 'role'=>UserRole::ADMIN, 'password'=>$request->password])){
                
                return redirect('/telescope');    
                
                
            }
            
            // return view('login');
    }



    public function terms(){ 
        $terms=TermsItem::oldest()->get();
        return view('terms',['terms'=>$terms]);
         
    }


    public function downloadApp(){
        $links=AppConfig::select('play_store','app_store')->first();
        return view('download_app',['links'=>$links]);
    }



}
