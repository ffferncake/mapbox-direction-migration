/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
import styles from "./LeftNav.module.css";
import { layerStore, LayerType } from "../../../provider/layerStore"; // Zustand store for layer management
import { useMapStore } from "@/app/provider/mapStore";

const layers: LayerType[] = [
  "event",
  "hospital",
  "traffic",
  "temperature",
  "precipitation"
];

export default function LeftNav() {
  const {
    eventToggle, setEventToggle,
    hospitalToggle, setHospitalToggle,
    trafficToggle, setTrafficToggle,
    temperatureToggle, setTemperatureToggle,
    precipitationToggle, setPrecipitationToggle,
  } = layerStore();
  const [hoverLayer, setHoverLayer] = useState<LayerType | null>(null);
  const { cursorLatLng, zoom } = useMapStore();
  const formattedLat = cursorLatLng?.lat.toFixed(5) ?? "---";
  const formattedLng = cursorLatLng?.lng.toFixed(5) ?? "---";
  const formattedZoom = zoom?.toFixed(2) ?? "---";

  // const getIconSrc = (layer: LayerType) => {
  //   const isActive = layer === activeLayer || layer === hoverLayer;
  //   return `/images/icn_${layer}${isActive ? "_active" : ""}.svg`;
  // };

  const toggleMap: Record<LayerType, { value: boolean; set: (val: boolean) => void }> = {
    event: { value: eventToggle, set: setEventToggle },
    hospital: { value: hospitalToggle, set: setHospitalToggle },
    traffic: { value: trafficToggle, set: setTrafficToggle },
    temperature: { value: temperatureToggle, set: setTemperatureToggle },
    precipitation: { value: precipitationToggle, set: setPrecipitationToggle },
  };


  return (
    <div className={styles.leftNav}>
      {/* <div className={styles.section}> */}
      <p className={styles.subtitle}>Layers</p>
      <div className={styles.layerGrid}>
        {layers.map((layer) => {
          const { value, set } = toggleMap[layer];
          const isActive = value || layer === hoverLayer;

          return (
            <div
              key={layer}
              className={styles.layerWrapper}
              onClick={() => set(!value)}
              onMouseEnter={() => setHoverLayer(layer)}
              onMouseLeave={() => setHoverLayer(null)}
            >
              <div className={`${styles.layerItem} ${value ? styles.active : ""}`}>
                <img
                  src={`/images/icn_${layer}${isActive ? "_active" : ""}.svg`}
                  alt={layer}
                  className={styles.icon}
                />
              </div>
              <span className={`${styles.label} ${value ? styles.activeLabel : ""}`}>
                {layer.charAt(0).toUpperCase() + layer.slice(1)}
              </span>
            </div>
          );
        })}

      </div>
      {/* </div> */}

      <hr className={styles.divider} />

      <div className={styles.section}>
        <p className={styles.subtitle}>📍 Coordinate</p>
        <p>
          Lat : {formattedLat} | Lng: {formattedLng}
        </p>
        <p>Zoom Level : {formattedZoom}</p>
        {/* <p>MGRS : 47PPR61442298</p> */}
      </div>

      <hr className={styles.divider} />

      <div className={styles.section}>
        <p className={styles.subtitle}>🔁 Route Report</p>
        <p className={styles.warning}>⚠️ Route 1 : should be avoided.</p>
        <p className={`${styles.detail} ${styles.red}`}>
          This route passes through obstacles.
        </p>
        <p className={styles.success}>✅ Route 2 : no obstacles!</p>
        <p className={`${styles.detail} ${styles.green}`}>
          This route doesn't pass through obstacles.
        </p>
      </div>
    </div>
  );
}
