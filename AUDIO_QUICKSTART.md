# 🎵 Quick Start: Audio-Enabled Billboards

## Get Started in 3 Steps

### 1️⃣ Set Your OpenAI API Key

```bash
export OPENAI_API_KEY="sk-your-api-key-here"
```

Or create a `.env` file in the `server/` directory:
```
OPENAI_API_KEY=sk-your-api-key-here
```

### 2️⃣ Start the Server

```bash
cd server
node index.js
```

You should see:
```
Kernel server running at http://localhost:3000
```

### 3️⃣ Create Your First Audio Billboard

**Option A: Using the Browser UI**

1. Open http://localhost:3000
2. Scroll to "✨ AI QUICK CREATE"
3. Enter: `"Summer Sale - 50% Off Everything"`
4. Click: **"✨ CREATE WITH AI (ONE CLICK!)"**
5. Wait a few seconds for AI to generate
6. Billboard appears with text, colors, and **🔊 PLAY AUDIO** button
7. Click **🔊 PLAY AUDIO** to hear the narration!

**Option B: Using the API**

```javascript
// Generate AI billboard with audio
const response = await fetch('http://localhost:3000/run/billboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'generateAIBillboard',
    description: 'Grand Opening - Join Us This Weekend!'
  })
});

const billboard = await response.json();
console.log('Audio ID:', billboard.result.audioId);
```

## 🎯 What Happens Automatically

When you create an AI billboard, the system:

1. ✅ Generates attention-grabbing text
2. ✅ Selects perfect colors (based on billboard type)
3. ✅ Creates an image (if relevant)
4. ✅ **Generates audio narration** ← NEW!

All in one click!

## 🎤 Customize the Voice

To change the voice, edit `server/plugins/billboard.plugin.js`:

```javascript
// Find this section in generateAIBillboard():
const audioResponse = await kernel.run('llm', {
  action: 'generateAudio',
  text: billboardText,
  voice: 'coral',  // ← Change this!
  instructions: 'Speak in a cheerful and positive tone.'
});
```

Available voices:
- `coral` - Cheerful female (default)
- `nova` - Energetic female
- `shimmer` - Warm female
- `alloy` - Neutral voice
- `echo` - Clear male
- `onyx` - Deep male
- `fable` - Storytelling voice

## 🧪 Test the Feature

```bash
node test-audio.js
```

This will:
- ✅ Test audio generation
- ✅ Test AI billboard creation
- ✅ Verify audio integration

## 🎨 UI Features

### Play Button States

| Icon | State | Description |
|------|-------|-------------|
| 🔊 PLAY AUDIO | Ready | Click to play audio |
| ⏸️ PLAYING... | Active | Audio is playing |
| ❌ ERROR | Failed | Playback error (auto-resets) |

### Billboard Features

- **Green audio button** appears on billboards with audio
- **Only one audio plays** at a time
- **Visual feedback** shows playback status
- **AI Generated badge** appears on AI-created billboards

## 🐛 Troubleshooting

### No audio button appears
- Check if billboard has `audioId` property
- Audio generation may have failed (check server logs)
- Billboard was created manually (no audio generated)

### Audio won't play
- Check browser console for errors
- Verify `/audio/:audioId` endpoint is accessible
- Ensure OpenAI API key is valid
- Check API quota/rate limits

### Audio generation fails
- Billboard still creates successfully (without audio)
- Check server console for error details
- Verify OpenAI API key has TTS access
- Check network connectivity

## 📊 Monitor Audio Generation

Watch server logs to see audio being generated:

```
[INFO] [billboard] Executing plugin
[DEBUG] [llm] Executing plugin
[INFO] [llm] Audio generated successfully
```

## 🚀 Advanced Usage

### Generate audio separately

```javascript
// Step 1: Generate audio
const audio = await fetch('/run/llm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'generateAudio',
    text: 'Your custom message here',
    voice: 'onyx',
    instructions: 'Speak with authority and confidence'
  })
});

const { audioId } = await audio.json();

// Step 2: Create billboard with the audio
const billboard = await fetch('/run/billboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create',
    text: 'YOUR MESSAGE\nHERE',
    bgColor: '#FF0000',
    textColor: '#FFFFFF',
    audioId: audioId  // Link the audio
  })
});
```

### Download audio file

Audio is streamed from `/audio/:audioId`:

```javascript
// Get audio URL
const audioUrl = `/audio/${billboard.audioId}`;

// Create download link
const a = document.createElement('a');
a.href = audioUrl;
a.download = 'billboard-audio.mp3';
a.click();
```

## 📚 Next Steps

- Read [AUDIO_INTEGRATION.md](AUDIO_INTEGRATION.md) for detailed docs
- See [AUDIO_FEATURE_SUMMARY.md](AUDIO_FEATURE_SUMMARY.md) for implementation details
- View [AUDIO_ARCHITECTURE.txt](AUDIO_ARCHITECTURE.txt) for system architecture

## 💡 Tips

1. **Keep text short** - Audio works best with concise billboard text
2. **Test different voices** - Each voice has different tone/style
3. **Customize instructions** - Guide the AI's speaking style
4. **Monitor performance** - Audio generation adds ~2-3 seconds to billboard creation

## ❓ FAQ

**Q: Does every billboard need audio?**  
A: No, only AI-generated billboards automatically get audio. Manual billboards don't have audio unless you add it.

**Q: How much does audio generation cost?**  
A: OpenAI TTS pricing: ~$15 per 1 million characters. A typical billboard (50 chars) = $0.00075

**Q: Can I use custom voices?**  
A: Currently supports OpenAI's built-in voices. Custom voices require OpenAI's Voice Library (enterprise feature).

**Q: How long are audio files stored?**  
A: Currently stored in memory until server restarts. For production, implement file system storage.

**Q: Can audio be disabled?**  
A: Yes, simply don't click the play button. Or remove audio generation from `generateAIBillboard()`.

## 🎉 You're Ready!

Start creating audio-enabled billboards and bring your content to life with AI-generated narration!
