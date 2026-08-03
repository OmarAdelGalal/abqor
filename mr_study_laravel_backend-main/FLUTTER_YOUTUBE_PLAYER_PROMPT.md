# Flutter YouTube Video Player Implementation

## Task
Implement secure YouTube video player with InAppWebView. Videos are played through a server-rendered Plyr player loaded in WebView. The video ID never reaches Flutter - only a signed page URL that expires in 5 minutes.

---

## API Endpoint

**Get Player URL:**
- **Method:** `POST`
- **URL:** `/api/user/courses/youtube-lecture`
- **Headers:** 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`

**Request Body:**
```json
{
  "lecture_id": 76,
  "device_id": "optional_device_id"
}
```

**Success Response:**
```json
{
  "status": 200,
  "message": "success",
  "data": {
    "lecture_id": 76,
    "lecture_description": "Lecture Title Here",
    "player_url": "https://yourserver.com/video-player/abc123?expires=xxx&signature=xxx",
    "expires_at": "2026-01-29T12:00:00+00:00"
  },
  "isSuccess": true
}
```

---

## Dependencies

Add to `pubspec.yaml`:
```yaml
dependencies:
  flutter_inappwebview: ^6.0.0
  flutter_jailbreak_detection: ^1.10.0  
```

---

## Implementation

### 1. Response Model

```dart
// models/youtube_player_response.dart

class YoutubePlayerResponse {
  final int lectureId;
  final String lectureDescription;
  final String playerUrl;
  final DateTime expiresAt;

  YoutubePlayerResponse({
    required this.lectureId,
    required this.lectureDescription,
    required this.playerUrl,
    required this.expiresAt,
  });

  factory YoutubePlayerResponse.fromJson(Map<String, dynamic> json) {
    return YoutubePlayerResponse(
      lectureId: json['lecture_id'],
      lectureDescription: json['lecture_description'] ?? '',
      playerUrl: json['player_url'],
      expiresAt: DateTime.parse(json['expires_at']),
    );
  }
}
```

### 2. API Service Method

Add to your API service class:
```dart
Future<YoutubePlayerResponse> getYoutubePlayerUrl({
  required int lectureId,
  String? deviceId,
}) async {
  final response = await dio.post(
    '/user/courses/youtube-lecture',
    data: {
      'lecture_id': lectureId,
      if (deviceId != null) 'device_id': deviceId,
    },
  );

  if (response.data['isSuccess'] == true) {
    return YoutubePlayerResponse.fromJson(response.data['data']);
  }
  throw Exception(response.data['message'] ?? 'Failed to get video');
}
```

### 3. Player Screen

```dart
// screens/youtube_player_screen.dart

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class YoutubePlayerScreen extends StatefulWidget {
  final String playerUrl;
  final String lectureTitle;

  const YoutubePlayerScreen({
    Key? key,
    required this.playerUrl,
    required this.lectureTitle,
  }) : super(key: key);

  @override
  State<YoutubePlayerScreen> createState() => _YoutubePlayerScreenState();
}

class _YoutubePlayerScreenState extends State<YoutubePlayerScreen> {
  InAppWebViewController? _webViewController;
  bool _isLoading = true;
  bool _isFullscreen = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    
    // Disable WebView debugging in release mode
    if (kReleaseMode) {
      AndroidInAppWebViewController.setWebContentsDebuggingEnabled(false);
    }
    
