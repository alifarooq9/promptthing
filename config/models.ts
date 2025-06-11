import { Icons } from "@/components/ui/icons";

export const modelsIds = {
  "gemini-2.0-flash-thinking": "gemini-2.0-flash-thinking",
  "gemini-2.0-flash": "gemini-2.0-flash",
  "deepseek-r1": "deepseek-r1",
} as const;

export type ModelId = keyof typeof modelsIds;

export type Provider = "google" | "openrouter" | "openai" | "anthropic";

export interface ModelConfig {
  model: string;
  provider: Provider;
  modelName: string;
  canReason: boolean;
  apiKeyEnv: string;
  supportsWebSearch: boolean;
  icon: keyof typeof Icons;
}

type ModelsConfig = {
  [key in ModelId]: ModelConfig;
};

export const modelsConfig: ModelsConfig = {
  [modelsIds["gemini-2.0-flash-thinking"]]: {
    model: modelsIds["gemini-2.0-flash-thinking"],
    provider: "google" as const,
    modelName: "gemini-2.0-flash-thinking-exp-01-21",
    canReason: true,
    apiKeyEnv: "GOOGLE_API_KEY",
    supportsWebSearch: true,
    icon: "google",
  },
  [modelsIds["gemini-2.0-flash"]]: {
    model: modelsIds["gemini-2.0-flash"],
    provider: "google" as const,
    modelName: "gemini-2.0-flash",
    canReason: false,
    apiKeyEnv: "GOOGLE_API_KEY",
    supportsWebSearch: true,
    icon: "google",
  },
  [modelsIds["deepseek-r1"]]: {
    model: modelsIds["deepseek-r1"],
    provider: "openrouter" as const,
    modelName: "deepseek/deepseek-r1-0528-qwen3-8b:free",
    canReason: true,
    apiKeyEnv: "OPENROUTER_API_KEY",
    supportsWebSearch: false,
    icon: "deepseek",
  },
} as const;
