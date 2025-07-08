/* eslint-disable @typescript-eslint/no-explicit-any */
// store/mapStore.ts
import { create } from "zustand";
import { Map } from "mapbox-gl";

interface MapStore {
  mapRef:  any;
  controllerRef: any | null;
//   setMap: (map: any) => void;
  setMap: (mapRef: Map) => void;
  setController: (controller: any) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  mapRef: null,
  controllerRef: null,
//   setMap: (map) => set({ mapRef: map }),
  setMap: (map: Map) => set({ mapRef: map }),

  setController: (controller) => set({ controllerRef: controller }),
}));
