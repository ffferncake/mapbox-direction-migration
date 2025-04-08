// store/mapStore.ts
import { create } from "zustand";
import { Map } from "mapbox-gl";

interface MapStore {
  mapRef: Map | null;
  controllerRef: unknown;
  //   setMap: (map: any) => void;
  setMap: (map: Map) => void;

  setController: (controller: unknown) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  mapRef: null,
  controllerRef: null,
  //   setMap: (map) => set({ mapRef: map }),
  setMap: (map: Map) => set({ mapRef: map }),

  setController: (controller: unknown) => set({ controllerRef: controller }),
}));
