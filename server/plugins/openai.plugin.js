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
    const { action, ...params } = typeof payload === 'object' ? payload : { action: 'chat', prompt: payload };
    
    switch (action) {
      case 'generateImage':
        return this.generateImage(params);
      case 'chat':
      default:
        return this.chat(params);
    }
  }

  async chat({ prompt, model = "gpt-3.5-turbo" }) {
    const res = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "Be concise." },
        { role: "user", content: prompt }
      ]
    });

    return res.choices[0].message.content;
  }

  async generateImage({ prompt, description }) {
    try {
      // Using the new unified API structure as specified in user requirements
      const response = await this.client.responses.create({
        model: "gpt-5",
        input: description || prompt,
        tools: [{ type: "image_generation" }],
      });

      // Extract image data from response
      const imageData = response.output
        .filter((output) => output.type === "image_generation_call")
        .map((output) => output.result);

      if (imageData.length > 0) {
        return {
          success: true,
          imageBase64: imageData[0],
          prompt: description || prompt
        };
      } else {
        throw new Error("No image generated");
      }
    } catch (error) {
      // Fallback to DALL-E if gpt-5 responses API is not available
      try {
        const response = await this.client.images.generate({
          model: "dall-e-3",
          prompt: description || prompt,
          n: 1,
          size: "1024x1024",
          response_format: "b64_json"
        });

        return {
          success: true,
          imageBase64: response.data[0].b64_json,
          prompt: description || prompt,
          fallback: true
        };
      } catch (fallbackError) {
        throw new Error(`Image generation failed: ${error.message}`);
      }
    }
  }
}
