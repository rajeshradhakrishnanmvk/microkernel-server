# AI Conversation Billboards - SLOP Architecture

## Overview

This project implements **AI-enabled conversation billboards** using the SLOP (Supervised, Loadable, Observable Plugins) microkernel architecture with a **Plugin Marketplace** for dynamic plugin management.

## Quick Start

### 1. Set up your OpenAI API key
```bash
export OPENAI_API_KEY='your-api-key-here'
```

### 2. Start the server
```bash
cd server
node index.js
```

### 3. Open the interface
Navigate to: http://localhost:3000

### 4. Load the Billboard Plugin
1. Click on the **"Plugin Marketplace"** tab
2. Find the **"Billboard Plugin"** card
3. Click **"Load"** to activate the plugin
4. The plugin status should change to "Status: ACTIVE"

### 5. Create Your First Billboard
1. Switch to the **"Billboards"** tab
2. Enter a topic (e.g., "Future of AI")
3. Click **"Generate AI Conversation"**
4. Watch as the AI creates a multi-turn conversation in real-time

## Features

### 1. Plugin Marketplace
- **Browse** available plugins
- **Dynamically load/unload** plugins without server restart
- **Monitor** plugin status (ACTIVE, CRASHED, etc.)
- **Core plugins** are always loaded (LLM, Infinite Loop Demo)

### 2. Billboard Management
- **Create** billboards with custom titles
- **Auto-generate** AI-powered conversations on any topic
- **View** messages in real-time as they're generated
- **Delete** individual billboards

### 3. SLOP Architecture Benefits
- **Supervised**: AI calls are isolated and supervised by the kernel
- **Loadable**: Plugins can be added/removed dynamically
- **Observable**: Real-time status monitoring of all components
- **Failure Isolation**: Plugin crashes don't bring down the system

## Architecture

```
┌──────────────────────────────────────────────┐
│      Browser (index.html)                    │
│  ┌─────────┬──────────────┬──────────────┐  │
│  │ Kernel  │ Marketplace  │  Billboards  │  │
│  │  Tab    │     Tab      │     Tab      │  │
│  └─────────┴──────────────┴──────────────┘  │
└──────────────────┬───────────────────────────┘
                   │ HTTP/REST
┌──────────────────▼───────────────────────────┐
│        Express Server                        │
│  - /boot, /run/:plugin, /status              │
│  - /plugin/:name (POST/DELETE) ← NEW         │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│         AIMicrokernel                        │
│  - register(name, plugin)                    │
│  - unregister(name) ← NEW                    │
│  - boot(), run(), report()                   │
└─────┬────────────────────────┬───────────────┘
      │                        │
┌─────▼─────────┐    ┌────────▼──────────┐
│ BillboardPlugin│    │   OpenAIPlugin    │
│ (Loadable)     │    │   (Core)          │
└────────────────┘    └───────────────────┘
```

## What's New: Plugin Marketplace

The plugin marketplace allows **dynamic loading and unloading** of plugins without server restart:

- **Browse** available plugins with descriptions
- **Load** plugins on-demand (e.g., Billboard plugin)
- **Unload** plugins when not needed
- **Monitor** real-time plugin status
- **Core plugins** (LLM, Infinite) are always loaded

This demonstrates the "Loadable" aspect of SLOP architecture.

## File Structure

```
/workspaces/microkernel-server/
├── server/
│   ├── index.js                    # Express server + marketplace API
│   ├── kernel.js                   # AIMicrokernel with unregister()
│   ├── package.json                # Dependencies
│   └── plugins/
│       ├── openai.plugin.js        # OpenAI integration (core)
│       └── billboard.plugin.js     # Billboard management (loadable)
└── public/
    └── index.html                  # Unified UI with tabs
```

## API Reference

### Plugin Management (NEW)

#### Load Plugin
```javascript
POST /plugin/:name
// Example: POST /plugin/billboard
// Response: { "status": "loaded", "plugin": "billboard" }
```

#### Unload Plugin
```javascript
DELETE /plugin/:name
// Example: DELETE /plugin/billboard
// Response: { "status": "unloaded", "plugin": "billboard" }
```

## API Reference

### Billboard Plugin Actions

#### Create Billboard
```javascript
POST /run/billboard
{
  "action": "create",
  "title": "My Billboard",
  "style": "default",
  "description": "Optional description"
}
```

#### Add Message
```javascript
POST /run/billboard
{
  "action": "addMessage",
  "id": 1,
  "role": "user",
  "content": "Message text"
}
```

#### List Billboards
```javascript
POST /run/billboard
{
  "action": "list"
}
```

#### Delete Billboard
```javascript
POST /run/billboard
{
  "action": "delete",
  "id": 1
}
```

## How It Works

### 1. Plugin Registration
The billboard plugin is registered with the kernel at startup:
```javascript
kernel.register("billboard", new BillboardPlugin());
```

### 2. Supervised Execution
All billboard operations run through the kernel's supervision:
```javascript
await kernel.run("billboard", { action: "create", ... });
```

### 3. Conversation Generation
The UI orchestrates LLM and billboard plugins:
- Creates a billboard
- Generates AI responses via the LLM plugin
- Adds each response as a message to the billboard
- Updates the display in real-time

### 4. Failure Isolation
If the billboard plugin crashes, the LLM plugin continues to work. The kernel tracks plugin status independently.

## Customization

### Adding New Billboard Styles
Edit `billboard.plugin.js` to add custom conversation patterns:
```javascript
case 'debate':
  // Custom debate logic
  break;
```

### Changing AI Model
Edit `openai.plugin.js` to use different models:
```javascript
model: "gpt-4",  // or "gpt-4-turbo", etc.
```

### Styling the Billboards
Edit the CSS in `billboard.html` to customize appearance:
- Colors: Change the terminal green theme
- Layout: Adjust grid columns
- Animations: Modify fade-in and pulse effects

## Troubleshooting

### Kernel Status Shows "INACTIVE"
- Ensure OpenAI API key is set
- Check server logs for plugin initialization errors

### Billboards Not Generating
- Verify OpenAI API key is valid
- Check browser console for errors
- Ensure both plugins are ACTIVE in /status

### Messages Not Appearing
- Refresh the billboard view
- Check that the billboard ID exists
- Verify the billboard plugin is active

## Next Steps

### Enhancement Ideas
1. **Persistent Storage**: Save billboards to a database
2. **Real-time Updates**: Use WebSockets for live updates
3. **Multi-Agent Conversations**: Different AI personas per billboard
4. **Export Functionality**: Save conversations as text/JSON
5. **Billboard Templates**: Pre-defined conversation patterns
6. **Scheduling**: Auto-generate conversations on a timer
7. **Analytics**: Track popular topics and engagement

## Why SLOP for Billboards?

The SLOP architecture is ideal for conversation billboards because:

1. **Unpredictable AI execution times** - The kernel enforces timeouts
2. **Independent billboard lifecycles** - Each can fail without affecting others
3. **Observable state** - Real-time monitoring of generation status
4. **Plugin isolation** - Billboard logic separate from AI logic
5. **Supervised compute** - AI treated as untrusted external resource

This architecture makes the system resilient, observable, and maintainable.

---

**Built with the SLOP Architecture**: Treating AI as supervised, isolated compute rather than embedded application logic.
