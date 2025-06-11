import { Provider } from "@/config/models";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ConfigStore = {
  keys: Record<string, string>;
  appendKey: (key: Provider, value: string) => void;
  getKey: (key: Provider) => string | undefined;
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
    }),
    {
      name: "config-storage",
    }
  )
);
