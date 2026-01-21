# 🎬 Digital Billboard Manager

> A professional digital billboard application built with SLOP microkernel architecture, featuring AI-powered content generation, dynamic plugin management, and intuitive billboard creation with a Facebook-like social feed interface.

![Architecture](https://img.shields.io/badge/Architecture-SLOP-00ff66)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

### 🎨 **Digital Billboard Creation**
- **Facebook-like Feed**: Modern 3-column social media interface
- **Bold Typography**: Large fonts (32px-72px) optimized for visibility
- **High-Contrast Colors**: Eye-catching 2026 saturated color palettes
- **Minimal Text**: Auto-validation (max 7 words/line, 3 lines)
- **Quick Templates**: One-click style selection
- **Three Creation Modes**: Simple, Advanced, and AI-powered

### 🎬 **MAGF (Multimedia Animated Graphics Format)**
- **Browser-native playback**: No third-party codecs required
- **Lightweight**: < 10 MB multimedia containers
- **Video + Audio + Text**: Complete multimedia support
- **GIF-like looping**: Smooth, seamless animation playback
- **Web Audio API**: High-quality audio synchronization
- **Interactive demo**: Create and preview MAGF files in-browser

### 📱 **SLOP Architecture** (Server-Local-Optimistic-Progressive)
- **Server-rendered**: RESTful API integration with microkernel
- **Local-first**: IndexedDB persistence for offline support
- **Optimistic updates**: Instant UI feedback, background sync
- **Progressive enhancement**: Works offline, enhanced when online

### 🤖 **AI Integration**
- **Image Generation**: OpenAI GPT-5 with DALL-E 3 fallback
- **Message Generation**: AI-powered billboard content
- **Smart Templates**: Context-aware billboard designs
- **Fallback System**: Local generation when AI unavailable

### 🔄 **Social Features**
- **Like System**: Heart/unlike billboards
- **Share Functionality**: Native share API support
- **Delete/Edit**: Manage your billboards
- **Real-time Stats**: Live likes, views, and activity tracking
- **Time Stamps**: Relative time display (just now, 5m ago, etc.)

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           SLOP Microkernel              │
├─────────────────────────────────────────┤
│  ┌────────────┐  ┌──────────┐  ┌─────┐ │
│  │  Billboard │  │  OpenAI  │  │MAGF │ │
│  │   Plugin   │  │  Plugin  │  │Plugin│ │
│  └────────────┘  └──────────┘  └─────┘ │
├─────────────────────────────────────────┤
│         Kernel Management               │
│  • Register    • Boot    • Execute      │
│  • Unregister  • Report  • Status       │
└─────────────────────────────────────────┘
         │                    │
         ▼                    ▼
   Express Server      Frontend UI
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API Key

### Installation

```bash
# Clone repository
cd /workspaces/microkernel-server

# Install dependencies
cd server
npm install

# Set up environment
echo "OPENAI_API_KEY=your-api-key-here" > .env

# Start server
node index.js
```

### Access Application
Open browser: `http://localhost:3000`

## 📦 Project Structure

```
microkernel-server/
├── server/
│   ├── index.js                 # Express server & kernel setup
│   ├── kernel.js                # SLOP microkernel core
│   ├── package.json             # Dependencies
│   └── plugins/
│       ├── billboard.plugin.js  # Billboard management
│       ├── openai.plugin.js     # AI integration
│       ├── magf.plugin.js       # MAGF multimedia
│       └── MAGF_README.md       # MAGF documentation
├── public/
│   ├── index.html              # Billboard feed UI
│   ├── magf-demo.html          # MAGF demo/creator
│   └── images/                 # Static assets
├── BILLBOARD_GUIDE.md          # Comprehensive documentation
├── test-magf.js                # MAGF plugin tests
└── README.md                   # This file
```

## 🎯 Usage

### 1. Create a Billboard

```javascript
// Via UI: Click "Create Billboard" tab
// Via API:
POST /run/billboard
{
  "action": "create",
  "text": "HUGE SALE\n50% OFF\nLIMITED TIME",
  "bgColor": "#FF0000",
  "textColor": "#FFFFFF",
  "fontSize": "72px"
}
```

### 2. Generate AI Content

```javascript
// Generate Message
POST /run/billboard
{
  "action": "generateMessage",
  "topic": "Summer Sale",
  "template": "sale"
}

// Generate Image
POST /run/llm
{
  "action": "generateImage",
  "prompt": "Happy shoppers with bags"
}
```

### 3. Manage Plugins

```javascript
// Load plugin
POST /plugin/billboard

// Check status
GET /status
```

### 4. Create MAGF Animation

```javascript
// Via UI: Visit /magf-demo.html
// Via API:
POST /run/magf
{
  "action": "create",
  "name": "My Animation",
  "frames": [...],  // Array of image buffers
  "fps": 15,
  "subtitles": [
    { "start": 0, "end": 2, "text": "Hello MAGF!" }
  ]
}

// Play MAGF
GET /magf/:id/player

// Download MAGF
GET /magf/:id/download
```

// Unload plugin
DELETE /plugin/billboard

// Check status
GET /status
```

## 🎨 Templates

| Template | Color Scheme | Use Case |
|----------|-------------|----------|
| **Sale/Promotion** | Red/White | Discounts, special offers |
| **Announcement** | Blue/Yellow | News, updates |
| **Brand Awareness** | Black/Green | Company messaging |
| **Event Promotion** | Purple/White | Events, conferences |

## 🔌 Plugin Development

Create custom plugins:

```javascript
// my-plugin.js
export class MyPlugin {
  async init() {
    console.log('Plugin initialized');
  }
  
  async execute(payload) {
    return { result: 'Custom logic here' };
  }
}

// Register in index.js
import { MyPlugin } from './plugins/my-plugin.js';
kernel.register('myPlugin', new MyPlugin());
```

## 🛠️ API Reference

### Kernel Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/boot` | Boot kernel |
| GET | `/status` | Plugin status |
| POST | `/run/:plugin` | Execute plugin |
| POST | `/plugin/:name` | Load plugin |
| DELETE | `/plugin/:name` | Unload plugin |

### Billboard Actions

- `create` - Create new billboard
- `update` - Update existing billboard
- `get` - Retrieve billboard by ID
- `list` - List all billboards
- `delete` - Delete billboard
- `generateMessage` - AI message generation
- `getTemplates` - Get available templates

## 📊 Digital Billboard Best Practices

### ✅ DO
- Use bold, large fonts (64px+)
- High-contrast color combinations
- Keep text under 7 words per line
- Maximum 3 lines of text
- Single focal image
- Clear call-to-action

### ❌ DON'T
- Use small or thin fonts
- Low-contrast colors
- Write long paragraphs
- Clutter with multiple images
- Use complex messaging

## 🎯 NFR Compliance

- **Performance**: Vanilla JS, no frameworks
- **Scalability**: Plugin-based architecture
- **Maintainability**: Clear separation of concerns
- **Usability**: Intuitive 4-tab interface
- **Reliability**: Error handling & fallbacks
- **Security**: Environment variables for secrets

## 🧪 Testing

```bash
# Test billboard creation
curl -X POST http://localhost:3000/run/billboard \
  -H "Content-Type: application/json" \
  -d '{"action":"list"}'

# Test plugin status
curl http://localhost:3000/status
```

## 📈 Future Roadmap

- [ ] Database persistence (MongoDB/PostgreSQL)
- [ ] User authentication & authorization
- [ ] Billboard scheduling system
- [ ] A/B testing framework
- [ ] Advanced analytics dashboard
- [ ] Export to video/image formats
- [ ] Multi-language support
- [ ] Real-time collaboration
- [x] **MAGF multimedia format** (browser-native playback)
- [ ] MAGF audio recording from microphone
- [ ] MAGF screen recording support
- [ ] MAGF to GIF/MP4 conversion

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **SLOP Architecture**: Microkernel design pattern
- **OpenAI**: AI-powered image & text generation
- **Express.js**: Web framework
- **Digital Billboard Industry**: Best practice guidelines

## 📞 Support

- 📖 [Full Documentation](BILLBOARD_GUIDE.md)
- 🐛 Report Issues
- 💬 Community Discussions

---

**Built with ❤️ using SLOP Architecture** | **Version 1.0.0** | **January 2026**
