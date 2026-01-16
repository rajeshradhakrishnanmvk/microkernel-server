import OpenAI from "openai";

export class OpenAIPlugin {
  async init() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async execute(payload) {
    // Handle both string and object formats for backward compatibility
    const prompt = typeof payload === 'string' ? payload : payload.prompt;
    
    const res = await this.client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Be concise." },
        { role: "user", content: prompt }
      ]
    });

    return res.choices[0].message.content;
  }
}
