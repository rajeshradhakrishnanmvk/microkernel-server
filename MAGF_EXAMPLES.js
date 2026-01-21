/**
 * MAGF Usage Examples
 * 
 * This file demonstrates various ways to create and use MAGF files
 * programmatically with the MAGF plugin.
 */

import { createCanvas } from 'canvas'; // npm install canvas (for Node.js)
// Or use OffscreenCanvas in the browser

// ============================================
// Example 1: Simple Color Animation
// ============================================

async function createColorAnimation() {
  const width = 640;
  const height = 360;
  const fps = 15;
  const frameCount = 45; // 3 seconds at 15 FPS
  const frames = [];

  for (let i = 0; i < frameCount; i++) {
    // Create canvas (browser)
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Or for Node.js:
    // const canvas = createCanvas(width, height);
    // const ctx = canvas.getContext('2d');
    
    // Draw animated content
    const hue = (i / frameCount) * 360;
    ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Frame ${i + 1}`, width / 2, height / 2);
    
    // Convert to blob
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    const buffer = await blob.arrayBuffer();
    
    frames.push({
      byteLength: buffer.byteLength,
      width: width,
      height: height,
      data: Array.from(new Uint8Array(buffer))
    });
  }
  
  // Create MAGF via API
  const response = await fetch('http://localhost:3000/run/magf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create',
      name: 'Color Animation',
      frames,
      fps,
      subtitles: [
        { start: 0, end: 1.5, text: 'Watch the colors!' },
        { start: 1.5, end: 3, text: 'MAGF is awesome!' }
      ]
    })
  });
  
  const result = await response.json();
  console.log('Created MAGF:', result.result);
  return result.result.id;
}

// ============================================
// Example 2: Bouncing Ball Animation
// ============================================

async function createBouncingBall() {
  const width = 640;
  const height = 360;
  const fps = 30;
  const duration = 5; // seconds
  const frameCount = fps * duration;
  const frames = [];
  
  let y = 30; // ball y position
  let velocity = 0;
  const gravity = 0.5;
  const ballRadius = 30;
  
  for (let i = 0; i < frameCount; i++) {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Update physics
    velocity += gravity;
    y += velocity;
    
    // Bounce
    if (y > height - ballRadius) {
      y = height - ballRadius;
      velocity *= -0.8; // dampening
    }
    
    // Draw ball
    ctx.fillStyle = '#ff006e';
    ctx.beginPath();
    ctx.arc(width / 2, y, ballRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(width / 2, height - 10, ballRadius, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    const buffer = await blob.arrayBuffer();
    
    frames.push({
      byteLength: buffer.byteLength,
      width,
      height,
      data: Array.from(new Uint8Array(buffer))
    });
  }
  
  const response = await fetch('http://localhost:3000/run/magf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create',
      name: 'Bouncing Ball',
      frames,
      fps
    })
  });
  
  const result = await response.json();
  return result.result.id;
}

// ============================================
// Example 3: Loading and Playing MAGF
// ============================================

async function loadAndPlayMAGF(magfId) {
  // Fetch the MAGF file
  const response = await fetch(`http://localhost:3000/magf/${magfId}/download`);
  const arrayBuffer = await response.arrayBuffer();
  
  // Get canvas element
  const canvas = document.getElementById('magf-player');
  
  // Create player
  class MAGFPlayer {
    constructor(arrayBuffer, canvas) {
      this.buffer = arrayBuffer;
      this.view = new DataView(arrayBuffer);
      this.offset = 0;
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.currentFrame = 0;
      this.isPlaying = false;
    }

    readHeader() {
      const magic = String.fromCharCode(
        ...new Uint8Array(this.buffer.slice(0, 6))
      );
      if (magic !== 'MAGFJS') throw new Error('Invalid MAGF file');

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

    play() {
      if (this.isPlaying) return;
      
      this.isPlaying = true;
      const interval = 1000 / this.fps;

      this.intervalId = setInterval(() => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.frames[this.currentFrame], 0, 0);
        this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      }, interval);
    }

    pause() {
      if (!this.isPlaying) return;
      this.isPlaying = false;
      clearInterval(this.intervalId);
    }
  }
  
  const player = new MAGFPlayer(arrayBuffer, canvas);
  player.readHeader();
  player.readManifest();
  await player.loadFrames();
  player.play();
  
  return player;
}

// ============================================
// Example 4: Text Slideshow
// ============================================

async function createTextSlideshow(messages) {
  const width = 1280;
  const height = 720;
  const fps = 2; // 2 frames per second (slow)
  const frames = [];
  
  const colors = [
    { bg: '#ff006e', text: '#ffffff' },
    { bg: '#8338ec', text: '#ffff00' },
    { bg: '#3a86ff', text: '#ffffff' },
    { bg: '#00ff88', text: '#000000' }
  ];
  
  for (let i = 0; i < messages.length; i++) {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    const colorScheme = colors[i % colors.length];
    
    // Background
    ctx.fillStyle = colorScheme.bg;
    ctx.fillRect(0, 0, width, height);
    
    // Text
    ctx.fillStyle = colorScheme.text;
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Word wrap
    const words = messages[i].split(' ');
    let line = '';
    let y = height / 2 - 50;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > width - 100 && line !== '') {
        ctx.fillText(line, width / 2, y);
        line = word + ' ';
        y += 90;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, width / 2, y);
    
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    const buffer = await blob.arrayBuffer();
    
    frames.push({
      byteLength: buffer.byteLength,
      width,
      height,
      data: Array.from(new Uint8Array(buffer))
    });
  }
  
  const response = await fetch('http://localhost:3000/run/magf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create',
      name: 'Text Slideshow',
      frames,
      fps
    })
  });
  
  const result = await response.json();
  return result.result.id;
}

// ============================================
// Example 5: Managing MAGF Files
// ============================================

async function listAllMAGFs() {
  const response = await fetch('http://localhost:3000/run/magf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list' })
  });
  
  const result = await response.json();
  return result.result;
}

async function getMAGFInfo(id) {
  const response = await fetch('http://localhost:3000/run/magf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get', id })
  });
  
  const result = await response.json();
  return result.result;
}

async function deleteMAGF(id) {
  const response = await fetch('http://localhost:3000/run/magf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id })
  });
  
  const result = await response.json();
  return result.result;
}

async function downloadMAGF(id, filename) {
  window.location.href = `http://localhost:3000/magf/${id}/download`;
}

// ============================================
// Usage
// ============================================

// Browser example:
/*
(async () => {
  // Create animation
  const id = await createColorAnimation();
  console.log('Created MAGF with ID:', id);
  
  // List all
  const allMAGFs = await listAllMAGFs();
  console.log('All MAGFs:', allMAGFs);
  
  // Play in browser
  const canvas = document.getElementById('magf-player');
  const player = await loadAndPlayMAGF(id);
  
  // Later: pause
  player.pause();
})();
*/

export {
  createColorAnimation,
  createBouncingBall,
  createTextSlideshow,
  loadAndPlayMAGF,
  listAllMAGFs,
  getMAGFInfo,
  deleteMAGF,
  downloadMAGF
};
