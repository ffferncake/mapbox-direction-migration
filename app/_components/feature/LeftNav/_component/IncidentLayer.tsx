"use client";
import { useEffect } from "react";
import { useMapStore } from "@/app/provider/mapStore";
import { layerStore } from "@/app/provider/layerStore";
import mapboxgl from "mapbox-gl";
// import { buffer, bboxPolygon } from "@turf/turf"; // Ensure turf is installed

export default function IncidentLayer() {
  const { mapRef } = useMapStore();
  const { activeLayer, mapsgl, setMapsgl } = layerStore();
  const client_id = process.env.NEXT_PUBLIC_XWEATHER_CLIENT_ID;
  const client_secret = process.env.NEXT_PUBLIC_XWEATHER_CLIENT_SECRET;

  console.log("IncidentLayer mounted with activeLayer:", activeLayer);
  // 컴포넌트 마운트 시에만 mapsgl을 동적으로 불러옵니다.
  useEffect(() => {
    try {
      const mapsgl = require("@aerisweather/mapsgl");
      setMapsgl(mapsgl);
    } catch (error) {
      console.error("Error loading mapsgl module:", error);
    }
  }, []);

  useEffect(() => {
    const map = mapRef
    if (!map) return;

    if (activeLayer !== "event") {
      if (map.getLayer("trafficIncident")) {
        map.removeLayer("trafficIncident");
      }
      if (map.getSource("trafficIncident")) {
        map.removeSource("trafficIncident");
      }
      if (map.hasImage("warning")) {
        map.removeImage("warning");
      }
      return;
    }

    // Proceed to render only if 'event' layer is active
    const popup = new mapboxgl.Popup({ closeButton: false });
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

        map.loadImage(
          "https://raw.githubusercontent.com/ffferncake/InteractiveWebMap/main/warning.png",
          (error: any, image: any) => {
            if (error || !image) return;
            if (!map.hasImage("warning")) map.addImage("warning", image);

            if (!map.getSource("trafficIncident")) {
              map.addSource("trafficIncident", {
                type: "geojson",
                data: trafficIncident
              });
            } else {
              map.getSource("trafficIncident").setData(trafficIncident);
            }

            if (!map.getLayer("trafficIncident")) {
              map.addLayer({
                id: "trafficIncident",
                type: "symbol",
                source: "trafficIncident",
                layout: {
                  "icon-image": "warning",
                  "icon-size": 0.05,
                  "icon-allow-overlap": true
                }
              });
            }

            map.on("mouseenter", "trafficIncident", (e: any) => {
              map.getCanvas().style.cursor = "pointer";
              const coords = e.features[0].geometry.coordinates;
              const { title, description } = e.features[0].properties;
              popup
                .setLngLat(coords)
                .setHTML(
                  `<div id="popup-container"><h2>${title}</h2><p>${description}</p></div>`
                )
                .addTo(map);
            });

            map.on("mouseleave", "trafficIncident", () => {
              map.getCanvas().style.cursor = "";
              popup.remove();
            });
          }
        );
      } catch (err) {
        console.error("Failed to fetch traffic incident data:", err);
      }
    };

    fetchAndRender();
  }, [activeLayer, mapRef]);

  return null;
}
