
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download Our App</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      margin: 0;
      padding: 0;
      background-color: #f4f4f9;
      color: #333;
    }

    .container {
      margin: 50px auto;
      max-width: 600px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 20px;
    }

    p {
      font-size: 1rem;
      margin-bottom: 30px;
    }

    .download-buttons a {
      display: inline-block;
      margin: 10px;
      padding: 15px 25px;
      border-radius: 5px;
      text-decoration: none;
      font-size: 1rem;
      color: white;
      transition: background-color 0.3s ease;
    }

    .google-play {
      background-color: #34a853;
    }

    .google-play:hover {
      background-color: #2b8e44;
    }

    .app-store {
      background-color: #0071e3;
    }

    .app-store:hover {
      background-color: #005bb5;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>حمل تطبيق مستر ستادي</h1>
    <p>احصل على تطبيقنا على Google Play أو متجر التطبيقات للبقاء على اتصال.</p>
    <div class="download-buttons">
      <a class="google-play" href="{{$links->play_store}}" target="_blank">
        تحميل من Google Play
      </a>
      <a class="app-store" href="{{$links->app_store}}" target="_blank">
        تحميل من App Store
      </a>
    </div>
  </div>
</body>
</html>
