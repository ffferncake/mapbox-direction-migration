/* eslint-disable @typescript-eslint/no-explicit-any */
// store/mapStore.ts
import { create } from "zustand";
import { Map } from "mapbox-gl";

interface MapStore {
  mapRef: any;
  controllerRef: any | null;
  setMap: (mapRef: Map) => void;
  setController: (controller: any) => void;
  cursorLatLng: { lat: number; lng: number } | null;
  zoom: number | null;
  setCursorLatLng: (coords: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  mapRef: null,
  controllerRef: null,
  setMap: (map: Map) => set({ mapRef: map }),
  setController: (controller) => set({ controllerRef: controller }),
  cursorLatLng: null,
  zoom: null,
  setCursorLatLng: (coords) => set({ cursorLatLng: coords }),
  setZoom: (zoom) => set({ zoom }),
}));
