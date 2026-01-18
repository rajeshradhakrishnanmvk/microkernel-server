# 🎬 Digital Billboard Manager

> A professional digital billboard application built with SLOP microkernel architecture, featuring AI-powered content generation, dynamic plugin management, and intuitive billboard creation.

![Architecture](https://img.shields.io/badge/Architecture-SLOP-00ff66)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

### 🎨 **Digital Billboard Creation**
- **Bold Typography**: Large fonts (48px-84px) optimized for visibility
- **High-Contrast Colors**: Eye-catching color combinations
- **Minimal Text**: Auto-validation (max 7 words/line, 3 lines)
- **Focal Images**: AI-generated or uploaded visuals
- **Template System**: 4 pre-configured professional templates

### 🤖 **AI Integration**
- **Image Generation**: OpenAI GPT-5 with DALL-E 3 fallback
- **Message Generation**: Rule-based content creation
- **Smart Templates**: Context-aware billboard designs

### ⚡ **SLOP Architecture**
- **Microkernel**: Lightweight core system
- **Plugin Marketplace**: Dynamic load/unload plugins
- **Real-time Logs**: Comprehensive system monitoring
- **Hot Reload**: Update plugins without restart

### 🔄 **Dynamic Features**
- **Content Rotation**: Automatic billboard cycling
- **Live Preview**: Real-time billboard display
- **View Tracking**: Engagement analytics
- **Personalization**: User-specific configurations

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           SLOP Microkernel              │
├─────────────────────────────────────────┤
│  ┌────────────┐      ┌──────────────┐  │
│  │  Billboard │      │    OpenAI    │  │
│  │   Plugin   │      │    Plugin    │  │
│  └────────────┘      └──────────────┘  │
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
│       └── openai.plugin.js     # AI integration
├── public/
│   ├── index.html              # Complete UI application
│   └── images/                 # Static assets
├── BILLBOARD_GUIDE.md          # Comprehensive documentation
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
