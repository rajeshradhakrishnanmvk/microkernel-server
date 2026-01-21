async function encodeMAGF({ frames, audioBuffer, subtitles }) {
  const encoder = new TextEncoder();

  const manifest = {
    frames: frames.length,
    width: frames[0].width,
    height: frames[0].height,
    audio: !!audioBuffer,
    text: !!subtitles
  };

  const manifestBytes = encoder.encode(JSON.stringify(manifest));

  const header = new ArrayBuffer(16);
  const view = new DataView(header);
  view.setUint8(0, "M".charCodeAt(0));
  view.setUint8(1, "A".charCodeAt(0));
  view.setUint8(2, "G".charCodeAt(0));
  view.setUint8(3, "F".charCodeAt(0));
  view.setUint8(4, "J".charCodeAt(0));
  view.setUint8(5, "S".charCodeAt(0));
  view.setUint16(6, 1, true);      // version
  view.setFloat32(8, 10.0, true);  // duration
  view.setUint16(12, 15, true);    // fps
  view.setUint16(14, 0, true);     // flags

  const chunks = [header];

  const manifestLen = new Uint32Array([manifestBytes.length]);
  chunks.push(manifestLen.buffer);
  chunks.push(manifestBytes.buffer);

  // Frames (PNG blobs)
  for (const frame of frames) {
    const len = new Uint32Array([frame.byteLength]);
    chunks.push(len.buffer);
    chunks.push(frame);
  }

  if (audioBuffer) {
    const len = new Uint32Array([audioBuffer.byteLength]);
    chunks.push(len.buffer);
    chunks.push(audioBuffer);
  }

  return new Blob(chunks, { type: "application/octet-stream" });
}
