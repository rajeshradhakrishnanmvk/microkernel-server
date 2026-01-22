import OpenAI from "openai";
import fs from "fs";
import path from "path";

export class OpenAIPlugin {
  async init() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Store audio files
    this.audioFiles = new Map();
  }

  async execute(payload) {
    const { action, ...params } = typeof payload === 'object' ? payload : { action: 'chat', prompt: payload };
    
    switch (action) {
      case 'generateImage':
        return this.generateImage(params);
      case 'generateAudio':
        return this.generateAudio(params);
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

  async generateAudio({ text, voice = "coral", instructions = "Speak in a cheerful and positive tone.", audioId }) {
    try {
      const mp3 = await this.client.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: voice,
        input: text,
        instructions: instructions,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      
      // Store the audio buffer with an ID
      const id = audioId || Date.now().toString();
      this.audioFiles.set(id, buffer);
      
      return {
        success: true,
        audioId: id,
        size: buffer.length,
        format: 'mp3'
      };
    } catch (error) {
      throw new Error(`Audio generation failed: ${error.message}`);
    }
  }

  getAudioFile(audioId) {
    return this.audioFiles.get(audioId);
  }
}
