/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "@aerisweather/mapsgl/dist/mapsgl.css";
import { useMapStore } from "./provider/mapStore"; // Zustand store for global map management
import TrafficIncidentLayer from "./_components/feature/LeftNav/_component/TrafficIncidentLayer";
import { layerStore } from "@/app/provider/layerStore";

const MapComponent = () => {
  const mapRefContainer = useRef<any>(null);
  // const controllerRef = useRef<any>(null);
  const { mapRef, setMap } = useMapStore(); // Zustand setters
  const { activeLayer } = layerStore();

  useEffect(() => {
    const mapboxgl = require("mapbox-gl");
    // const mapsgl = require("@aerisweather/mapsgl");

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

    const map = new mapboxgl.Map({
      container: mapRefContainer.current,
      style: "mapbox://styles/mapbox/standard",
      zoom: 16.8,
      center: [24.951528, 60.169573],
      pitch: 74,
      bearing: 12.8,
      hash: true
      // projection: "mercator"
    });
    setMap(map);

    // const account = new mapsgl.Account(
    //   "dj3hazg1e9Evj9EcFg9fz",
    //   "6ngFwXzTQx7scqQbSeXGUlvWVS8IcAL4KzeHOsBc"
    // );

    // const controller = new mapsgl.MapboxMapController(map, {
    //   account
    // });
    // controllerRef.current = controller;

    // controller.on("load", () => {
    //   setController(controller);
    // });
  }, [setMap]);

  useEffect(() => {
    if (!mapRef) return;

    const handleLoad = () => {
      // mapRef.setConfigProperty?.("basemap", "lightPreset", "dawn");
      mapRef.setConfigProperty('basemap', 'lightPreset', 'dusk');


      const zoomBasedReveal = (value: any) => {
        return ["interpolate", ["linear"], ["zoom"], 11, 0.0, 13, value];
      };

      mapRef.setRain?.({
        density: zoomBasedReveal(0.5),
        intensity: 1.0,
        color: "#a8adbc",
        opacity: 0.7,
        vignette: zoomBasedReveal(1.0),
        "vignette-color": "#464646",
        direction: [0, 80],
        "droplet-size": [2.6, 18.2],
        "distortion-strength": 0.7,
        "center-thinning": 0
      });
    };

    mapRef.on("style.load", handleLoad);

    return () => {
      mapRef.off("style.load", handleLoad);
    };
  }, [mapRef]);

  return (
    <div>
      <div
        ref={mapRefContainer}
        style={{ height: "100vh", width: "100%" }}
      ></div>
      {activeLayer === "event" && <TrafficIncidentLayer />}
    </div>
  );
};

export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });
