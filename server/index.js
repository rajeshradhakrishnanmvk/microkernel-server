import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { AIMicrokernel } from "./kernel.js";
import { OpenAIPlugin } from "./plugins/openai.plugin.js";
import { BillboardPlugin } from "./plugins/billboard.plugin.js";
import { MAGFPlugin } from "./plugins/magf.plugin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 🔹 Serve browser UI
app.use(express.static(path.join(__dirname, "../public")));

// 🔹 Explicit root route (important for clarity)
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ----- Kernel setup -----
const kernel = new AIMicrokernel();
kernel.register("llm", new OpenAIPlugin());
kernel.register("billboard", new BillboardPlugin());
kernel.register("magf", new MAGFPlugin());
kernel.register("infinite", {
  async execute() {
    return new Promise(() => {});
  }
});

await kernel.boot();

// ----- Plugin Management API -----
app.post("/plugin/:name", async (req, res) => {
  const { name } = req.params;
  
  try {
    if (name === "billboard") {
      kernel.register("billboard", new BillboardPlugin());
      await kernel.boot();
      res.json({ status: "loaded", plugin: name });
    } else {
      res.status(404).json({ error: "Plugin not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/plugin/:name", async (req, res) => {
  const { name } = req.params;
  
  try {
    if (kernel.unregister) {
      kernel.unregister(name);
      res.json({ status: "unloaded", plugin: name });
    } else {
      delete kernel.plugins[name];
      delete kernel.status[name];
      res.json({ status: "unloaded", plugin: name });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- Kernel API -----
app.post("/boot", async (_, res) => {
  await kernel.boot();
  res.json({ status: "booted", plugins: kernel.report() });
});

app.post("/run/:plugin", async (req, res) => {
  try {
    const result = await kernel.run(req.params.plugin, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/status", (_, res) => {
  res.json(kernel.report());
});

// ----- System Log API -----
app.get("/logs", (req, res) => {
  const filter = {
    level: req.query.level,
    plugin: req.query.plugin,
    limit: req.query.limit ? parseInt(req.query.limit) : undefined
  };
  res.json(kernel.getLog(filter));
});

app.delete("/logs", (_, res) => {
  kernel.clearLog();
  res.json({ status: "cleared" });
});

// ----- MAGF-specific endpoints -----
app.get("/magf/:id/download", async (req, res) => {
  try {
    const result = await kernel.run("magf", { 
      action: "get", 
      id: parseInt(req.params.id) 
    });
    
    if (result.error) {
      return res.status(404).json(result);
    }
    
    const magfData = result.result;
    
    // Encode the MAGF file
    const encodeResult = await kernel.run("magf", {
      action: "encode",
      frames: magfData._frames,
      audioBuffer: magfData._audioBuffer,
      subtitles: magfData._subtitles,
      fps: magfData.fps,
      duration: magfData.duration
    });
    
    if (encodeResult.error) {
      return res.status(500).json(encodeResult);
    }
    
    const blob = encodeResult.result;
    const buffer = await blob.arrayBuffer();
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${magfData.name}.magf"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/magf/:id/player", async (req, res) => {
  try {
    const result = await kernel.run("magf", { 
      action: "get", 
      id: parseInt(req.params.id) 
    });
    
    if (result.error) {
      return res.status(404).json(result);
    }
    
    const magfData = result.result;
    const playerHTML = await kernel.run("magf", {
      action: "getPlayerHTML",
      width: magfData.width,
      height: magfData.height,
      magfUrl: `/magf/${req.params.id}/download`
    });
    
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${magfData.name} - MAGF Player</title>
  <style>
    body {
      background: #0d0d0d;
      color: white;
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    h1 {
      color: #3a86ff;
      margin-bottom: 20px;
    }
    .info {
      background: #1a1a1a;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      max-width: 640px;
      width: 100%;
    }
    .info p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <h1>${magfData.name}</h1>
  <div class="info">
    <p><strong>Resolution:</strong> ${magfData.width}x${magfData.height}</p>
    <p><strong>FPS:</strong> ${magfData.fps}</p>
    <p><strong>Duration:</strong> ${magfData.duration.toFixed(2)}s</p>
    <p><strong>Frames:</strong> ${magfData.frameCount}</p>
    <p><strong>Audio:</strong> ${magfData.hasAudio ? 'Yes' : 'No'}</p>
    <p><strong>Text:</strong> ${magfData.hasText ? 'Yes' : 'No'}</p>
  </div>
  ${playerHTML.result}
</body>
</html>
    `);
  } catch (err) {
    res.status(500).send(`<h1>Error: ${err.message}</h1>`);
  }
});

app.listen(3000, () => {
  console.log("Kernel server running at http://localhost:3000");
});
