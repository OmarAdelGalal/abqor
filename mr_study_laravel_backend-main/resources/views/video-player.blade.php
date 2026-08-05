<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="robots" content="noindex, nofollow">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ $lectureTitle }}</title>

    <!-- Plyr CSS -->
    <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html,
        body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #000;
            -webkit-user-select: none;
            user-select: none;
        }

        #player-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: none;
        }

        #player-wrapper {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        .plyr {
            width: 100%;
            height: 100%;
        }

        /* GPU Hardware Acceleration */
        .plyr__video-wrapper {
            height: 100%;
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            will-change: transform;
        }

        /* YouTube Zoom Hack - Hide Title/Branding */
        .plyr--youtube .plyr__video-embed,
        .plyr--youtube .plyr__video-wrapper {
            overflow: hidden !important;
        }

        .plyr--youtube .plyr__video-embed iframe {
            position: absolute;
            top: -50%;
            left: 0;
            width: 100%;
            height: 200% !important;
            z-index: 0 !important;
            pointer-events: none !important;
        }

        /* Manual 'Fake' Fullscreen - No Native API */
        .senior-fullscreen {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 999999 !important;
            background: #000 !important;
        }

        /* Reset Zoom Hack in Fullscreen */
        .senior-fullscreen .plyr__video-embed iframe {
            top: 0 !important;
            height: 100% !important;
            transform: none !important;
        }

        /* FIX: Play Button Z-Index - Works even in fullscreen */
        .plyr__control--overlaid {
            z-index: 9999999 !important;
            pointer-events: auto !important;
        }

        .plyr__controls {
            z-index: 9999999 !important;
            pointer-events: auto !important;
        }

        .plyr__video-embed {
            pointer-events: none !important;
        }

        /* Hide YouTube UI */
        .ytp-chrome-top,
        .ytp-watermark,
        .ytp-youtube-button,
        .ytp-pause-overlay,
        .ytp-endscreen-content,
        .ytp-suggestion-set,
        .html5-endscreen,
        .ytp-title,
        .ytp-title-text {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }

        /* Watermark */
        #watermark {
            position: absolute;
            color: rgba(255, 255, 255, 0.12);
            font-size: 12px;
            font-family: Arial, sans-serif;
            pointer-events: none;
            z-index: 99998;
            animation: moveWatermark 45s linear infinite;
        }

        @keyframes moveWatermark {
            0% {
                top: 15%;
                left: 10%;
            }

            25% {
                top: 15%;
                left: 75%;
            }

            50% {
                top: 75%;
                left: 75%;
            }

            75% {
                top: 75%;
                left: 10%;
            }

            100% {
                top: 15%;
                left: 10%;
            }
        }

        /* Loading */
        #loading {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 100000;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #333;
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .loading-text {
            color: #666;
            font-size: 12px;
            margin-top: 15px;
            font-family: Arial, sans-serif;
        }

        .error-message {
            color: #fff;
            text-align: center;
            font-family: Arial, sans-serif;
        }

        #buffer-status {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            padding: 15px 25px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            z-index: 99997;
            display: none;
        }
    </style>

    <script>
        document.addEventListener('contextmenu', e => { e.preventDefault(); return false; });
    </script>
</head>

