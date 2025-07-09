// layer-store.ts
import { create } from "zustand";

export type LayerType =
    | "event"
    | "hospital"
    | "traffic"
    | "temperature"
    | "precipitation";

export interface LayerStore {
    stormLayerVisible: boolean;
    setStormLayerVisible: (visible: boolean) => void;

    activeLayer: LayerType | null;
    setActiveLayer: (layer: LayerType) => void;

    controllerRef: any | null
    setControllerRef: (controller: any | null) => void

    mapsgl: any | null
    setMapsgl: (mapsgl: any | null) => void

}

export const layerStore = create<LayerStore>((set) => ({
    stormLayerVisible: false,
    setStormLayerVisible: (visible: boolean) => set({ stormLayerVisible: visible }),

    activeLayer: "event",
    setActiveLayer: (layer) => set({ activeLayer: layer }),

    controllerRef: null,
    setControllerRef: (controller) => set({ controllerRef: controller }),

    mapsgl: null,
    setMapsgl: (mapsgl) => set({ mapsgl }),

}));
