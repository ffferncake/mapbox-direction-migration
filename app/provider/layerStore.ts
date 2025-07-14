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

    eventToggle: boolean,
    setEventToggle: (toggle: boolean) => void;

    hospitalToggle: boolean,
    setHospitalToggle: (toggle: boolean) => void;

    temperatureToggle: boolean,
    setTemperatureToggle: (toggle: boolean) => void;

    precipitationToggle: boolean,
    setPrecipitationToggle: (toggle: boolean) => void;

    trafficToggle: boolean,
    setTrafficToggle: (toggle: boolean) => void;

    controllerRef: any | null
    setControllerRef: (controller: any | null) => void

    mapsgl: any | null
    setMapsgl: (mapsgl: any | null) => void

}

export const layerStore = create<LayerStore>((set) => ({
    stormLayerVisible: false,
    setStormLayerVisible: (visible: boolean) => set({ stormLayerVisible: visible }),

    eventToggle: false,
    setEventToggle: (toggle: boolean) => set({ eventToggle: toggle }),

    hospitalToggle: false,
    setHospitalToggle: (toggle: boolean) => set({ hospitalToggle: toggle }),

    temperatureToggle: false,
    setTemperatureToggle: (toggle: boolean) => set({ temperatureToggle: toggle }),

    precipitationToggle: false,
    setPrecipitationToggle: (toggle: boolean) => set({ precipitationToggle: toggle }),

    trafficToggle: false,
    setTrafficToggle:  (toggle: boolean) => set({ trafficToggle: toggle }),

    controllerRef: null,
    setControllerRef: (controller) => set({ controllerRef: controller }),

    mapsgl: null,
    setMapsgl: (mapsgl) => set({ mapsgl }),

}));
