"use client";
import { useEffect } from "react";
import { useMapStore } from "@/app/provider/mapStore";
import { layerStore } from "@/app/provider/layerStore";
import mapboxgl from "mapbox-gl";
import { buffer, bboxPolygon } from "@turf/turf"; // Ensure turf is installed

export default function TrafficIncidentLayer() {
    const { mapRef } = useMapStore();
    const { activeLayer } = layerStore();

    useEffect(() => {
        if (activeLayer !== "event" || !mapRef?.current) return;

        const map = mapRef.current;
        const popup = new mapboxgl.Popup({ closeButton: false });
        const incident = "https://event.longdo.com/feed/json";

        const fetchAndRender = async () => {
            let trafficIncident: any = { type: "FeatureCollection", features: [] };
            try {
                const data = await fetch(incident).then((res) => res.json());
                for (const point of data) {
                    const coordinates = [
                        parseFloat(point.longitude),
                        parseFloat(point.latitude),
                    ];
                    const feature = {
                        type: "Feature",
                        geometry: { type: "Point", coordinates },
                        properties: point,
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
                                data: trafficIncident,
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
                                    "icon-allow-overlap": true,
                                },
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
