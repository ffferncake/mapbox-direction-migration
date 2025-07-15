"use client";
import { useEffect } from "react";
import { useMapStore } from "@/app/provider/mapStore";
import { layerStore } from "@/app/provider/layerStore";
import mapboxgl from "mapbox-gl";
import styles from "./IncidentLayer.module.css";

export default function IncidentLayer() {
  const { mapRef } = useMapStore();
  // const { activeLayer, mapsgl, setMapsgl } = layerStore();
  const {
    eventToggle,
    hospitalToggle,
    temperatureToggle,
    precipitationToggle,
    mapsgl,
    setMapsgl,
    setTrafficIncidentData
  } = layerStore();
  const client_id = process.env.NEXT_PUBLIC_XWEATHER_CLIENT_ID;
  const client_secret = process.env.NEXT_PUBLIC_XWEATHER_CLIENT_SECRET;

  useEffect(() => {
    try {
      const mapsgl = require("@aerisweather/mapsgl");
      setMapsgl(mapsgl);
    } catch (error) {
      console.error("Error loading mapsgl module:", error);
    }
  }, []);

  useEffect(() => {
    const map = mapRef;
    if (!map) return;
    const popup = new mapboxgl.Popup({ closeButton: true });

    // Clear old layers/sources
    if (map.getLayer("trafficIncident")) map.removeLayer("trafficIncident");
    if (map.getSource("trafficIncident")) map.removeSource("trafficIncident");
    if (map.hasImage("warning")) map.removeImage("warning");

    if (map.getLayer("hospital-layer")) map.removeLayer("hospital-layer");
    if (map.getSource("hospital")) map.removeSource("hospital");
    if (map.hasImage("hospital")) map.removeImage("hospital");

    // Remove previous weather layers if exist
    if (map.getLayer("temperature-layer")) map.removeLayer("temperature-layer");
    if (map.getSource("temperature-source"))
      map.removeSource("temperature-source");
    if (map.getLayer("precipitation-layer"))
      map.removeLayer("precipitation-layer");
    if (map.getSource("precipitation-source"))
      map.removeSource("precipitation-source");

    if (eventToggle) {
      const incident = "https://event.longdo.com/feed/json";

      const fetchAndRender = async () => {
        let trafficIncident: any = { type: "FeatureCollection", features: [] };
        try {
          const data = await fetch(incident).then((res) => res.json());
          for (const point of data) {
            const coordinates = [
              parseFloat(point.longitude),
              parseFloat(point.latitude)
            ];
            const feature = {
              type: "Feature",
              geometry: { type: "Point", coordinates },
              properties: point
            };
            trafficIncident.features.push(feature);
          }

          map.loadImage("/icon/icn_warning.png", (error: any, image: any) => {
            if (error || !image) return;
            if (!map.hasImage("warning")) map.addImage("warning", image);

            map.addSource("trafficIncident", {
              type: "geojson",
              data: trafficIncident
            });

            map.addLayer({
              id: "trafficIncident",
              type: "symbol",
              source: "trafficIncident",
              layout: {
                "icon-image": "warning",
                "icon-size": 0.8,
                "icon-allow-overlap": true
              }
            });

            map.on("click", "trafficIncident", (e: any) => {
              const coords = e.features[0].geometry.coordinates;
              const { title, description } = e.features[0].properties;

              popup
                .setLngLat(coords)
                .setHTML(
                  `<div class="${styles.eventPopupContent}">
                                    <h2 class="${styles.eventPopuptitle}">${title}</h2>
                                    <div class="${styles.eventPopupDivider}"></div>
                                    <p>${description}</p></div>`
                )
                .addTo(map);
            });
          });

          setTrafficIncidentData(trafficIncident);
        } catch (err) {
          console.error("Failed to fetch traffic incident data:", err);
        }
      };

      fetchAndRender();
    }

    if (hospitalToggle) {
      map.loadImage("/icon/icn_hospital.png", (error: any, image: any) => {
        if (error || !image) return;

        if (!map.hasImage("hospital")) map.addImage("hospital", image);

        map.addSource("hospital", {
          type: "geojson",
          data: "https://data.opendevelopmentmekong.net/dataset/ab20b509-2b7f-442e-8448-05d3a17651ac/resource/76253a1a-b472-4d64-b209-0ea3114f51f4/download/thailand_health_facilities_th.geojson"
        });

        map.addLayer({
          id: "hospital-layer",
          type: "symbol",
          source: "hospital",
          layout: {
            "icon-image": "hospital",
            "icon-allow-overlap": true,
            "icon-size": 0.8,
            visibility: "visible"
          }
        });

        map.on("click", "hospital-layer", (e: any) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const agency = e.features[0].properties.Agency;
          const ministry = e.features[0].properties.Ministry;
          const department = e.features[0].properties.Department;

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          popup
            .setLngLat(coordinates)
            .setHTML(
              `<div class="${styles.eventPopupContent}">
                                <h2 class="${styles.eventPopuptitle}">${agency}</h2>
                                <div class="${styles.eventPopupDivider}"></div>
                                <div class="${styles.eventPopupWrapper}"><p class="${styles.eventPopupHeader}">Ministry : </p>${ministry}</div>
                                <div class="${styles.eventPopupWrapper}"><p class="${styles.eventPopupHeader}">Department : </p>${department}</div>
                                </div>`
            )
            .addTo(map);
        });
      });
    }

    // Temperature Overlay
    if (temperatureToggle) {
      map.addSource("temperature-source", {
        type: "raster",
        tiles: [
          "https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=152118f99e361e7816ebd28eb775a6c6"
        ],
        tileSize: 256
      });

      map.addLayer({
        id: "temperature-layer",
        type: "raster",
        source: "temperature-source",
        layout: {
          visibility: "visible"
        }
      });
    }

    // Precipitation Overlay
    if (precipitationToggle) {
      map.addSource("precipitation-source", {
        type: "raster",
        tiles: [
          "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=152118f99e361e7816ebd28eb775a6c6"
        ],
        tileSize: 256
      });

      map.addLayer({
        id: "precipitation-layer",
        type: "raster",
        source: "precipitation-source",
        layout: {
          visibility: "visible"
        }
      });
    }

    // Cleanup popup when clicking elsewhere (only if the layers exist)
    map.on("click", (e: any) => {
      const layersToCheck: string[] = [];
      if (map.getLayer("trafficIncident"))
        layersToCheck.push("trafficIncident");
      if (map.getLayer("hospital-layer")) layersToCheck.push("hospital-layer");

      if (layersToCheck.length === 0) return;

      const features = map.queryRenderedFeatures(e.point, {
        layers: layersToCheck
      });

      if (features.length === 0) {
        popup.remove();
      }
    });
  }, [
    eventToggle,
    hospitalToggle,
    temperatureToggle,
    precipitationToggle,
    mapRef
  ]);

  return null;
}
