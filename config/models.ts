import { Icons } from "@/components/ui/icons";

export type Provider =
  | "google"
  | "openrouter"
  | "openai"
  | "anthropic"
  | "runware";

export interface ModelConfig {
  model: string;
  provider: Provider;
  modelName: string;
  canReason: boolean;
  apiKeyEnv?: string;
  supportsWebSearch: boolean;
  icon: keyof typeof Icons;
  availableWhen: "always" | "byok";
  canUseTools: boolean;
}

export interface ImageGenModelConfig {
  model: string;
  provider: Provider;
  modelName: string;
  imageToImage: boolean;
  icon: keyof typeof Icons;
  apiKeyEnv?: string;
  availableWhen: "always" | "byok";
}

// Define model configurations without using modelsIds
const modelDefinitions: Record<string, ModelConfig> = {
  "gemini-2.5-pro-preview-05-06": {
    model: "gemini-2.5-pro-preview-05-06",
    provider: "google" as const,
    modelName: "Gemini 2.5 Pro Preview",
    canReason: true,
    supportsWebSearch: true,
    icon: "google" as const,
    availableWhen: "byok" as const,
    canUseTools: true,
  },
  "gemini-2.5-flash-preview-04-17": {
    model: "gemini-2.5-flash-preview-04-17",
    provider: "google" as const,
    modelName: "Gemini 2.5 Flash Thinking",
    canReason: true,
    supportsWebSearch: true,
    icon: "google" as const,
    availableWhen: "byok" as const,
    canUseTools: true,
  },
  "gemini-2.5-flash": {
    model: "gemini-2.5-flash-preview-04-17", // Uses same underlying model
    provider: "google" as const,
    modelName: "Gemini 2.5 Flash",
    canReason: false,
    apiKeyEnv: "GOOGLE_API_KEY",
    supportsWebSearch: true,
    icon: "google" as const,
    availableWhen: "always" as const,
    canUseTools: true,
  },
  "gemini-2.0-flash-thinking": {
    model: "gemini-2.0-flash-thinking",
    provider: "google" as const,
    modelName: "Gemini 2.0 Flash Thinking",
    canReason: true,
    supportsWebSearch: true,
    icon: "google" as const,
    availableWhen: "byok" as const,
    canUseTools: true,
  },
  "gemini-2.0-flash": {
    model: "gemini-2.0-flash",
    provider: "google" as const,
    modelName: "Gemini 2.0 Flash",
    canReason: false,
    apiKeyEnv: "GOOGLE_API_KEY",
    supportsWebSearch: true,
    icon: "google" as const,
    availableWhen: "always" as const,
    canUseTools: true,
  },
  "gemini-2.0-flash-lite": {
    model: "gemini-2.0-flash-lite",
    provider: "google" as const,
    modelName: "Gemini 2.0 Flash Lite",
    canReason: false,
    apiKeyEnv: "GOOGLE_API_KEY",
    supportsWebSearch: true,
    icon: "google" as const,
    availableWhen: "always" as const,
    canUseTools: true,
  },
  "gemini-2.0-pro": {
    model: "gemini-2.0-pro",
    provider: "google" as const,
    modelName: "Gemini 2.0 Pro",
    canReason: true,
    supportsWebSearch: true,
    icon: "google" as const,
    availableWhen: "byok" as const,
    canUseTools: true,
  },
  "deepseek/deepseek-r1-0528:free": {
    model: "deepseek/deepseek-r1-0528:free",
    provider: "openrouter" as const,
    modelName: "DeepSeek R1",
    canReason: true,
    supportsWebSearch: false,
    icon: "deepseek" as const,
    availableWhen: "byok" as const,
    canUseTools: false,
  },
  "gpt-4.1-nano": {
    model: "gpt-4.1-nano",
    provider: "openai" as const,
    modelName: "GPT-4.1 Nano",
    canReason: false,
    supportsWebSearch: true,
    icon: "openai" as const,
    availableWhen: "byok" as const,
    canUseTools: true,
  },
  "gpt-4.1": {
    model: "gpt-4.1",
    provider: "openai" as const,
    modelName: "GPT-4.1",
    canReason: false,
    supportsWebSearch: true,
    icon: "openai" as const,
    availableWhen: "byok" as const,
    canUseTools: true,
  },
  o3: {
    model: "o3",
    provider: "openai" as const,
    modelName: "o3",
    canReason: true,
    supportsWebSearch: false,
    icon: "openai" as const,
    availableWhen: "byok" as const,
    canUseTools: true,
  },
  "o3-mini": {
    model: "o3-mini",
    provider: "openai" as const,
    modelName: "o3 Mini",
    canReason: true,
    supportsWebSearch: false,
    icon: "openai" as const,
    availableWhen: "byok" as const,
    canUseTools: true,
  },
  "claude-4-sonnet": {
    model: "claude-4-sonnet-20250514",
    provider: "anthropic" as const,
    modelName: "Claude 4 Sonnet",
    canReason: false,
    supportsWebSearch: true,
    icon: "claude" as const,
    availableWhen: "byok" as const,
    canUseTools: true,
  },
  "claude-4-sonnet-thinking": {
    model: "claude-4-sonnet-20250514",
    provider: "anthropic" as const,
    modelName: "Claude 4 Sonnet Thinking",
    canReason: true,
    supportsWebSearch: true,
    icon: "claude" as const,
    availableWhen: "byok" as const,
    canUseTools: true,
  },
  "claude-4-opus": {
    model: "claude-4-opus-20250514",
    provider: "anthropic" as const,
    modelName: "Claude 4 Opus",
    canReason: true,
    supportsWebSearch: true,
    icon: "claude" as const,
    availableWhen: "byok" as const,
    canUseTools: true,
  },
  "claude-3-7-sonnet-thinking": {
    model: "claude-3-7-sonnet-20250219",
    provider: "anthropic" as const,
    modelName: "Claude 3.7 Sonnet Thinking",
    canReason: true,
    supportsWebSearch: true,
    icon: "claude" as const,
    availableWhen: "byok" as const,
    canUseTools: true,
  },
  "claude-3-7-sonnet": {
    model: "claude-3-7-sonnet-20250219",
    provider: "anthropic" as const,
    modelName: "Claude 3.7 Sonnet",
    canReason: false,
    supportsWebSearch: true,
    icon: "claude" as const,
    availableWhen: "byok" as const,
    canUseTools: true,
  },
  "claude-3-5-sonnet": {
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic" as const,
    modelName: "Claude 3.5 Sonnet",
    canReason: false,
    supportsWebSearch: true,
    icon: "claude" as const,
    availableWhen: "byok" as const,
    canUseTools: true,
  },
} as const;

