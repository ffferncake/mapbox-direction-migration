/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "@aerisweather/mapsgl/dist/mapsgl.css";
import { useMapStore } from "./provider/mapStore"; // Zustand store for global map management
import IncidentLayer from "./_components/feature/LeftNav/_component/IncidentLayer";
import { layerStore } from "@/app/provider/layerStore";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css"; // Import Mapbox Directions CSS
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import { RulerControl, CompassControl, ZoomControl } from "mapbox-gl-controls";
import { bboxPolygon, buffer, booleanDisjoint } from "@turf/turf";

var polyline = require("@mapbox/polyline");

const MapComponent = () => {
  const mapRefContainer = useRef<any>(null);
  // const controllerRef = useRef<any>(null);
  const { mapRef, setMap, setCursorLatLng, setZoom } = useMapStore();
  const { trafficIncidentData } = layerStore();

  // useEffect(() => {
  //   const mapboxgl = require("mapbox-gl");
  //   const MapboxDirections = require('@mapbox/mapbox-gl-directions');
  //   // const mapsgl = require("@aerisweather/mapsgl");

  //   mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  //   const map = new mapboxgl.Map({
  //     container: mapRefContainer.current,
  //     style: "mapbox://styles/mapbox/standard",
  //     // style: "mapbox://styles/mapbox/navigation-preview-night-v4",
  //     zoom: 13,
  //     center: [100.4818, 13.7463],
  //     // pitch: 74,
  //     // bearing: 12.8,
  //     // hash: true
  //     projection: "mercator"
  //   });
  //   setMap(map);

  //   const directions = new MapboxDirections({
  //     accessToken: mapboxgl.accessToken,
  //     // interactive: false,
  //     unit: "metric",
  //     profile: "mapbox/driving",
  //     alternatives: true,
  //     geometries: "geojson",
  //     controls: { instructions: true },
  //     flyTo: true
  //   });

  //   map.addControl(directions, 'top-left');

  //   // const account = new mapsgl.Account(
  //   //   "dj3hazg1e9Evj9EcFg9fz",
  //   //   "6ngFwXzTQx7scqQbSeXGUlvWVS8IcAL4KzeHOsBc"
  //   // );

  //   // const controller = new mapsgl.MapboxMapController(map, {
  //   //   account
  //   // });
  //   // controllerRef.current = controller;

  //   // controller.on("load", () => {
  //   //   setController(controller);
  //   // });
  // }, [setMap]);
  useEffect(() => {
    const loadMap = async () => {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

      const map = new mapboxgl.Map({
        container: mapRefContainer.current,
        style: "mapbox://styles/mapbox/standard",
        zoom: 13,
        center: [100.4818, 13.7463],
        projection: "mercator"
      });

      setMap(map);

      const directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: "metric",
        profile: "mapbox/driving",
        alternatives: true,
        geometries: "geojson",
        controls: { instructions: true },
        flyTo: true
      });

      map.addControl(directions, "top-right");
      map.addControl(new ZoomControl(), "bottom-right");
      map.addControl(new CompassControl(), "bottom-right");
      map.on("ruler.on", () => console.log("ruler: on"));
      map.on("ruler.off", () => console.log("ruler: off"));
      // with miles:
      map.addControl(
        new RulerControl({
          units: "miles",
          labelFormat: (n) => `${n.toFixed(2)} miles`
        }),
        "bottom-right"
      );

      map.on("load", () => {
        if (!trafficIncidentData) return;

        // 1. Create buffer around obstacles
        const obstacleBuffer: any = buffer(trafficIncidentData, 0.25, {
          units: "kilometers"
        });

        // 2. Add visualization layer (optional)
        if (!map.getSource("obstacle")) {
          map.addSource("obstacle", {
            type: "geojson",
            data: obstacleBuffer
          });

          map.addLayer({
            id: "obstacle-layer",
            type: "fill",
            source: "obstacle",
            paint: {
              "fill-color": "#de2d26",
              "fill-opacity": 0.5
            }
          });
        }

        // 3. Hook into Mapbox Directions results
        directions.on("route", (event: any) => {
          const routes = event.route;
          for (let i = 0; i < routes.length; i++) {
            const route = routes[i];
            const geojsonRoute:any = {
              type: "Feature",
              geometry: route.geometry
            };

            const isClear = booleanDisjoint(obstacleBuffer, geojsonRoute);

            const color = isClear ? "#2ca25f" : "#de2d26";

            // Paint logic (optional, MapboxDirections uses default blue otherwise)
            map.setPaintProperty(`directions-route-${i}`, "line-color", color);

            // You can also console or show alerts:
            console.log(
              `Route ${i + 1}: ${
                isClear ? "✅ No collision" : "⚠️ Obstacle intersected"
              }`
            );
          }
        });
      });
    };

    loadMap();
  }, [setMap]);

  useEffect(() => {
    if (!mapRef) return;

    const handleLoad = () => {
      // mapRef.setConfigProperty?.("basemap", "lightPreset", "dawn");
      mapRef.setConfigProperty("basemap", "lightPreset", "dusk");

      const zoomBasedReveal = (value: any) => {
        return ["interpolate", ["linear"], ["zoom"], 11, 0.0, 13, value];
      };

      // mapRef.setRain?.({
      //   density: zoomBasedReveal(0.5),
      //   intensity: 1.0,
      //   color: "#a8adbc",
      //   opacity: 0.7,
      //   vignette: zoomBasedReveal(1.0),
      //   "vignette-color": "#464646",
      //   direction: [0, 80],
      //   "droplet-size": [2.6, 18.2],
      //   "distortion-strength": 0.7,
      //   "center-thinning": 0
      // });
    };

    mapRef.on("style.load", handleLoad);

    return () => {
      mapRef.off("style.load", handleLoad);
    };
  }, [mapRef]);

  useEffect(() => {
    if (!mapRef) return;
    const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      setCursorLatLng({ lat, lng });
      setZoom(mapRef.getZoom());
    };

    mapRef.on("mousemove", handleMouseMove);
    return () => mapRef.off("mousemove", handleMouseMove);
  }, [mapRef, setCursorLatLng, setZoom]);

  return (
    <div>
      <div
        ref={mapRefContainer}
        style={{ height: "100vh", width: "100%" }}
      ></div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });
