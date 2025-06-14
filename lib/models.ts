import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import {
  modelsIds,
  modelsConfig,
  type ModelId,
  type ModelConfig,
  type Provider,
} from "@/config/models";

export type Models = ModelId;

const isProviderSupported = (provider: Provider): boolean => {
  const supportedProviders: Provider[] = [
    "google",
    "openrouter",
    "anthropic",
    "openai",
  ];
  return supportedProviders.includes(provider);
};

const createModel = (config: ModelConfig, providedApiKey?: string) => {
  // Determine which API key to use based on availableWhen and providedApiKey
  let apiKey: string;

  if (providedApiKey) {
    // If a key is provided in the request, always use it
    apiKey = providedApiKey;
  } else if (config.availableWhen === "always" && config.apiKeyEnv) {
    // For "always" models, use environment variable
    apiKey = process.env[config.apiKeyEnv] || "";
  } else {
    // For "byok" models without provided key, this should fail
    apiKey = "";
  }

  if (!apiKey || apiKey === "") {
    if (config.availableWhen === "byok" && !providedApiKey) {
      throw new Error(
        `API key required for ${config.modelName}. This model requires bring-your-own-key.`
      );
    }
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
      console.log(`Using Google model: ${config.modelName}`);
      return google(config.model);
    }
    case "openrouter": {
      console.log(`Using OpenRouter model: ${config.modelName}`);
      const openrouter = createOpenRouter({ apiKey });
      return openrouter.chat(config.model);
    }
    case "openai": {
      console.log(`Using OpenAI model: ${config.modelName}`);
      const openai = createOpenAI({ apiKey, compatibility: "strict" });
      return openai(config.model);
    }
    case "anthropic": {
      console.log(`Using Anthropic model: ${config.modelName}`);
      const anthropic = createAnthropic({ apiKey });
      return anthropic(config.model);
    }
    default:
      throw new Error(
        `Unsupported provider: ${config.provider}. Make sure to install the required @ai-sdk package.`
      );
  }
};

export const getModel = (model?: Models, apiKey?: string) => {
  const selectedModel = model || modelsIds["gemini-2.0-flash"];

  const config = modelsConfig[selectedModel];

  if (!config) {
    throw new Error(`Model configuration not found for: ${selectedModel}`);
  }

  return {
    model: createModel(config, apiKey),
    canReason: config.canReason,
    supportsWebSearch: config.supportsWebSearch,
  };
};

export const getAvailableModels = () => {
  return Object.keys(modelsConfig) as Models[];
};

export const getAvailableModelsWithCategories = () => {
  const models = getAvailableModels();
  return models.map((model) => {
    const modelConfig = modelsConfig[model];
    if (modelConfig.canReason) {
      return {
        model,
        modelName: modelConfig.modelName,
        category: "Reasoning",
        icon: modelConfig.icon,
      };
    }

    return {
      model,
      modelName: modelConfig.modelName,
      category: "General",
      icon: modelConfig.icon,
    };
  });
};

export const getAvailableProviders = (): Provider[] => {
  const providers = new Set<Provider>();

  Object.values(modelsConfig).forEach((config) => {
    providers.add(config.provider);
  });

  return Array.from(providers);
};

export const getModelConfig = (model: Models) => {
  return modelsConfig[model];
};

export const getModelsByProvider = (provider: Provider) => {
  return Object.entries(modelsConfig)
    .filter(([, config]) => config.provider === provider)
    .map(([, config]) => {
      return config as ModelConfig;
    });
};
