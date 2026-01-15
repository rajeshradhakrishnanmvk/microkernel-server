import express from "express";
import { AIMicrokernel } from "./kernel.js";
import { OpenAIPlugin } from "./plugins/openai.plugin.js";

const app = express();
app.use(express.json());

const kernel = new AIMicrokernel();

// register plugins once
kernel.register("llm", new OpenAIPlugin());
kernel.register("infinite", {
  async execute() {
    return new Promise(() => {}); // never resolves
  }
});

// ---- kernel lifecycle endpoints ----
app.post("/boot", async (_, res) => {
  await kernel.boot();
  res.json({ status: "booted", plugins: kernel.report() });
});

app.post("/run/:plugin", async (req, res) => {
  const { plugin } = req.params;
  const { prompt } = req.body;
  const result = await kernel.run(plugin, prompt);
  res.json(result);
});

app.get("/status", (_, res) => {
  res.json(kernel.report());
});

app.listen(3000, () =>
  console.log("Kernel server listening on port 3000")
);
