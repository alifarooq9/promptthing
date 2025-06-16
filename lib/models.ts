//@ts-expect-error
import { createRunware } from "@runware/ai-sdk-provider";
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
  ImageGenModelConfig,
  imageGenModelsConfig,
} from "@/config/models";

export type Models = ModelId;

const isProviderSupported = (provider: Provider): boolean => {
  const supportedProviders: Provider[] = [
    "google",
    "openrouter",
    "anthropic",
    "openai",
    "runware",
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

const createImageGenModel = (
  config: ImageGenModelConfig,
  providedApiKey?: string
) => {
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
    case "runware": {
      console.log(`Using Runware model: ${config.modelName}`);
      console.log(apiKey);
      const runware = createRunware({
        apiKey,
      });
      return runware.image(config.model, {
        maxImagesPerCall: 1,
      });
    }

    case "openai": {
      console.log(`Using OpenAI model: ${config.modelName}`);
      const openai = createOpenAI({ apiKey });
      return openai.image(config.model);
    }

    default: {
      throw new Error(
        `Unsupported provider: ${config.provider}. Make sure to install the required @ai-sdk package.`
      );
    }
  }
};

export const getImageGenModel = (model?: string, apiKey?: string) => {
  const selectedModel = model || "runware:100@1";

  const config = imageGenModelsConfig[selectedModel];

  console.log(config, "config");

  if (!config) {
    throw new Error(
      `Image generation model configuration not found for: ${selectedModel}`
    );
  }

  return {
    model: createImageGenModel(config, apiKey),
    modelName: config.modelName,
    provider: config.provider,
  };
};

export const getImageGenProviders = () => {
  const providers = getAllAvailableProviders();
  return providers.filter(
    (provider) => getImageGenModelsByProvider(provider).length > 0
  );
};

export const getAvailableImageGenModels = () => {
  return Object.keys(
    imageGenModelsConfig
  ) as (keyof typeof imageGenModelsConfig)[];
};
export const getAvailableImageGenModelsWithCategories = () => {
  const models = getAvailableImageGenModels();
  return models.map((model) => {
    const modelConfig = imageGenModelsConfig[model];
    return {
      model,
      modelName: modelConfig.modelName,
      category: "Image Generation",
      icon: modelConfig.icon,
    };
  });
};

export const getImageGenModelConfig = (model: string) => {
  return imageGenModelsConfig[model] as ImageGenModelConfig;
};

export const getImageGenModelsByProvider = (provider: Provider) => {
  return Object.entries(imageGenModelsConfig)
    .filter(([, config]) => config.provider === provider)
    .map(([, config]) => {
      return config as ImageGenModelConfig;
    });
};

export const getAvailableImageGenProviders = (): Provider[] => {
  const providers = new Set<Provider>();

  Object.values(imageGenModelsConfig).forEach((config) => {
    providers.add(config.provider);
  });

  return Array.from(providers);
};

export const getAllAvailableProviders = () => {
  const providers = new Set<Provider>();

  Object.values(modelsConfig).forEach((config) => {
    providers.add(config.provider);
  });

  Object.values(imageGenModelsConfig).forEach((config) => {
    providers.add(config.provider);
  });

  return Array.from(providers);
};

export const getAllModelsFromProvider = (provider: Provider) => {
  const models = getModelsByProvider(provider);
  const imageGenModels = getImageGenModelsByProvider(provider);

  return [...models, ...imageGenModels].map((model) => ({
    model: model.model,
    modelName: model.modelName,
    provider: model.provider,
    icon: model.icon,
  }));
};
