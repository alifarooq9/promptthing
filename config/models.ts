import { Icons } from "@/components/ui/icons";

export type Provider = "google" | "openrouter" | "openai" | "anthropic";

export interface ModelConfig {
  model: string;
  provider: Provider;
  modelName: string;
  canReason: boolean;
  apiKeyEnv?: string;
  supportsWebSearch: boolean;
  icon: keyof typeof Icons;
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
  },
  "gemini-2.5-flash-preview-04-17": {
    model: "gemini-2.5-flash-preview-04-17",
    provider: "google" as const,
    modelName: "Gemini 2.5 Flash Thinking",
    canReason: true,
    supportsWebSearch: true,
    icon: "google" as const,
    availableWhen: "byok" as const,
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
  },
  "gemini-2.0-flash-thinking": {
    model: "gemini-2.0-flash-thinking",
    provider: "google" as const,
    modelName: "Gemini 2.0 Flash Thinking",
    canReason: true,
    supportsWebSearch: true,
    icon: "google" as const,
    availableWhen: "byok" as const,
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
  },
  "gemini-2.0-pro": {
    model: "gemini-2.0-pro",
    provider: "google" as const,
    modelName: "Gemini 2.0 Pro",
    canReason: true,
    supportsWebSearch: true,
    icon: "google" as const,
    availableWhen: "byok" as const,
  },
  "deepseek/deepseek-r1-0528-qwen3-8b:free": {
    model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
    provider: "openrouter" as const,
    modelName: "DeepSeek R1",
    canReason: true,
    supportsWebSearch: false,
    icon: "deepseek" as const,
    availableWhen: "byok" as const,
  },
  "gpt-4.1-nano": {
    model: "gpt-4.1-nano",
    provider: "openai" as const,
    modelName: "GPT-4.1 Nano",
    canReason: false,
    supportsWebSearch: true,
    icon: "openai" as const,
    availableWhen: "byok" as const,
  },
  "gpt-4.1": {
    model: "gpt-4.1",
    provider: "openai" as const,
    modelName: "GPT-4.1",
    canReason: false,
    supportsWebSearch: true,
    icon: "openai" as const,
    availableWhen: "byok" as const,
  },
  o3: {
    model: "o3",
    provider: "openai" as const,
    modelName: "o3",
    canReason: true,
    supportsWebSearch: false,
    icon: "openai" as const,
    availableWhen: "byok" as const,
  },
  "o3-mini": {
    model: "o3-mini",
    provider: "openai" as const,
    modelName: "o3 Mini",
    canReason: true,
    supportsWebSearch: false,
    icon: "openai" as const,
    availableWhen: "byok" as const,
  },
  "claude-4-sonnet": {
    model: "claude-4-sonnet-20250514",
    provider: "anthropic" as const,
    modelName: "Claude 4 Sonnet",
    canReason: false,
    supportsWebSearch: true,
    icon: "claude" as const,
    availableWhen: "byok" as const,
  },
  "claude-4-sonnet-thinking": {
    model: "claude-4-sonnet-20250514",
    provider: "anthropic" as const,
    modelName: "Claude 4 Sonnet Thinking",
    canReason: true,
    supportsWebSearch: true,
    icon: "claude" as const,
    availableWhen: "byok" as const,
  },
  "claude-4-opus": {
    model: "claude-4-opus-20250514",
    provider: "anthropic" as const,
    modelName: "Claude 4 Opus",
    canReason: true,
    supportsWebSearch: true,
    icon: "claude" as const,
    availableWhen: "byok" as const,
  },
  "claude-3-7-sonnet-thinking": {
    model: "claude-3-7-sonnet-20250219",
    provider: "anthropic" as const,
    modelName: "Claude 3.7 Sonnet Thinking",
    canReason: true,
    supportsWebSearch: true,
    icon: "claude" as const,
    availableWhen: "byok" as const,
  },
  "claude-3-7-sonnet": {
    model: "claude-3-7-sonnet-20250219",
    provider: "anthropic" as const,
    modelName: "Claude 3.7 Sonnet",
    canReason: false,
    supportsWebSearch: true,
    icon: "claude" as const,
    availableWhen: "byok" as const,
  },
  "claude-3-5-sonnet": {
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic" as const,
    modelName: "Claude 3.5 Sonnet",
    canReason: false,
    supportsWebSearch: true,
    icon: "claude" as const,
    availableWhen: "byok" as const,
  },
} as const;

export type ModelId = keyof typeof modelDefinitions;
export const modelsConfig = modelDefinitions;
export const modelsIds = Object.fromEntries(
  Object.keys(modelDefinitions).map((key) => [key, key])
) as { [K in ModelId]: K };
