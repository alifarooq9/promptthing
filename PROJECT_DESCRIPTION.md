# Project Description

## Describe your project, key features, and what makes it unique

Prompt Thing is an open-source, multi-model AI chat platform that serves as a modern alternative to t3.chat. What makes it unique is its comprehensive approach to AI interaction, combining multiple capabilities in a single, elegant interface.

## ✨ Features

### Core Requirements
- ✅ **Chat with Various LLMs** - Support for multiple language models and providers
- ✅ **Authentication & Sync** - User authentication with chat history synchronization
- ✅ **Browser Friendly** - Web-based interface accessible from any browser
- ✅ **Easy to Try** - Simple setup and deployment process

### Bonus Features
- ✅ **Attachment Support** - Upload and process files (images and PDFs)
- ✅ **Image Generation Support** - AI-powered image generation capabilities
- ✅ **Syntax Highlighting** - Beautiful code formatting and highlighting
- ✅ **Resumable Streams** - Continue generation after page refresh
- ✅ **Chat Branching** - Create alternative conversation paths
- ✅ **Chat Sharing** - Share conversations with others
- ✅ **Web Search** - Integrate real-time web search
- ✅ **Bring Your Own Key** - Use your own API keys

**What Makes It Unique:**
1. **Open Source** - Completely open source with MIT license, allowing for community contributions, self-hosting, and full transparency
2. **Easy Model Addition** - You can add more models easily through the configuration-driven architecture without touching core logic

## What are your favorite parts of your implementation?

**1. Elegant Model Abstraction System**
The configuration-driven model system in `config/models.ts` and `lib/models.ts` is particularly well-designed. It allows for easy addition of new models and providers without touching core logic. The separation between text and image generation models, along with the flexible API key management (BYOK vs always-available), creates a scalable architecture.

**2. Real-time Streaming with Resumability**
The implementation of resumable streams using Redis is a standout feature. Users can refresh the page or even restart the server, and their AI conversations continue seamlessly. This is achieved through careful state management and stream persistence.

## Biggest challenges

**1. Resumable stream**
It took me 2 days to create it, and I don't even understand it fully. after stressing over for 2 days, I get to know resumable stream is not working because I didn't added redis url. yea definatly the biggest headache
