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

const MapComponent = () => {
  const mapRefContainer = useRef<any>(null);
  // const controllerRef = useRef<any>(null);
  const { mapRef, setMap, setCursorLatLng, setZoom } = useMapStore(); // Zustand setters

  useEffect(() => {
    const mapboxgl = require("mapbox-gl");
    // const mapsgl = require("@aerisweather/mapsgl");

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: mapRefContainer.current,
      style: "mapbox://styles/mapbox/standard",
      // style: "mapbox://styles/mapbox/navigation-preview-night-v4",
      zoom: 13,
      center: [100.4818, 13.7463],
      // pitch: 74,
      // bearing: 12.8,
      // hash: true
      projection: "mercator"
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
      mapRef.setConfigProperty?.("basemap", "lightPreset", "dawn");
      // mapRef.setConfigProperty("basemap", "lightPreset", "dusk");

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

  useEffect(() => {
    if (!mapRef) return;

    const updateWMSLayer = async () => {
      const bounds = mapRef.getBounds(); // in lngLat
      const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ];

      const wmsUrl = `https://nsidc.org/api/mapservices/NSIDC/wms?service=WMS&version=1.1.0&request=GetMap&layers=NSIDC:g02135_concentration_raster_daily_s&styles=&bbox=${bbox.join(',')}&width=256&height=256&srs=EPSG:4326&format=image/png`;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (mapRef.getSource("wms-source")) {
          mapRef.getSource("wms-source").updateImage({
            url: wmsUrl,
            coordinates: [
              [bbox[0], bbox[3]], // top-left
              [bbox[2], bbox[3]], // top-right
              [bbox[2], bbox[1]], // bottom-right
              [bbox[0], bbox[1]], // bottom-left
            ],
          });
        } else {
          mapRef.addSource("wms-source", {
            type: "image",
            url: wmsUrl,
            coordinates: [
              [bbox[0], bbox[3]],
              [bbox[2], bbox[3]],
              [bbox[2], bbox[1]],
              [bbox[0], bbox[1]],
            ],
          });

          mapRef.addLayer({
            id: "wms-layer",
            type: "raster",
            source: "wms-source",
            paint: { "raster-opacity": 0.5 },
          });
        }
      };
      img.src = wmsUrl;
    };

    mapRef.on("moveend", updateWMSLayer);
    updateWMSLayer(); // Initial call

    return () => {
      mapRef.off("moveend", updateWMSLayer);
      if (mapRef.getLayer("wms-layer")) {
        mapRef.removeLayer("wms-layer");
      }
      if (mapRef.getSource("wms-source")) {
        mapRef.removeSource("wms-source");
      }
    };
  }, [mapRef]);


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
