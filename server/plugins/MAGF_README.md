# MAGF Plugin

**Multimedia Animated Graphics Format** - A lightweight, GIF-like, loopable multimedia container (<10 MB)

## Overview

The MAGF plugin integrates browser-native multimedia playback into the microkernel architecture. It handles encoding, decoding, and playback of MAGF files without any third-party codecs.

## Features

- 🎬 **Video Frames**: PNG/WebP encoded frames with configurable FPS
- 🔊 **Audio Support**: PCM/WAV audio via Web Audio API
- 📝 **Text Tracks**: Subtitle support with timed overlays
- 💾 **< 10 MB**: Strict size limit for lightweight distribution
- 🌐 **Browser-Native**: No external dependencies or codecs

## MAGF File Format

### Binary Layout

```
.magf
├── Header (16 bytes)
├── Manifest (JSON)
├── Frame Table
├── Audio Chunk (optional)
├── Text Chunk (optional)
└── Binary Payloads
```

### Header Structure (16 bytes)

| Offset | Size | Type    | Description          |
|--------|------|---------|----------------------|
| 0–5    | 6    | char[]  | Magic: "MAGFJS"      |
| 6–7    | 2    | uint16  | Version              |
| 8–11   | 4    | float32 | Duration (seconds)   |
| 12–13  | 2    | uint16  | FPS                  |
| 14–15  | 2    | uint16  | Flags                |

### Manifest (JSON)

```json
{
  "frames": 150,
  "width": 1280,
  "height": 720,
  "audio": true,
  "text": true,
  "fps": 15
}
```

## API Usage

### Create MAGF

```javascript
POST /run/magf
{
  "action": "create",
  "name": "My Animation",
  "frames": [...],  // Array of image buffers
  "audioBuffer": ...,  // Optional audio buffer
  "subtitles": [...],  // Optional subtitle array
  "fps": 15,
  "duration": 10.0
}
```

### List MAGFs

```javascript
POST /run/magf
{
  "action": "list"
}
```

### Get MAGF Info

```javascript
POST /run/magf
{
  "action": "get",
  "id": 1
}
```

### Delete MAGF

```javascript
POST /run/magf
{
  "action": "delete",
  "id": 1
}
```

### Get Player HTML

```javascript
POST /run/magf
{
  "action": "getPlayerHTML",
  "width": 640,
  "height": 360,
  "magfUrl": "/magf/1/download"
}
```

## Direct Endpoints

- `GET /magf/:id/download` - Download encoded MAGF file
- `GET /magf/:id/player` - View MAGF in browser player

## Browser Player Usage

```html
<canvas id="magf"></canvas>
<script type="module">
class MAGFPlayer {
  constructor(arrayBuffer, canvas) {
    this.buffer = arrayBuffer;
    this.view = new DataView(arrayBuffer);
    this.offset = 0;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  readHeader() { /* ... */ }
  readManifest() { /* ... */ }
  async loadFrames() { /* ... */ }
  async loadAudio() { /* ... */ }
  loadText() { /* ... */ }
  play() { /* ... */ }
  pause() { /* ... */ }
  restart() { /* ... */ }
}

// Usage
fetch("demo.magf")
  .then(r => r.arrayBuffer())
  .then(async buf => {
    const canvas = document.getElementById("magf");
    const player = new MAGFPlayer(buf, canvas);
    player.readHeader();
    player.readManifest();
    await player.loadFrames();
    if (player.manifest.audio) await player.loadAudio();
    if (player.manifest.text) player.loadText();
    player.play();
  });
</script>
```

## Subtitle Format

```json
[
  {
    "start": 0,
    "end": 2,
    "text": "Hello MAGF!"
  },
  {
    "start": 2,
    "end": 4,
    "text": "Browser-native playback"
  }
]
```

## Use Cases

- 🎯 **Browser-native animated ads**
- 📚 **Interactive documentation**
- 💼 **Offline demos**
- 🎓 **Teaching media containers**
- 📖 **"View source" media formats**

## Architecture Benefits

1. **No Codecs**: Uses browser primitives (Canvas API, Web Audio API)
2. **Lightweight**: < 10 MB size limit enforced
3. **Simple**: Just orchestration, no magic
4. **Transparent**: Everything readable via ArrayBuffer
5. **Plugin-based**: Integrates seamlessly with microkernel

## Technical Details

- **Encoding**: Server-side via Node.js
- **Decoding**: Client-side via browser APIs
- **Storage**: In-memory (Map-based)
- **Frame Format**: PNG/WebP blobs
- **Audio Format**: PCM/WAV decoded via AudioContext.decodeAudioData
- **Text Format**: JSON with timing information

## Demo

Visit `/magf-demo.html` to try the interactive MAGF creator and player!
