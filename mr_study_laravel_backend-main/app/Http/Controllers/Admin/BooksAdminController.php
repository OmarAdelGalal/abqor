<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BookStatus;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookReview;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BooksAdminController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $reviews=Book::withCount('reviews')->with('subject')->when($request->search,function($q){
            $search=request()->search;
            return $q->where('name','LIKE',"%{$search}%");
        })->latest()->get();
        return ResultResponse::success($reviews);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //validate
        $request->validate([
            'name'=>'required',
            'image'=>'required|image|mimes:jpeg,png,jpg|max:512',
            'subject_id'=>['nullable','integer',Rule::exists('subjects','id')]
        ]);
        //save file img
        $img=$request->file('image')->store('books','public');
        //save to db
        $book= Book::create([
            'name'=>$request->name,
            'subject_id'=>$request->subject_id,
            'image'=>$img
        ]);
        return ResultResponse::success($book);
    }

    
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Book $book)
    {
          //validate
        $request->validate([
            'name'=>'required',
            'image'=>'nullable|max:512',
            'subject_id'=>['nullable','integer',Rule::exists('subjects','id')]

        ]);
        //save file img
        if($request->hasFile('image')){
            $img=$request->file('image')->store('books','public');
            $book->image=$img;
        }

        $book->name=$request->name;
        $book->subject_id=$request->subject_id;
        $book->save();
        return ResultResponse::success($book);
        
        
    }
    
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Book $book)
    {
        $book->delete();
        return ResultResponse::success();

    }
    //show book
    public function show(Book $book){
        $book->load(['subject','reviews']);
        return ResultResponse::success($book);
    }

    //set status
    public function setStatus(Request $request,Book $book){
        $request->validate([
            'status'=>['required',Rule::enum(BookStatus::class)]
        ]);
        $book->update(['status'=>$request->status]);
        return ResultResponse::success($book);
    }

       //store
       public function createReview(Request $request,Book $book)
       {
           //validate
           $request->validate([
               'title'=>'required',
               'file'=>'required|file'
           ]);
           //save file
           $img=$request->file('file')->store('books','public');
           //save to db
           $review= $book->reviews()->create([
               'title'=>$request->title,
               'file'=>$img
           ]);
           return ResultResponse::success($review);
       }
   
       //destroy
       public function destroyReview(BookReview $review)
       {
           $review->delete();
           return ResultResponse::success();
       }

       //get reviews of book
       public function getReviews(Book $book)
       {
           $reviews=$book->reviews()->latest()->get();
           return ResultResponse::success($reviews);
       }
   
}