// Define image generation model configurations
const imageGenModelDefinitions: Record<string, ImageGenModelConfig> = {
  "dall-e-3": {
    model: "dall-e-3",
    provider: "openai",
    modelName: "DALL-E 3",
    imageToImage: true,
    icon: "openai",
    availableWhen: "byok",
  },

  "gpt-image-1": {
    model: "gpt-image-1",
    provider: "openai",
    modelName: "GPT Image Gen",
    imageToImage: true,
    icon: "openai",
    availableWhen: "byok",
  },

  "runware:101@1": {
    model: "runware:101@1",
    provider: "runware",
    modelName: "Runware 101@1",
    imageToImage: true,
    icon: "runware",
    availableWhen: "byok",
  },

  "runware:100@1": {
    model: "runware:100@1",
    provider: "runware",
    modelName: "Runware 100@1",
    imageToImage: true,
    icon: "runware",
    availableWhen: "byok",
  },
} as const;

export type ModelId = keyof typeof modelDefinitions;
export const modelsConfig = modelDefinitions;
export const modelsIds = Object.fromEntries(
  Object.keys(modelDefinitions).map((key) => [key, key])
) as { [K in ModelId]: K };

export type ImageGenModelId = keyof typeof imageGenModelDefinitions;
export const imageGenModelsConfig = imageGenModelDefinitions;
export const imageGenModelsIds = Object.fromEntries(
  Object.keys(imageGenModelDefinitions).map((key) => [key, key])
) as { [K in ImageGenModelId]: K };
