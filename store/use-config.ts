import { ImageGenModelId, ModelId, Provider } from "@/config/models";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ConfigStore = {
  keys: Record<string, string>;
  appendKey: (key: Provider, value: string) => void;
  getKey: (key: Provider) => string | undefined;
  selectedModel: ModelId;
  setSelectedModel: (model: ModelId | ImageGenModelId) => void;
  selectedImageGenModel: ImageGenModelId;
  setSelectedImageGenModel: (model: ImageGenModelId) => void;
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      keys: {},
      appendKey: (key: Provider, value: string) =>
        set((state) => ({
          keys: { ...state.keys, [key]: value },
        })),
      getKey: (key: Provider) => get().keys[key],
      selectedModel: "gemini-2.0-flash-lite", // Default model
      setSelectedModel: (model: ModelId | ImageGenModelId) =>
        set({ selectedModel: model }),
      selectedImageGenModel: "runware:100@1", // Default image generation model
      setSelectedImageGenModel: (model: ImageGenModelId) =>
        set({ selectedImageGenModel: model }),
    }),
    {
      name: "config-storage",
    }
  )
);