<body>
    <div id="loading">
        <div class="spinner"></div>
        <div class="loading-text">Preparing secure playback...</div>
    </div>

    <div id="player-container">
        <div id="player-wrapper"></div>
        <div id="watermark">{{ $studentName }} • {{ $studentId }}</div>
        <div id="buffer-status">Buffering...</div>
    </div>

    <script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"></script>

    <script>
        (function () {
            'use strict';

            const _enc = {
                l: "{{ $lectureId }}",
                e: "{{ $encryptedVideoId }}",
                k: "{{ $encryptedKey }}",
                n: "{{ $nonce }}",
                s: "{{ $appSignature }}",
                t: "{{ $token }}",
                d: "{{ $deviceId }}"
            };

            let _player = null;
            let _isReady = false;
            let _wasPlaying = false;  // Track state before seek
            let _videoId = null;
            let _isFullscreen = false;


            // Bridge
            function waitForBridge(ms = 5000) {
                return new Promise(resolve => {
                    const start = Date.now();
                    (function check() {
                        if (window.flutter_inappwebview) resolve(true);
                        else if (Date.now() - start > ms) resolve(false);
                        else setTimeout(check, 50);
                    })();
                });
            }

            // API
            async function fetchData() {
                const res = await fetch('/api/video-decrypt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-App-Signature': _enc.s,
                        'X-Device-ID': _enc.d,
                    },
                    body: JSON.stringify({
                        encrypted_video_id: _enc.e,
                        encrypted_key: _enc.k,
                        nonce: _enc.n,
                        token: _enc.t,
                    }),
                });
                if (!res.ok) throw new Error('API ' + res.status);
                return res.json();
            }

            // Decrypt
            async function decrypt(data) {
                if (data.mode === 'zero_visibility') {
                    if (!await waitForBridge()) throw new Error('No bridge');
                    const id = await window.flutter_inappwebview.callHandler('decryptZeroVisibility', {
                        payload: data.payload, iv: data.iv, tag: data.tag
                    });
                    if (!id) throw new Error('Decrypt failed');
                    return id;
                }
                if (data.e2ee && data.envelope) {
                    if (!await waitForBridge()) throw new Error('No bridge');
                    const r = await window.flutter_inappwebview.callHandler('decryptE2eeVideo', data.envelope);
                    if (r && r.v) return r.v;
                    throw new Error('E2EE failed');
                }
                if (data.v) return data.v;
                throw new Error('Unknown');
            }

            // Inject Player
            function createPlayer(videoId) {
                const wrapper = document.getElementById('player-wrapper');
                // Ensure UI is reset when creating/recreating player
                document.getElementById('player-container').classList.remove('senior-fullscreen');
                wrapper.innerHTML = '';

                const div = document.createElement('div');
                div.id = 'player';
                div.setAttribute('data-plyr-provider', 'youtube');
                div.setAttribute('data-plyr-embed-id', videoId);
                wrapper.appendChild(div);

                _player = new Plyr('#player', {
                    controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'settings', 'fullscreen'],
                    settings: ['speed'],
                    speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
                    youtube: {
                        noCookie: true,
                        rel: 0,
                        showinfo: 0,
                        modestbranding: 1,
                        playsinline: 1,
                        iv_load_policy: 3,
                        controls: 0,
                        enablejsapi: 1,
                        origin: window.location.origin,
                    },
                    fullscreen: { enabled: true, fallback: true, iosNative: true },
                    ratio: '16:9',
                    clickToPlay: true,
                });

                return _player;
            }

            // Setup Events
            function setupEvents(player) {
                const bufferStatus = document.getElementById('buffer-status');

                // Ready
                // ========================================
                // MANUAL FULLSCREEN TOGGLE (Bypass Native API)
                // ========================================
                const setupCustomFullscreen = () => {
                    const fsBtn = player.elements.buttons.fullscreen || document.querySelector('.plyr__controls button[data-plyr="fullscreen"]');
                    if (fsBtn) {
                        // Remove any existing listeners we added to avoid duplicates if this runs twice
                        const newBtn = fsBtn.cloneNode(true);
                        fsBtn.parentNode.replaceChild(newBtn, fsBtn);

                        newBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleCustomFullscreen(player, newBtn);
                        }, true);

                        // Keep reference updated in Plyr elements if possible, though not strictly required if we have the node
                        if (player.elements.buttons.fullscreen) player.elements.buttons.fullscreen = newBtn;
                    }
                };

                player.on('ready', () => {
                    // Try immediately
                    setupCustomFullscreen();
                    // And retry shortly after just in case Plyr re-renders controls
                    setTimeout(setupCustomFullscreen, 500);

                    console.log('[Player] Ready');
                    _isReady = true;
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('player-container').style.display = 'block';
                });

                // ========================================
                // PAUSE-ON-SEEK: Stop network during slide
                // ========================================
                player.on('seeking', () => {
                    if (!_isReady) return;

                    // Remember if we were playing
                    _wasPlaying = !player.paused;

                    // PAUSE IMMEDIATELY - stops network spam
                    player.pause();
                    console.log('[Seek] Paused during seeking');
                });

                // ========================================
                // RESUME-ON-SEEKED: Play when finger lifts
                // ========================================
                player.on('seeked', () => {
                    console.log('[Seek] Seeked - finger released');

                    // Resume if was playing before
                    if (_wasPlaying) {
                        player.play();
                        console.log('[Seek] Resumed playback');
                    }
                });

                // Buffer status
                player.on('waiting', () => {
                    bufferStatus.style.display = 'block';
                });

                player.on('playing', () => {
                    bufferStatus.style.display = 'none';
                });

                player.on('canplay', () => {
                    bufferStatus.style.display = 'none';
                });

                // End protection
                player.on('ended', () => {
                    player.currentTime = Math.max(0, player.duration - 0.5);
                    player.pause();
                });

                // Error recovery
                player.on('error', (e) => {
                    console.error('[Player] Error:', e);
                    const t = player.currentTime;
                    setTimeout(() => {
                        _player.destroy();
                        createPlayer(_videoId);
                        setTimeout(() => {
                            setupEvents(_player);
                            _player.currentTime = t;
                        }, 500);
                    }, 1000);
                });
            }

            // Custom Toggle Logic
            function toggleCustomFullscreen(player, btn) {
                const container = document.getElementById('player-container');
                /* Ensure we have a button ref even if passed one is stale */
                const activeBtn = btn || document.querySelector('.plyr__controls button[data-plyr="fullscreen"]');

                _isFullscreen = !_isFullscreen;

                if (_isFullscreen) {
                    console.log('[Fullscreen] Custom Enter');
                    container.classList.add('senior-fullscreen');
                    if (activeBtn) activeBtn.classList.add('plyr__control--pressed');

                    try {
                        if (window.flutter_inappwebview) window.flutter_inappwebview.callHandler('enter_fullscreen');
                    } catch (e) { console.warn(e); }
                } else {
                    console.log('[Fullscreen] Custom Exit');
                    container.classList.remove('senior-fullscreen');
                    if (activeBtn) activeBtn.classList.remove('plyr__control--pressed');

                    try {
                        if (window.flutter_inappwebview) window.flutter_inappwebview.callHandler('exit_fullscreen');
                    } catch (e) { console.warn(e); }
                }
            }

            // Init
            async function init() {
                try {
                    console.log('[Init] Start');
                    const data = await fetchData();
                    _videoId = await decrypt(data);
                    console.log('[Init] Video ID ready');

                    // Mark lecture as finished for this student
                    try {
                        fetch('/api/video-progress', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'X-App-Signature': _enc.s,
                                'X-Device-ID': '{{ $deviceId ?? "" }}'
                            },
                            body: JSON.stringify({
                                token: _enc.t,
                                nonce: _enc.n + '_progress'
                            })
                        }).then(r => r.json()).then(d => {
                            console.log('[Progress] Lecture marked finished', d);
                        }).catch(e => console.warn('[Progress] Failed:', e));
                    } catch (e) {
                        console.warn('[Progress] Error', e);
                    }

                    const player = createPlayer(_videoId);
                    setupEvents(player);

                } catch (err) {
                    console.error('[Init] Error:', err);
                    document.getElementById('loading').innerHTML =
                        '<div class="error-message"><p>Failed to load</p><p style="font-size:10px">' + err.message + '</p></div>';
                }
            }

            setTimeout(init, 100);
        })();
    </script>
</body>

</html>