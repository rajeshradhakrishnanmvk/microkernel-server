/**
 * MAGF Plugin
 * 
 * Multimedia Animated Graphics Format (MAGF)
 * A lightweight, GIF-like, loopable multimedia container (<10 MB)
 * 
 * Features:
 * - Browser-native playback (no third-party codecs)
 * - Video frames (PNG/WebP)
 * - Audio (PCM/WAV via Web Audio API)
 * - Text tracks/subtitles
 * - Encoding & decoding
 */

export class MAGFPlugin {
  async init() {
    this.magfFiles = new Map();
    this.nextId = 1;
    this.maxFileSize = 10 * 1024 * 1024; // 10 MB limit
  }

  async execute({ action, ...params }) {
    switch (action) {
      case 'encode':
        return this.encodeMAGF(params);
      case 'create':
        return this.createMAGF(params);
      case 'get':
        return this.getMAGF(params.id);
      case 'list':
        return this.listMAGFs();
      case 'delete':
        return this.deleteMAGF(params.id);
      case 'getPlayerHTML':
        return this.getPlayerHTML(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Encode MAGF from frames, audio, and text
   */
  async encodeMAGF({ frames, audioBuffer, subtitles, fps = 15, duration = null }) {
    const encoder = new TextEncoder();

    // Calculate actual duration if not provided
    const actualDuration = duration || (frames.length / fps);

    const manifest = {
      frames: frames.length,
      width: frames[0].width,
      height: frames[0].height,
      audio: !!audioBuffer,
      text: !!subtitles,
      fps: fps
    };

    const manifestBytes = encoder.encode(JSON.stringify(manifest));

    // Create 16-byte header
    const header = new ArrayBuffer(16);
    const view = new DataView(header);
    
    // Magic number: "MAGFJS"
    view.setUint8(0, "M".charCodeAt(0));
    view.setUint8(1, "A".charCodeAt(0));
    view.setUint8(2, "G".charCodeAt(0));
    view.setUint8(3, "F".charCodeAt(0));
    view.setUint8(4, "J".charCodeAt(0));
    view.setUint8(5, "S".charCodeAt(0));
    
    // Metadata
    view.setUint16(6, 1, true);                    // version
    view.setFloat32(8, actualDuration, true);      // duration
    view.setUint16(12, fps, true);                 // fps
    view.setUint16(14, 0, true);                   // flags

    const chunks = [header];

    // Manifest length + manifest
    const manifestLen = new Uint32Array([manifestBytes.length]);
    chunks.push(manifestLen.buffer);
    chunks.push(manifestBytes.buffer);

    // Frame table (PNG/WebP blobs)
    for (const frame of frames) {
      const len = new Uint32Array([frame.byteLength]);
      chunks.push(len.buffer);
      chunks.push(frame);
    }

    // Audio chunk (optional)
    if (audioBuffer) {
      const len = new Uint32Array([audioBuffer.byteLength]);
      chunks.push(len.buffer);
      chunks.push(audioBuffer);
    }

    // Text chunk (optional)
    if (subtitles) {
      const textBytes = encoder.encode(JSON.stringify(subtitles));
      const len = new Uint32Array([textBytes.length]);
      chunks.push(len.buffer);
      chunks.push(textBytes.buffer);
    }

    const blob = new Blob(chunks, { type: "application/octet-stream" });
    
    // Check size limit
    if (blob.size > this.maxFileSize) {
      throw new Error(`MAGF file exceeds ${this.maxFileSize / 1024 / 1024}MB limit`);
    }

    return blob;
  }

  /**
   * Create and store a MAGF file
   */
  createMAGF({ 
    name, 
    frames, 
    audioBuffer, 
    subtitles, 
    fps = 15, 
    duration = null,
    metadata = {} 
  }) {
    const id = this.nextId++;
    
    const magf = {
      id,
      name: name || `MAGF-${id}`,
      frameCount: frames.length,
      width: frames[0].width,
      height: frames[0].height,
      fps,
      duration: duration || (frames.length / fps),
      hasAudio: !!audioBuffer,
      hasText: !!subtitles,
      metadata,
      createdAt: new Date().toISOString(),
      // Store the raw data for encoding on-demand
      _frames: frames,
      _audioBuffer: audioBuffer,
      _subtitles: subtitles
    };

    this.magfFiles.set(id, magf);
    
    return {
      id,
      name: magf.name,
      frameCount: magf.frameCount,
      width: magf.width,
      height: magf.height,
      fps: magf.fps,
      duration: magf.duration,
      hasAudio: magf.hasAudio,
      hasText: magf.hasText,
      createdAt: magf.createdAt
    };
  }

  /**
   * Get MAGF file info
   */
  getMAGF(id) {
    const magf = this.magfFiles.get(id);
    if (!magf) {
      throw new Error(`MAGF file ${id} not found`);
    }

    // Return all data including internal frames for server use
    return magf;
  }

  /**
   * List all MAGF files
   */
  listMAGFs() {
    return Array.from(this.magfFiles.values()).map(magf => ({
      id: magf.id,
      name: magf.name,
      frameCount: magf.frameCount,
      width: magf.width,
      height: magf.height,
      fps: magf.fps,
      duration: magf.duration,
      hasAudio: magf.hasAudio,
      hasText: magf.hasText,
      createdAt: magf.createdAt
    }));
  }

  /**
   * Delete MAGF file
   */
  deleteMAGF(id) {
    if (!this.magfFiles.has(id)) {
      throw new Error(`MAGF file ${id} not found`);
    }
    
    this.magfFiles.delete(id);
    return { success: true, id };
  }

  /**
   * Generate HTML for MAGF player
   */
  getPlayerHTML({ width = 640, height = 360, magfUrl = 'demo.magf' }) {
    return `
<div class="magf-player-container" style="max-width: ${width}px;">
  <canvas id="magf-canvas" width="${width}" height="${height}" 
          style="width: 100%; border: 2px solid #333; border-radius: 8px;"></canvas>
  <div class="magf-controls" style="margin-top: 10px; display: flex; gap: 10px; justify-content: center;">
    <button id="magf-play" style="padding: 8px 16px; background: #3a86ff; color: white; border: none; border-radius: 4px; cursor: pointer;">Play</button>
    <button id="magf-pause" style="padding: 8px 16px; background: #ff006e; color: white; border: none; border-radius: 4px; cursor: pointer;">Pause</button>
    <button id="magf-restart" style="padding: 8px 16px; background: #8338ec; color: white; border: none; border-radius: 4px; cursor: pointer;">Restart</button>
  </div>
</div>

<script type="module">
class MAGFPlayer {
  constructor(arrayBuffer, canvas) {
    this.buffer = arrayBuffer;
    this.view = new DataView(arrayBuffer);
    this.offset = 0;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.currentFrame = 0;
    this.isPlaying = false;
    this.intervalId = null;
    this.audioContext = null;
    this.audioSource = null;
  }

  readHeader() {
    const magic = String.fromCharCode(
      ...new Uint8Array(this.buffer.slice(0, 6))
    );
    if (magic !== "MAGFJS") throw new Error("Invalid MAGF file");

    this.version = this.view.getUint16(6, true);
    this.duration = this.view.getFloat32(8, true);
    this.fps = this.view.getUint16(12, true);
    this.flags = this.view.getUint16(14, true);
    
    this.offset = 16;
  }

  readManifest() {
    const len = this.view.getUint32(this.offset, true);
    this.offset += 4;
    const json = new TextDecoder().decode(
      this.buffer.slice(this.offset, this.offset + len)
    );
    this.offset += len;
    this.manifest = JSON.parse(json);
    
    // Set canvas dimensions
    this.canvas.width = this.manifest.width;
    this.canvas.height = this.manifest.height;
  }

  async loadFrames() {
    this.frames = [];
    for (let i = 0; i < this.manifest.frames; i++) {
      const len = this.view.getUint32(this.offset, true);
      this.offset += 4;
      const blob = new Blob([
        this.buffer.slice(this.offset, this.offset + len)
      ]);
      this.offset += len;

      const img = await createImageBitmap(blob);
      this.frames.push(img);
    }
  }

  async loadAudio() {
    if (!this.manifest.audio) return;

    const len = this.view.getUint32(this.offset, true);
    this.offset += 4;
    const audioData = this.buffer.slice(this.offset, this.offset + len);
    this.offset += len;

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.audioBuffer = await this.audioContext.decodeAudioData(audioData);
  }

  loadText() {
    if (!this.manifest.text) return;

    const len = this.view.getUint32(this.offset, true);
    this.offset += 4;
    const json = new TextDecoder().decode(
      this.buffer.slice(this.offset, this.offset + len)
    );
    this.offset += len;
    this.subtitles = JSON.parse(json);
  }

  play() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    const interval = 1000 / this.fps;
    const startTime = Date.now();

    // Play audio if available
    if (this.manifest.audio && this.audioBuffer && !this.audioSource) {
      this.audioSource = this.audioContext.createBufferSource();
      this.audioSource.buffer = this.audioBuffer;
      this.audioSource.connect(this.audioContext.destination);
      this.audioSource.start(0);
    }

    this.intervalId = setInterval(() => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.frames[this.currentFrame], 0, 0);
      
      // Draw subtitles if available
      if (this.subtitles) {
        const elapsed = (Date.now() - startTime) / 1000;
        const subtitle = this.subtitles.find(s => 
          elapsed >= s.start && elapsed <= s.end
        );
        if (subtitle) {
          this.drawSubtitle(subtitle.text);
        }
      }
      
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      
      // Loop audio
      if (this.currentFrame === 0 && this.manifest.audio && this.audioBuffer) {
        if (this.audioSource) {
          this.audioSource.stop();
        }
        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = this.audioBuffer;
        this.audioSource.connect(this.audioContext.destination);
        this.audioSource.start(0);
      }
    }, interval);
  }

  pause() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioSource) {
      this.audioSource.stop();
      this.audioSource = null;
    }
  }

  restart() {
    this.pause();
    this.currentFrame = 0;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.frames.length > 0) {
      this.ctx.drawImage(this.frames[0], 0, 0);
    }
  }

  drawSubtitle(text) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    const x = this.canvas.width / 2;
    const y = this.canvas.height - 30;
    
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.restore();
  }
}

// Initialize player
let player;

fetch("${magfUrl}")
  .then(r => r.arrayBuffer())
  .then(async buf => {
    const canvas = document.getElementById("magf-canvas");
    player = new MAGFPlayer(buf, canvas);
    player.readHeader();
    player.readManifest();
    await player.loadFrames();
    if (player.manifest.audio) {
      await player.loadAudio();
    }
    if (player.manifest.text) {
      player.loadText();
    }
    
    // Draw first frame
    player.ctx.drawImage(player.frames[0], 0, 0);
  })
  .catch(err => console.error("MAGF load error:", err));

// Controls
document.getElementById("magf-play").addEventListener("click", () => {
  if (player) player.play();
});

document.getElementById("magf-pause").addEventListener("click", () => {
  if (player) player.pause();
});

document.getElementById("magf-restart").addEventListener("click", () => {
  if (player) player.restart();
});
</script>
    `.trim();
  }
}
