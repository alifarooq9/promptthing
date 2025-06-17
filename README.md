# Prompt Thing

> An open-source, multi-model AI chat platform with image generation and web search capabilities

Prompt Thing is a modern alternative to t3.chat that provides seamless access to multiple AI models, image generation, and advanced reasoning capabilities in a beautiful, intuitive interface.

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

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- A Convex account for database and real-time features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alifarooq9/promptthing
   cd promptthing
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   
   ```env
   # Convex (Required)
   NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
   CONVEX_DEPLOY_KEY=your_convex_deploy_key_here
   
   # Redis (Optional - enables resumable streams)
   REDIS_URL=redis://localhost:6379
   
   # AI Providers (Add keys for models marked as "always" available)
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_key_here
   
   # Image Generation
   RUNWARE_API_KEY=your_runware_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Start the Convex dev server**
   ```bash
   npm convex dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to start chatting!

## 🤖 Supported Models

### Text/Chat Models

| Provider | Models | Reasoning | BYOK Required |
|----------|--------|-----------|---------------|
| **Google Gemini** | Gemini 2.5 Pro Preview, 2.5 Flash Thinking, 2.5 Flash, 2.0 Flash Thinking, 2.0 Flash, 2.0 Flash Lite, 2.0 Pro | ✅ (Some) | Mixed |
| **OpenAI** | GPT-4.1 Nano, GPT-4.1, o3, o3 Mini | ✅ (o3 series) | ✅ |
| **Anthropic** | Claude 4 Sonnet, Claude 4 Thinking, Claude 4 Opus, Claude 3.7 Sonnet Thinking, Claude 3.7 Sonnet, Claude 3.5 Sonnet | ✅ (Thinking/Opus) | ✅ |
| **OpenRouter** | DeepSeek R1 | ✅ | ✅ |

### Image Generation Models

| Provider | Models | Features |
|----------|--------|----------|
| **OpenAI** | DALL-E 3, GPT Image Gen | High-quality, versatile |
| **Runware** | Runware 101@1, 100@1 | Fast generation, cost-effective |

> 🔑 **BYOK (Bring Your Own Key)** - Some models require you to provide your own API keys
> 
> 🧠 **Reasoning Models** - Advanced models with enhanced problem-solving capabilities

## 🛠️ Development

### Adding New Models

#### Text/Chat Models

1. **Add model configuration** in `config/models.ts`:
   ```typescript
   const modelDefinitions: Record<string, ModelConfig> = {
     "your-model-id": {
       model: "actual-model-name",
       provider: "provider-name",
       modelName: "Display Name",
       canReason: true, // or false
       supportsWebSearch: true, // or false
       icon: "icon-name",
       availableWhen: "always" | "byok",
       canUseTools: true, // or false
       apiKeyEnv: "ENV_VAR_NAME", // only if availableWhen is "always"
     },
     // ...existing models
   };
   ```

2. **For new providers**, also update:
   - Add provider to `Provider` type in `config/models.ts`
   - Install SDK: `npm install @ai-sdk/provider-name`
   - Add case in `createModel()` function in `lib/models.ts`
   - Update `isProviderSupported()` array in `lib/models.ts`

#### Image Generation Models

1. **Add model configuration** in `config/models.ts`:
   ```typescript
   const imageGenModelDefinitions: Record<string, ImageGenModelConfig> = {
     "model-id": {
       model: "actual-model-name",
       provider: "provider-name",
       modelName: "Display Name",
       imageToImage: true, // or false
       icon: "icon-name",
       availableWhen: "always" | "byok",
     },
     // ...existing models
   };
   ```

2. **Add provider support** in `createImageGenModel()` function in `lib/models.ts`

### Architecture

- **Frontend**: Next.js 14 with App Router, Tailwind CSS, Radix UI
- **Backend**: Convex for database, real-time subscriptions, and serverless functions
- **AI Integration**: AI SDK for unified model access
- **Styling**: Tailwind CSS and ShadCN UI
- **State Management**: Zustand for client-side state

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## ⭐ Support

If you find this project helpful, please consider giving it a star on GitHub!
