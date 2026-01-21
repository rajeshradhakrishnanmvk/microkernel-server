class MAGFPlayer {
  constructor(arrayBuffer, canvas) {
    this.buffer = arrayBuffer;
    this.view = new DataView(arrayBuffer);
    this.offset = 0;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  readHeader() {
    const magic = String.fromCharCode(
      ...new Uint8Array(this.buffer.slice(0, 6))
    );
    if (magic !== "MAGFJS") throw "Invalid MAGF";

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
    let i = 0;
    const interval = 1000 / 15;

    setInterval(() => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.frames[i], 0, 0);
      i = (i + 1) % this.frames.length;
    }, interval);
  }
}