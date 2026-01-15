import express from "express";
import { AIMicrokernel } from "./kernel.js";
import { OpenAIPlugin } from "./plugins/openai.plugin.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

const kernel = new AIMicrokernel();
kernel.register("llm", new OpenAIPlugin());

await kernel.boot();

app.post("/run/:plugin", async (req, res) => {
  const result = await kernel.run(req.params.plugin, req.body.prompt);
  res.json(result);
});

app.get("/status", (_, res) => {
  res.json(kernel.report());
});

app.use("/", express.static(path.join(__dirname, "../public")));

app.listen(3000, () => {
  console.log("Kernel server running on port 3000");
});
