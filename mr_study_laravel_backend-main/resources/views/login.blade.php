<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <title>Login to telescope</title>
    
    <!-- <link rel="stylesheet" href="style.css">  -->

    <style>
        *{
            margin: 0;
            padding:0 ;
            box-sizing: border-box;
            font-family: "poppins" , sans-serif;
        }
        
        
        body{
            background-color: rgba(128, 128, 128, 0.584);
            display: flex;
        justify-content: center;
            align-items: center;
            min-height: 100vh;
        
           
        }
        .box{
            border: 100px;
            box-shadow: 10px 10px 40px 40px rgba(0, 0, 0, 0.384);
        background-color: rgba(15, 223, 220, 0.726);
        width: 500px;
        height: 300px;
        color: white;
        border-radius:10px;
        padding: 30px 40px ;
        
        }
        .box h2 {
            font-size: 36px;
            color: black;
            text-align: center;
           font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
        
        }
        
        .box .input-box {
            position: relative;
          width: 100%; 
          height: 50px;
          margin: 10px 0 ; ;
        }
        
        .input-box input{
            width: 100%;
            height: 100%;
            background: transparent;
            border: none;
            border: 2px solid black;
            border-radius: 40px;
            font-size: 16px;
            color: white;
            padding: 20px 45px 20px 20px ;
        }
        
        .input-box input::placeholder {
            color: black;
        }
        .input-box i {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 20px;
            color: black;
        }
        
        .box .submit {
            width: 100%;
            height: 45px;
            background: white;
            border: none;
            border-radius: 40px  ;
            box-shadow: 0 0 10px black;
        }
    </style>
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>

</head>



<body>

    <form  method="post">
 @csrf
<div class="box"> 
    <h2> Login </h2>
    <div class="input-box"> 
        <input type="phone" placeholder="phone" name='phone' required>
        <i class='bx bx-user' ></i>

    </div>
<br> 
    <div class="input-box"> 
        <input type="password" placeholder="password" name='password' required>
        <i class='bx bx-lock-alt' ></i>
    </div>
    <br> 
    <input class="submit"  type="submit" value ="submit">  
</div>
</form>

 </body>
 </html>