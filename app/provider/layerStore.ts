// layer-store.ts
import { create } from "zustand";

export type LayerType =
  | "event"
  | "hospital"
  // | "traffic"
  | "wind"
  | "wind_animation"
  | "temperature"
  | "precipitation";

export interface LayerStore {
  stormLayerVisible: boolean;
  setStormLayerVisible: (visible: boolean) => void;

  eventToggle: boolean;
  setEventToggle: (toggle: boolean) => void;

  hospitalToggle: boolean;
  setHospitalToggle: (toggle: boolean) => void;

  windToggle: boolean;
  setWindToggle: (toggle: boolean) => void;

    windAniToggle: boolean;
  setWindAniToggle: (toggle: boolean) => void;

  temperatureToggle: boolean;
  setTemperatureToggle: (toggle: boolean) => void;

  precipitationToggle: boolean;
  setPrecipitationToggle: (toggle: boolean) => void;

  trafficToggle: boolean;
  setTrafficToggle: (toggle: boolean) => void;

  controllerRef: any | null;
  setControllerRef: (controller: any | null) => void;

  mapsgl: any | null;
  setMapsgl: (mapsgl: any | null) => void;

  trafficIncidentData: any | null;
  setTrafficIncidentData: (data: any | null) => void;

  routeReports: {
    id: number;
    isClear: boolean;
  }[];
  setRouteReports: (reports: { id: number; isClear: boolean }[]) => void;
}

export const layerStore = create<LayerStore>((set) => ({
  stormLayerVisible: false,
  setStormLayerVisible: (visible: boolean) =>
    set({ stormLayerVisible: visible }),

  eventToggle: true,
  setEventToggle: (toggle: boolean) => set({ eventToggle: toggle }),

  hospitalToggle: false,
  setHospitalToggle: (toggle: boolean) => set({ hospitalToggle: toggle }),

  windToggle: false,
  setWindToggle: (toggle: boolean) => set({ windToggle: toggle }),

  windAniToggle: false,
  setWindAniToggle: (toggle: boolean) => set({ windAniToggle: toggle }),

  temperatureToggle: false,
  setTemperatureToggle: (toggle: boolean) => set({ temperatureToggle: toggle }),

  precipitationToggle: false,
  setPrecipitationToggle: (toggle: boolean) =>
    set({ precipitationToggle: toggle }),

  trafficToggle: false,
  setTrafficToggle: (toggle: boolean) => set({ trafficToggle: toggle }),

  controllerRef: null,
  setControllerRef: (controller) => set({ controllerRef: controller }),

  mapsgl: null,
  setMapsgl: (mapsgl) => set({ mapsgl }),

  trafficIncidentData: null,
  setTrafficIncidentData: (data) => set({ trafficIncidentData: data }),

  routeReports: [],
  setRouteReports: (reports) => set({ routeReports: reports }),
}));
