# Audio Integration for Billboard Plugin

## Overview

This implementation adds OpenAI Text-to-Speech (TTS) audio generation to the billboard creation system. When billboards are created using AI, audio narration is automatically generated and can be played directly in the UI.

## Features

- **Automatic Audio Generation**: AI-generated billboards automatically include audio narration
- **Browser Playback**: Audio plays directly in the browser using the HTML5 Audio API
- **Visual Feedback**: Play button shows playback status (playing, error, etc.)
- **Audio Management**: Audio files are stored server-side and streamed on demand

## Architecture

### Server-Side Components

#### 1. OpenAI Plugin (`server/plugins/openai.plugin.js`)

**New Methods:**
- `generateAudio({ text, voice, instructions, audioId })`: Generates MP3 audio using OpenAI TTS
- `getAudioFile(audioId)`: Retrieves stored audio buffer by ID

**Features:**
- Uses `gpt-4o-mini-tts` model for high-quality speech
- Stores audio buffers in memory with unique IDs
- Returns audio metadata (size, format, ID)

#### 2. Billboard Plugin (`server/plugins/billboard.plugin.js`)

**Updated Methods:**
- `createBillboard()`: Now accepts `audioId` parameter
- `generateAIBillboard()`: Automatically generates audio for billboard text

**Integration:**
- When AI generates a billboard, it also generates matching audio
- Audio ID is stored with the billboard data
- Audio generation is non-blocking (continues if it fails)

#### 3. Server API (`server/index.js`)

**New Endpoint:**
```
GET /audio/:audioId
```
- Streams audio file to browser
- Sets proper content-type (`audio/mpeg`)
- Returns 404 if audio not found

### Client-Side Components

#### 1. Billboard Rendering (`public/index.html`)

**renderFeed() Updates:**
- Displays audio play button if `billboard.audioId` exists
- Button positioned in bottom-right of billboard content
- Styled with green theme to indicate audio availability

**Audio Controls:**
- 🔊 PLAY AUDIO button appears on billboards with audio
- Button changes to ⏸️ PLAYING... during playback
- Shows ❌ ERROR if playback fails

#### 2. Audio Playback Function

```javascript
playBillboardAudio(audioId, billboardId)
```

**Features:**
- Stops any currently playing audio before starting new playback
- Fetches audio from `/audio/${audioId}` endpoint
- Updates button state during playback
- Handles errors gracefully with user feedback

**State Management:**
- `currentAudio` global variable tracks active audio
- Only one audio plays at a time
- Cleanup on playback end or error

## Usage

### Creating a Billboard with Audio (AI)

```javascript
// AI-generated billboards automatically include audio
const response = await fetch('/run/billboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'generateAIBillboard',
    description: 'New Product Launch - Revolutionary AI Assistant'
  })
});

const data = await response.json();
// data.result.audioId contains the audio ID
```

### Creating a Billboard with Custom Audio

```javascript
// Step 1: Generate audio
const audioResponse = await fetch('/run/llm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'generateAudio',
    text: 'Your billboard text here',
    voice: 'coral',
    instructions: 'Speak in a cheerful tone'
  })
});

const audioData = await audioResponse.json();

// Step 2: Create billboard with audio ID
const billboardResponse = await fetch('/run/billboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create',
    text: 'Your billboard text',
    bgColor: '#FF0000',
    textColor: '#FFFFFF',
    audioId: audioData.result.audioId
  })
});
```

### Playing Audio in Browser

Audio plays automatically when the user clicks the "🔊 PLAY AUDIO" button. The implementation:

1. Fetches audio from `/audio/${audioId}`
2. Creates HTML5 Audio element
3. Plays audio with visual feedback
4. Handles errors and cleanup

## Voice Options

OpenAI TTS supports multiple voices:
- `coral` (default) - Cheerful, friendly female voice
- `alloy` - Neutral, balanced voice
- `echo` - Male voice with good clarity
- `fable` - Expressive, storytelling voice
- `onyx` - Deep, authoritative male voice
- `nova` - Energetic, engaging female voice
- `shimmer` - Warm, friendly female voice

Change voice in the `generateAudio` call:

```javascript
{
  action: 'generateAudio',
  text: 'Your text',
  voice: 'nova',  // Change this
  instructions: 'Speak enthusiastically'
}
```

## Audio Generation Parameters

```javascript
{
  model: "gpt-4o-mini-tts",        // TTS model
  voice: "coral",                  // Voice selection
  input: "text to speak",          // Billboard text
  instructions: "tone/style"       // Speaking instructions
}
```

## Error Handling

The system gracefully handles failures:

1. **Audio Generation Fails**: Billboard is still created without audio
2. **Audio Playback Fails**: Shows error message, button resets after 2 seconds
3. **Network Issues**: User can retry by clicking button again

Console warnings are logged but don't interrupt billboard creation.

## Performance Considerations

- **Memory Usage**: Audio buffers stored in-memory (consider adding file system storage for production)
- **Concurrent Playback**: Only one audio plays at a time to prevent audio chaos
- **Lazy Loading**: Audio is only fetched when play button is clicked

## Future Enhancements

Potential improvements:
1. **Persistent Storage**: Save audio files to disk instead of memory
2. **Audio Cache**: Cache audio in browser using IndexedDB
3. **Playlist Mode**: Auto-play through billboards
4. **Volume Control**: Add volume slider
5. **Download Option**: Allow users to download audio files
6. **Voice Selection UI**: Let users choose voice before generation
7. **Background Music**: Add subtle background music to billboards
8. **Audio Visualization**: Show waveform or spectrum analyzer

## Testing

Run the test script to verify audio integration:

```bash
npm run test:audio
# or
node test-audio.js
```

This tests:
- Direct audio generation
- AI billboard generation with audio
- Billboard creation with audio ID
- Kernel integration

## Dependencies

- `openai` npm package (already included)
- OpenAI API key with TTS access
- Browser with HTML5 Audio support (all modern browsers)

## API Key Requirements

Ensure `OPENAI_API_KEY` environment variable is set:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

Or in `.env` file:
```
OPENAI_API_KEY=your-api-key-here
```

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

All modern browsers support HTML5 Audio with MP3 playback.
