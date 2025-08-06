/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "@aerisweather/mapsgl/dist/mapsgl.css";
import { useMapStore } from "./provider/mapStore"; // Zustand store for global map management
import { layerStore } from "@/app/provider/layerStore";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css"; // Import Mapbox Directions CSS
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import { RulerControl, CompassControl, ZoomControl } from "mapbox-gl-controls";
import { point, featureCollection, buffer, booleanDisjoint, union, cleanCoords, simplify, convex } from "@turf/turf";
import dissolve from "@turf/dissolve";

var polyline = require("@mapbox/polyline");

const MapComponent = () => {
  const mapRefContainer = useRef<any>(null);
  // const controllerRef = useRef<any>(null);
  const { mapRef, setMap, setCursorLatLng, setZoom } = useMapStore();
  const { trafficIncidentData, setRouteReports } = layerStore();
  const directionsRef = useRef<any>(null);
  const [forecastPoints, setForecastPoints] = useState<any>([]);

  const parseForecastText = (text: string) => {
    const lines = text.split("\n").map((line) => line.trim());
    const forecastPoints = [];

    for (const line of lines) {
      if (line.startsWith("#") || !line.trim()) continue; // skip headers/comments

      const parts = line.split(/\s+/);
      if (parts.length < 20) continue;

      const lat = parseFloat(parts[7]);
      const lon = parseFloat(parts[8]);
      const rad = parseInt(parts[15]); // RAD column (usually RAD15 or RAD)
      const ws = parseInt(parts[11]); // WS = wind speed
      const ps = parseInt(parts[10]); // PS = pressure
      const timeRaw = parts[6]; // e.g., 202507231200

      // ⏰ Convert to UTC and also get local time string (e.g., KST)
      const utcTimeStr = `${timeRaw.slice(0, 4)}-${timeRaw.slice(4, 6)}-${timeRaw.slice(6, 8)}T${timeRaw.slice(8, 10)}:${timeRaw.slice(10)}:00Z`;
      const localTime = new Date(utcTimeStr).toLocaleString("en-US", {
        timeZone: "Asia/Seoul",
        hour12: true,
      });

      forecastPoints.push({
        lat,
        lon,
        rad,
        ws,
        ps,
        time: utcTimeStr,     // UTC string
        localTime,            // Local time string (e.g., 2025. 7. 28. 19:00:00)
      });
    }

    return forecastPoints;
  };

  console.log("forecastPoints", forecastPoints)

  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        const res = await fetch("/api/kma-proxy");
        const text = await res.text();
        const parsed = parseForecastText(text);
        setForecastPoints(parsed);
      } catch (err) {
        console.error("Failed to fetch forecast data", err);
      }
    };

    fetchForecastData();
  }, []);


  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        const res = await fetch("/api/kma-proxy");
        const text = await res.text();
        const parsed = parseForecastText(text);
        setForecastPoints(parsed);
      } catch (err) {
        console.error("Failed to fetch forecast data", err);
      }
    };

    fetchForecastData();
  }, []);

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
          labelFormat: (n: any) => `${n.toFixed(2)} miles`
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

    // const forecastPoints = [
    //   { lat: 14.3, lon: 143.6, rad: 0, ws: 18, ps: 1002, time: "2025-07-24T03:00:00Z" },
    //   { lat: 14.9, lon: 143.6, rad: 0, ws: 18, ps: 1002, time: "2025-07-24T06:00:00Z" },
    //   { lat: 15.9, lon: 143.4, rad: 0, ws: 18, ps: 1002, time: "2025-07-24T12:00:00Z" },
    //   { lat: 16.2, lon: 143.1, rad: 0, ws: 18, ps: 1000, time: "2025-07-24T18:00:00Z" },
    //   { lat: 17.7, lon: 143.8, rad: 50, ws: 21, ps: 994, time: "2025-07-25T06:00:00Z" },
    //   { lat: 18.6, lon: 144.3, rad: 90, ws: 24, ps: 990, time: "2025-07-25T18:00:00Z" },
    //   { lat: 19.6, lon: 144.8, rad: 110, ws: 27, ps: 985, time: "2025-07-26T06:00:00Z" },
    //   { lat: 21.1, lon: 145.3, rad: 130, ws: 32, ps: 975, time: "2025-07-26T18:00:00Z" },
    //   { lat: 25.4, lon: 145.7, rad: 190, ws: 35, ps: 970, time: "2025-07-27T18:00:00Z" },
    //   { lat: 28.1, lon: 145.8, rad: 280, ws: 35, ps: 970, time: "2025-07-28T18:00:00Z" },
    //   { lat: 30.3, lon: 147.3, rad: 410, ws: 29, ps: 980, time: "2025-07-29T18:00:00Z" }
    // ];

    const features: any = forecastPoints
      .map((p: any) => {
        if (p.rad === 0) return null;
        const pt = point([p.lon, p.lat], {
          wind: p.ws,
          pressure: p.ps,
          time: p.time,
          localTime: p.localTime,
        });
        const radiusKm = p.rad;
        return buffer(pt, radiusKm, { units: "kilometers" });
      })
      .filter((f: any) => f !== null);


    const pointFeatures: any = [];
    // let mergedCone: any = null;

    // Build buffers + merge
    forecastPoints.forEach((p: any) => {
      const pt = point([p.lon, p.lat], {
        wind: p.ws,
        pressure: p.ps,
        time: p.time,
        localTime: p.localTime,
      });

      pointFeatures.push(pt); // for point plotting

      // if (p.rad > 0) {
      //   const radiusKm = p.rad
      //   const circle = buffer(pt, radiusKm, { units: "kilometers" });

      //   if (!mergedCone) {
      //     mergedCone = circle;
      //   } else {
      //     try {
      //       mergedCone = union(mergedCone, circle);
      //     } catch (e) {
      //       console.warn("Union failed for circle buffer", e);
      //     }
      //   }
      // }
    });

    const circleFeatures: any = forecastPoints
      .filter((p: any) => p.rad > 0)
      .map((p: any) => {
        const pt = point([p.lon, p.lat]);
        const radiusKm = p.rad;
        return buffer(pt, radiusKm, { units: "kilometers" });
      });

    // 1. Build buffer around each point
    // 1. Build buffer around each point
    const now = new Date();

    // ⬇️ INSERT HERE: render first point without buffer
    const firstPoint = forecastPoints.find((p: any) => {
      const forecastTime = new Date(p.time);
      return forecastTime >= now;
    });

    if (firstPoint) {
      const pt = point([firstPoint.lon, firstPoint.lat], {
        wind: firstPoint.ws,
        pressure: firstPoint.ps,
        time: firstPoint.time,
      });

      map.addSource("typhoon-current-point", {
        type: "geojson",
        data: pt,
      });

      map.addLayer({
        id: "typhoon-current-point",
        type: "circle",
        source: "typhoon-current-point",
        paint: {
          "circle-radius": 7,
          "circle-color": "#ff0000",
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 2,
        },
      });
    }

    // ⬇️ Continue with future buffers only (excluding first point)
    const circleBuffers: any = forecastPoints
      .filter((p: any) => {
        if (p.rad <= 0) return false;
        const forecastTime = new Date(p.time);
        return forecastTime > now; // ⬅️ strictly future
      })
      .map((p: any) => {
        const center = point([p.lon, p.lat]);
        const radiusKm = p.rad;
        return buffer(center, radiusKm, { units: "kilometers", steps: 64 });
      });

    // Create pairwise convex hulls between consecutive circles
    const segmentHulls: any[] = [];

    for (let i = 0; i < circleBuffers.length - 1; i++) {
      const circle1 = circleBuffers[i];
      const circle2 = circleBuffers[i + 1];

      const coords1 = circle1.geometry.coordinates[0];
      const coords2 = circle2.geometry.coordinates[0];

      const pairPoints = featureCollection([
        ...coords1.map((c: any) => point(c)),
        ...coords2.map((c: any) => point(c)),
      ]);

      const segment = convex(pairPoints);
      if (segment) {
        const cleaned = cleanCoords(segment);
        const simplified = simplify(cleaned, { tolerance: 0.02, highQuality: true });
        segmentHulls.push(simplified); // ✅ collect here
      }
    }


    map.addSource("segment-hulls", {
      type: "geojson",
      data: featureCollection(segmentHulls),
    });

    map.addLayer({
      id: "segment-hulls-fill",
      type: "fill",
      source: "segment-hulls",
      paint: {
        "fill-color": "#a6a6a6",
        "fill-opacity": 0.3,
      },
    });

    map.addLayer({
      id: "segment-hulls-outline",
      type: "line",
      source: "segment-hulls",
      paint: {
        "line-color": "#ffaa00",
        "line-width": 2,
        "line-dasharray": [2, 2],
      },
    });

    // // Add the outer cone (convex hull)
    // map.addSource("typhoon-cone", {
    //   type: "geojson",
    //   data: smoothedCone,
    // });

    // map.addLayer({
    //   id: "typhoon-cone-fill",
    //   type: "fill",
    //   source: "typhoon-cone",
    //   paint: {
    //     "fill-color": "#ffee88",
    //     "fill-opacity": 0.4,
    //   },
    // });

    // map.addLayer({
    //   id: "typhoon-cone-outline",
    //   type: "line",
    //   source: "typhoon-cone",
    //   paint: {
    //     "line-color": "#888",
    //     "line-width": 2,
    //     "line-dasharray": [2, 2],
    //   },
    // });

    const forecastLineCoords = forecastPoints.map((p: any) => [p.lon, p.lat]);

    const forecastLineGeoJSON = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: forecastLineCoords
      }
    };

    // Add source
    map.addSource("forecast-line", {
      type: "geojson",
      data: forecastLineGeoJSON
    });

    // Add line layer
    map.addLayer({
      id: "forecast-line",
      type: "line",
      source: "forecast-line",
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#0066ff", // Blue color
        "line-width": 3
      }
    });


    // Add circle buffers if needed (separate layer)
    map.addSource("typhoon-circles", {
      type: "geojson",
      data: featureCollection(circleBuffers),
    });

    map.addLayer({
      id: "typhoon-circles",
      type: "line",
      source: "typhoon-circles",
      paint: {
        "line-color": "#888",
        "line-width": 1,
        "line-dasharray": [2, 2],
      },
    });


    const featureMultiple: any = featureCollection(circleFeatures);


    // Dissolve to merge polygons
    let mergedCone: any = dissolve(featureMultiple);

    // Optional: check if multiple features exist after dissolve
    if (mergedCone.type === "FeatureCollection") {
      // Convert FeatureCollection to a single MultiPolygon feature
      const allFeatures = mergedCone.features.filter((f: any) => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");

      if (allFeatures.length === 1) {
        mergedCone = allFeatures[0];
      } else {
        mergedCone = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "MultiPolygon",
            coordinates: allFeatures.flatMap((f: any) =>
              f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates
            ),
          },
        };
      }
    }

    // Clean and simplify geometry
    mergedCone = cleanCoords(mergedCone);
    mergedCone = simplify(mergedCone, { tolerance: 0.01, highQuality: true });

    // Add typhoon points
    map.addSource("typhoon-points", {
      type: "geojson",
      data: featureCollection(pointFeatures),
    });

    map.addLayer({
      id: "typhoon-points",
      type: "circle",
      source: "typhoon-points",
      paint: {
        "circle-radius": 5,
        "circle-color": "#d7191c",
        "circle-stroke-color": "#fff",
        "circle-stroke-width": 1,
      },
    });

    map.addLayer({
      id: "typhoon-labels",
      type: "symbol",
      source: "typhoon-points",
      layout: {
        "text-field": ["concat", ["get", "localTime"], "\nWind: ", ["get", "wind"], " kts"],
        "text-font": ["Open Sans Bold"],
        "text-size": 12,
        "text-offset": [0, 1.2],
        "text-anchor": "top",
      },
      paint: {
        "text-color": "#333",
        "text-halo-color": "#fff",
        "text-halo-width": 1.5,
      },
    });

    if (mergedCone.type === "Feature" &&
      (mergedCone.geometry.type === "Polygon" || mergedCone.geometry.type === "MultiPolygon")) {
      if (map.getSource("typhoon-merged-cone")) {
        (map.getSource("typhoon-merged-cone") as mapboxgl.GeoJSONSource).setData(mergedCone);
      } else {
        map.addSource("typhoon-merged-cone", {
          type: "geojson",
          data: mergedCone,
        });

        map.addLayer({
          id: "typhoon-merged-cone-fill",
          type: "fill",
          source: "typhoon-merged-cone",
          paint: {
            "fill-color": "#a6a6a6",
            "fill-opacity": 0.4,
          },
        });

        map.addLayer({
          id: "typhoon-merged-cone-outline",
          type: "line",
          source: "typhoon-merged-cone",
          paint: {
            "line-color": "#a6a6a6",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        });
      }
    }


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

    const bufferedCircles = circleFeatures.map((f: any) => buffer(f, 1, { units: 'kilometers' }));
    const dissolved = dissolve(featureCollection(bufferedCircles));
    console.log("dissolved", dissolved);


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

    directions.on("route", (event: any) => {
      const reports = document.getElementById("reports");
      if (!reports) return; // or handle gracefully
      reports.innerHTML = "";

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

      // const zoomBasedReveal = (value: any) => {
      //   return ["interpolate", ["linear"], ["zoom"], 11, 0.0, 13, value];
      // };

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
