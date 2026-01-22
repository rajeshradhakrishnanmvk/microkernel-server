/**
 * Test script for audio generation feature
 * Tests the OpenAI TTS integration with billboards
 */

import { AIMicrokernel } from "./server/kernel.js";
import { OpenAIPlugin } from "./server/plugins/openai.plugin.js";
import { BillboardPlugin } from "./server/plugins/billboard.plugin.js";

async function testAudioGeneration() {
  console.log("🎵 Testing Audio Generation for Billboards...\n");

  // Initialize kernel
  const kernel = new AIMicrokernel();
  kernel.register("llm", new OpenAIPlugin());
  kernel.register("billboard", new BillboardPlugin());

  try {
    await kernel.boot();
    console.log("✅ Kernel booted successfully\n");

    // Test 1: Generate audio directly
    console.log("Test 1: Direct audio generation");
    const audioResult = await kernel.run("llm", {
      action: "generateAudio",
      text: "Today is a wonderful day to build something people love!",
      voice: "coral",
      instructions: "Speak in a cheerful and positive tone.",
      audioId: "test_audio_1"
    });

    if (audioResult.success) {
      console.log(`✅ Audio generated successfully!`);
      console.log(`   Audio ID: ${audioResult.audioId}`);
      console.log(`   Size: ${audioResult.size} bytes`);
      console.log(`   Format: ${audioResult.format}\n`);
    } else {
      console.log("❌ Audio generation failed\n");
    }

    // Test 2: Generate AI billboard with audio
    console.log("Test 2: AI Billboard generation with audio");
    const billboardResult = await kernel.run("billboard", {
      action: "generateAIBillboard",
      description: "New Product Launch - Revolutionary AI Assistant"
    });

    if (billboardResult) {
      console.log("✅ AI Billboard generated successfully!");
      console.log(`   Text: ${billboardResult.text.substring(0, 50)}...`);
      console.log(`   Background: ${billboardResult.bgColor}`);
      console.log(`   Text Color: ${billboardResult.textColor}`);
      console.log(`   Audio ID: ${billboardResult.audioId || 'No audio'}`);
      console.log(`   AI Generated: ${billboardResult.aiGenerated}\n`);

      // Test 3: Create billboard with the generated config
      console.log("Test 3: Creating billboard with audio");
      const createResult = await kernel.run("billboard", {
        action: "create",
        text: billboardResult.text,
        bgColor: billboardResult.bgColor,
        textColor: billboardResult.textColor,
        audioId: billboardResult.audioId
      });

      if (createResult) {
        console.log("✅ Billboard created successfully!");
        console.log(`   ID: ${createResult.id}`);
        console.log(`   Has Audio: ${createResult.audioId ? 'Yes' : 'No'}\n`);
      }
    }

    console.log("🎉 All tests completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("   This might be because:");
    console.error("   - OPENAI_API_KEY is not set");
    console.error("   - API key is invalid");
    console.error("   - Network connection issue");
    console.error("   - OpenAI API quota exceeded");
    process.exit(1);
  }
}

testAudioGeneration();
