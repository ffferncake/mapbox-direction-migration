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
  const { trafficIncidentData, setRouteReports } = layerStore();
  const directionsRef = useRef<any>(null);

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

      directionsRef.current = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: "metric",
        profile: "mapbox/driving",
        alternatives: true,
        geometries: "geojson",
        controls: { instructions: true },
        flyTo: true
      });

      map.addControl(directionsRef.current, "top-right");
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
    };

    loadMap();
  }, [setMap]);

  useEffect(() => {
    if (!trafficIncidentData) return;

    const map = mapRef;
    if (!map) return;

    const directions = directionsRef.current;

    if (!directions) return;

    // Rebuild buffer and layer
    const obstacleBuffer: any = buffer(trafficIncidentData, 0.25, {
      units: "kilometers"
    });
    console.log("Obstacle Buffer:", obstacleBuffer);

    if (!map.isStyleLoaded()) {
      map.once("load", () => {
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
      });
    } else {
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
    }

    for (let i = 0; i < 3; i++) {
      map.addSource(`route${i}`, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: []
          }
        }
      });

      map.addLayer({
        id: `route${i}`,
        type: "line",
        source: `route${i}`,
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "#cccccc",
          "line-opacity": 0.5,
          "line-width": 13,
          "line-blur": 0.5
        }
      });
    }

    // directions.on("route", (event: any) => {
    //   const routes = event.route;

    //   const reportResults: { id: number; isClear: boolean }[] = [];

    //   routes.forEach((route: any, i: number) => {
    //     if (
    //       !route.geometry ||
    //       route.geometry.type !== "LineString" ||
    //       !Array.isArray(route.geometry.coordinates)
    //     ) {
    //       console.warn("Invalid route geometry:", route.geometry);
    //       return;
    //     }

    //     const geojsonRoute: any = {
    //       type: "Feature",
    //       geometry: {
    //         type: "LineString",
    //         coordinates: route.geometry.coordinates
    //       },
    //       properties: {}
    //     };

    //     const isClear = booleanDisjoint(obstacleBuffer, geojsonRoute);
    //     console.log(`Route ${i} is clear:`, isClear);
    //     const color = isClear ? "#2ca25f" : "#de2d26";

    //     try {
    //       map.setPaintProperty(`directions-route-${i}`, "line-color", color);
    //     } catch (e) {
    //       console.warn(`Failed to set line color for route ${i}:`, e);
    //     }

    //     // ⬇️ Push the result to the array
    //     reportResults.push({
    //       id: i,
    //       isClear
    //     });
    //   });

    //   // ⬅️ Store the final results in Zustand
    //   setRouteReports(reportResults);
    // });
    directions.on("route", (event: any) => {
      const reports = document.getElementById("reports");
      if (!reports) return; // or handle gracefully
      reports.innerHTML = "";

      const report = reports.appendChild(document.createElement("div"));
      // Add IDs to the routes
      const routes = event.route.map((route: any, index: any) => ({
        ...route,
        id: index
      }));

      // Hide all routes by setting the opacity to zero.
      for (let i = 0; i < 3; i++) {
        map.setLayoutProperty(`route${i}`, "visibility", "none");
      }

      const reportResults: { id: number; isClear: boolean }[] = [];

      for (const route of routes) {
        map.setLayoutProperty(`route${route.id}`, "visibility", "visible");

        const routeLine = polyline.toGeoJSON(route.geometry);
        map.getSource(`route${route.id}`).setData(routeLine);

        const isClear = booleanDisjoint(obstacleBuffer, routeLine) === true;

        map.setPaintProperty(
          `route${route.id}`,
          "line-color",
          isClear ? "#74c476" : "#de2d26"
        );

        // Collect result
        reportResults.push({ id: route.id, isClear });
      }

      // Store the results in Zustand
      setRouteReports(reportResults);
    });

    // Clear route layers when origin/destination is cleared
    directions.on("clear", () => {
      for (let i = 0; i < 3; i++) {
        if (map.getSource(`route${i}`)) {
          map.getSource(`route${i}`).setData({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: []
            }
          });
          map.setLayoutProperty(`route${i}`, "visibility", "none");
        }
      }

      // Optionally reset report state in Zustand
      setRouteReports([]);
    });
  }, [trafficIncidentData, mapRef]);

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
      <div
        id="reports"
        style={{ position: "absolute", top: 10, left: 10, zIndex: 9999 }}
      ></div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });
