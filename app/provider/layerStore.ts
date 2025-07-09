// layer-store.ts
import { create } from "zustand";

type LayerType =
  | "event"
  | "hospital"
  | "traffic"
  | "temperature"
  | "precipitation";

interface LayerStore {
  stormLayerVisible: boolean;
  setStormLayerVisible: (visible: boolean) => void;

  activeLayer: LayerType | null;
  setActiveLayer: (layer: LayerType) => void;
}

export const layerStore = create<LayerStore>((set) => ({
  stormLayerVisible: false,
  setStormLayerVisible: (visible: boolean) => set({ stormLayerVisible: visible }),

  activeLayer: "event",
  setActiveLayer: (layer) => set({ activeLayer: layer }),
}));
