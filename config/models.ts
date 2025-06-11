import { Icons } from "@/components/ui/icons";

export const modelsIds = {
  "gemini-2.5-flash-preview-04-17": "gemini-2.5-flash-preview-04-17",
  "gemini-2.5-pro-preview-05-06": "gemini-2.5-pro-preview-05-06",
  "gemini-2.0-flash-thinking": "gemini-2.0-flash-thinking",
  "gemini-2.0-flash-lite": "gemini-2.0-flash-lite",
  "gemini-2.0-flash": "gemini-2.0-flash",
  "gemini-2.0-pro": "gemini-2.0-pro",
  "deepseek-r1": "deepseek-r1",
} as const;

export type ModelId = keyof typeof modelsIds;

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

type ModelsConfig = {
  [key in ModelId]: ModelConfig;
};

export const modelsConfig: ModelsConfig = {
  [modelsIds["gemini-2.5-pro-preview-05-06"]]: {
    model: modelsIds["gemini-2.5-pro-preview-05-06"],
    provider: "google" as const,
    modelName: "gemini-2.5-pro-preview-05-06",
    canReason: true,
    supportsWebSearch: true,
    icon: "google",
    availableWhen: "byok",
  },
  [modelsIds["gemini-2.5-flash-preview-04-17"]]: {
    model: modelsIds["gemini-2.5-flash-preview-04-17"],
    provider: "google" as const,
    modelName: "gemini-2.5-flash-preview-04-17",
    canReason: true,
    supportsWebSearch: true,
    icon: "google",
    availableWhen: "byok",
  },
  [modelsIds["gemini-2.0-flash-thinking"]]: {
    model: modelsIds["gemini-2.0-flash-thinking"],
    provider: "google" as const,
    modelName: "gemini-2.0-flash-thinking-exp-01-21",
    canReason: true,
    supportsWebSearch: true,
    icon: "google",
    availableWhen: "byok",
  },
  [modelsIds["gemini-2.0-flash"]]: {
    model: modelsIds["gemini-2.0-flash"],
    provider: "google" as const,
    modelName: "gemini-2.0-flash",
    canReason: false,
    apiKeyEnv: "GOOGLE_API_KEY",
    supportsWebSearch: true,
    icon: "google",
    availableWhen: "always",
  },
  [modelsIds["gemini-2.0-flash-lite"]]: {
    model: modelsIds["gemini-2.0-flash-lite"],
    provider: "google" as const,
    modelName: "gemini-2.0-flash-lite",
    canReason: false,
    apiKeyEnv: "GOOGLE_API_KEY",
    supportsWebSearch: true,
    icon: "google",
    availableWhen: "always",
  },
  [modelsIds["gemini-2.0-pro"]]: {
    model: modelsIds["gemini-2.0-pro"],
    provider: "google" as const,
    modelName: "gemini-2.0-pro",
    canReason: true,
    supportsWebSearch: true,
    icon: "google",
    availableWhen: "byok",
  },
  [modelsIds["deepseek-r1"]]: {
    model: modelsIds["deepseek-r1"],
    provider: "openrouter" as const,
    modelName: "deepseek/deepseek-r1-0528-qwen3-8b:free",
    canReason: true,
    supportsWebSearch: false,
    icon: "deepseek",
    availableWhen: "byok",
  },
} as const;