    // Set preferred orientations (allow all for fullscreen support)
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
  }

  @override
  void dispose() {
    // Reset to portrait only when leaving
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
    ]);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: Colors.black,
          title: Text(widget.lectureTitle),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Text(
                  _error!,
                  style: const TextStyle(color: Colors.white),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: _isFullscreen
          ? null
          : AppBar(
              backgroundColor: Colors.black,
              title: Text(
                widget.lectureTitle,
                style: const TextStyle(fontSize: 16),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              leading: IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => Navigator.pop(context),
              ),
            ),
      body: Stack(
        children: [
          InAppWebView(
            initialUrlRequest: URLRequest(
              url: WebUri(widget.playerUrl),
            ),
            initialSettings: InAppWebViewSettings(
              // Security settings
              isInspectable: !kReleaseMode,
              javaScriptEnabled: true,
              allowFileAccess: false,
              allowContentAccess: false,
              
              // Video settings
              mediaPlaybackRequiresUserGesture: false,
              allowsInlineMediaPlayback: true,
              
              // UI settings
              supportZoom: false,
              verticalScrollBarEnabled: false,
              horizontalScrollBarEnabled: false,
              disableContextMenu: true,
              
              // Performance
              cacheEnabled: false,
              clearCache: true,
              
              // User agent
              userAgent: 'MrStudyApp/1.0 Flutter',
            ),
            onWebViewCreated: (controller) {
              _webViewController = controller;
            },
            onLoadStart: (controller, url) {
              setState(() => _isLoading = true);
            },
            onLoadStop: (controller, url) {
              setState(() => _isLoading = false);
            },
            onReceivedError: (controller, request, error) {
              setState(() {
                _error = 'Failed to load video. Please try again.';
                _isLoading = false;
              });
            },
            onReceivedHttpError: (controller, request, response) {
              if (response.statusCode == 403) {
                setState(() {
                  _error = 'Video link expired. Please go back and try again.';
                  _isLoading = false;
                });
              }
            },
            onEnterFullscreen: (controller) {
              setState(() => _isFullscreen = true);
              SystemChrome.setPreferredOrientations([
                DeviceOrientation.landscapeLeft,
                DeviceOrientation.landscapeRight,
              ]);
              SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
            },
            onExitFullscreen: (controller) {
              setState(() => _isFullscreen = false);
              SystemChrome.setPreferredOrientations([
                DeviceOrientation.portraitUp,
                DeviceOrientation.landscapeLeft,
                DeviceOrientation.landscapeRight,
              ]);
              SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
            },
          ),
          if (_isLoading)
            Container(
              color: Colors.black,
              child: const Center(
                child: CircularProgressIndicator(color: Colors.white),
              ),
            ),
        ],
      ),
    );
  }
}
```

### 4. Usage - Open Player from Lecture

```dart
void _playYoutubeVideo(int lectureId, String lectureTitle) async {
  try {
    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );

    // Get player URL from API
    final response = await apiService.getYoutubePlayerUrl(
      lectureId: lectureId,
    );

    // Hide loading
    Navigator.pop(context);

    // Navigate to player
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => YoutubePlayerScreen(
          playerUrl: response.playerUrl,
          lectureTitle: response.lectureDescription.isNotEmpty 
              ? response.lectureDescription 
              : lectureTitle,
        ),
      ),
    );
  } catch (e) {
    // Hide loading
    Navigator.pop(context);
    
    // Show error
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Failed to load video: ${e.toString()}')),
    );
  }
}
```

### 5. Handle Different Video Types

```dart
void _onLectureTap(Lecture lecture) {
  // Check if lecture has YouTube video
  if (lecture.hasYoutubeVideo == true) {
    _playYoutubeVideo(lecture.id, lecture.description);
  } 
  // Check if lecture has recorded video (existing implementation)
  else if (lecture.hasRecord == true) {
    _playRecordedVideo(lecture);  // Your existing recorded video player
  }
  // Live lecture
  else if (lecture.mode == 'live') {
    _joinLiveLecture(lecture);
  }
  else {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('No video available for this lecture')),
    );
  }
}
```

### 6. Optional: Security Check

```dart
import 'package:flutter_jailbreak_detection/flutter_jailbreak_detection.dart';

Future<bool> _checkDeviceSecurity() async {
  try {
    bool isJailbroken = await FlutterJailbreakDetection.jailbroken;
    if (isJailbroken) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Security Warning'),
          content: const Text('Video playback is not allowed on rooted/jailbroken devices.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK'),
            ),
          ],
        ),
      );
      return false;
    }
    return true;
  } catch (e) {
    return true; // Allow if detection fails
  }
}

// Use before playing:
void _playYoutubeVideo(int lectureId, String lectureTitle) async {
  if (!await _checkDeviceSecurity()) return;
  // ... rest of the code
}
```

---

## Important Notes

1. **URL expires in 5 minutes** - Always fetch fresh URL before playing
2. **One-time use** - If WebView fails to load, user must go back and tap again
3. **Video ID is never exposed** - Only the player page URL is sent to Flutter
4. **Fullscreen support** - Handles orientation and system UI properly
5. **Error handling** - Shows friendly messages for expired/invalid URLs

---

## Testing Checklist

- [ ] Video plays correctly
- [ ] Play/Pause works
- [ ] Seeking works (progress bar)
- [ ] Speed control works (settings icon)
- [ ] Volume control works
- [ ] Fullscreen works and rotates to landscape
- [ ] Exit fullscreen returns to portrait
- [ ] Back button closes player
- [ ] Expired URL shows error message
- [ ] Loading indicator shows while loading
- [ ] Error screen shows retry option
