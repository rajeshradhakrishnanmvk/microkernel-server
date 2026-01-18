import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { AIMicrokernel } from "./kernel.js";
import { OpenAIPlugin } from "./plugins/openai.plugin.js";
import { BillboardPlugin } from "./plugins/billboard.plugin.js";

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

app.listen(3000, () => {
  console.log("Kernel server running at http://localhost:3000");
});
