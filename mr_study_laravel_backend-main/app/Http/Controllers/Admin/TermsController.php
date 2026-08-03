<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PagesConfig;
use App\Models\TermsItem;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use LDAP\Result;

class TermsController extends Controller
{

    public function index(){
        $terms=TermsItem::oldest()
        ->when(request()->search,fn($query) => $query->where('title','like','%'.request()->search.'%'))
        ->get();
        $baseTitles=PagesConfig::select(['terms_title','terms_subtitle'])->first();
        $data=[
            'base_titles'=>$baseTitles,
            'titles'=>$terms,
        ];
        return ResultResponse::success($data);
    }
    public function updateTitles(Request $request){
        $request->validate([
            'terms_title'=>'required',
            'terms_subtitle'=>'nullable',
        ]);
        $config=PagesConfig::first();
        $config->update($request->only(['terms_title','terms_subtitle']));

        return ResultResponse::success();
    }
    //store terms
    public function store(Request $request){
        $request->validate([
            'title'=>'required|string',
            'text'=>'required|string',
        ]);
        $term= TermsItem::create($request->only(['title','text']));
        return ResultResponse::success($term);
    }

    //update terms
    public function update(Request $request, TermsItem $term){
        $request->validate([
            'title'=>'required|string',
            'text'=>'required|string',
        ]);
        
        $term->update($request->only(['title','text']));
        return ResultResponse::success($term);
    }

    //delete terms
    public function destroy(TermsItem $term){     
        $term->delete();
        return ResultResponse::success();
    }
    //show terms
    public function show(TermsItem $term){
        return ResultResponse::success($term);
    }
}
