import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  modelsIds,
  modelsConfig,
  type ModelId,
  type ModelConfig,
  type Provider,
} from "@/config/models";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export type Models = ModelId;

const isProviderSupported = (provider: Provider): boolean => {
  const supportedProviders: Provider[] = ["google", "openrouter"];
  return supportedProviders.includes(provider);
};

const createModel = (config: ModelConfig) => {
  const apiKey = process.env[config.apiKeyEnv];
  if (!apiKey || apiKey === "") {
    throw new Error(`${config.apiKeyEnv} is not set`);
  }

  if (!isProviderSupported(config.provider)) {
    throw new Error(
      `Provider '${config.provider}' is not currently supported. ` +
        `Install the required package: bun add @ai-sdk/${config.provider}`
    );
  }

  switch (config.provider) {
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(config.modelName);
    }
    case "openrouter": {
      console.log(`Using OpenRouter model: ${config.modelName}`);
      const openrouter = createOpenRouter({ apiKey });
      return openrouter.chat(config.modelName);
    }

    default:
      throw new Error(
        `Unsupported provider: ${config.provider}. Make sure to install the required @ai-sdk package.`
      );
  }
};

export const getModel = (model?: Models) => {
  const selectedModel = model || modelsIds["gemini-2.5-flash"];

  const config = modelsConfig[selectedModel];

  if (!config) {
    throw new Error(`Model configuration not found for: ${selectedModel}`);
  }

  return {
    model: createModel(config),
    canReason: config.canReason,
    supportsWebSearch: config.supportsWebSearch,
  };
};

export const getAvailableModels = () => {
  return Object.keys(modelsConfig) as Models[];
};

export const getModelConfig = (model: Models) => {
  return modelsConfig[model];
};

export const getModelsByProvider = (provider: Provider) => {
  return Object.entries(modelsConfig)
    .filter(([, config]) => config.provider === provider)
    .map(([modelId]) => modelId as Models);
};
