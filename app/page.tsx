"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "@aerisweather/mapsgl/dist/mapsgl.css";
import { useMapStore } from "./store/mapStore"; // Zustand store for global map management

const MapComponent = () => {
  const mapRef = useRef(null);
  const controllerRef = useRef<any>(null);
  const { setMap, setController } = useMapStore(); // Zustand setters

  useEffect(() => {
    const mapboxgl = require("mapbox-gl");
    const mapsgl = require("@aerisweather/mapsgl");

    mapboxgl.accessToken =
      "pk.eyJ1IjoiZmVybmNha2UiLCJhIjoiY2txajcyaWwwMDh2bjMwbngwM2hnaGdjZSJ9.w6HwEX8hDJzyYKOC7X7WHg";

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/light-v9",
      center: [10.33207, 47.60621],
      zoom: 3,
      projection: "mercator"
    });

    const account = new mapsgl.Account(
      "dj3hazg1e9Evj9EcFg9fz",
      "6ngFwXzTQx7scqQbSeXGUlvWVS8IcAL4KzeHOsBc"
    );

    const controller = new mapsgl.MapboxMapController(map, {
      account
    });
    controllerRef.current = controller;

    controller.on("load", () => {
      setMap(map);
      setController(controller);
    });
  }, [setMap, setController]);

  return (
    <div>
      <div ref={mapRef} style={{ height: "100vh", width: "100%" }}></div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });
