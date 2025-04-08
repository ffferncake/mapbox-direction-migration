/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useMapStore } from "./store/mapStore";
import { api_getTideHeight } from "./apis/ocean";
import stationIcon from "../../public/icon/station_icon.png";
import mapboxgl from 'mapbox-gl';
import styles from "./page.module.css";
import AutoComplete from "@/app/_components/AutoComplete"; // Import your AutoComplete component

const MapComponent = () => {
  const mapRef = useRef<any>(null);
  const { setMap } = useMapStore(); // Zustand setters

  const currentDate = "Fri Nov 01 2024 14:24:10 GMT+0900 (한국 표준시)";

  useEffect(() => {
    mapboxgl.accessToken = `${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`;

    const map = new mapboxgl.Map({
      container: mapRef.current!,
      style: "mapbox://styles/mapbox/navigation-preview-night-v4",
      center: [126.59222, 37.45194],
      zoom: 10,
      // projection: "mercator",
    });

    setMap(map);

    // Add the station icon image to the map
    map.on("load", async () => {
      // Load the station icon into the map's style
      map.loadImage(stationIcon.src, (error, image) => {
        if (error) throw error;
        if (!map.hasImage("stationIcon")) {
          map.addImage("stationIcon", image!);
        }

        // Add a GeoJSON source for tide station locations
        map.addSource("stationSource", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [], // Start with an empty feature collection
          },
        });

        // Add a layer to use the station icon at each station's coordinates
        map.addLayer({
          id: "stationLayer",
          type: "symbol",
          source: "stationSource",
          layout: {
            "icon-image": "stationIcon",
            "icon-size": 1.0, // Adjust the icon size as needed
          },
        });
      });

      // Fetch tide height data and update source data
      const fetchTideHeight = async () => {
        const tideData = await api_getTideHeight();
        console.log("Tide data:", tideData?.result);

        const { obs_lat, obs_lon } = tideData?.result?.meta || {};

        if (obs_lat && obs_lon) {
          // Update the GeoJSON source with the new location
          (map.getSource("stationSource") as mapboxgl.GeoJSONSource)?.setData({
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [parseFloat(obs_lon), parseFloat(obs_lat)],
                },
                properties: {},
              },
            ],
          });
        }
        // Format `currentDate` to match only the hour and minute, with seconds set to "00"
        const currentDateObj = new Date(currentDate);
        const currentDateFormatted = `${currentDateObj.toISOString().split("T")[0]
          } ${String(currentDateObj.getHours()).padStart(2, "0")}:${String(
            currentDateObj.getMinutes()
          ).padStart(2, "0")}:00`;

        // Find matching tide data by `record_time` with seconds set to "00"
        type TideDataItem = {
          record_time: string;
          tide_level: number;
        };

        const matchingRecord = tideData?.result?.data?.find(
          (item: TideDataItem) => item.record_time === currentDateFormatted
        );

        if (matchingRecord) {
          console.log("Matching Tide Level:", matchingRecord.tide_level);
        } else {
          console.log(
            "No matching tide level found for the current date and time."
          );
        }
      };

      fetchTideHeight();
    });
  }, [setMap]);

  return (
    <div>
      <div className={styles.autoSearch}>
        <AutoComplete />
      </div>
      <div ref={mapRef} style={{ height: "100vh", width: "100%" }}>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });
