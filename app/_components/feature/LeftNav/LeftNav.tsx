/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
import styles from "./LeftNav.module.css";
import { layerStore, LayerType } from "../../../provider/layerStore"; // Zustand store for layer management
import { useMapStore } from "@/app/provider/mapStore";
import Image from "next/image";

const layers: LayerType[] = [
  "event",
  "hospital",
  // "traffic",
  "temperature",
  "precipitation",
  "cyclone",
];

export default function LeftNav() {
  const {
    eventToggle,
    setEventToggle,
    hospitalToggle,
    setHospitalToggle,
    trafficToggle,
    setTrafficToggle,
    temperatureToggle,
    setTemperatureToggle,
    precipitationToggle,
    setPrecipitationToggle,
    cycloneToggle,
    setCycloneToggle,
    routeReports,
  } = layerStore();
  const [hoverLayer, setHoverLayer] = useState<LayerType | null>(null);
  const { cursorLatLng, zoom } = useMapStore();
  const formattedLat = cursorLatLng?.lat.toFixed(5) ?? "---";
  const formattedLng = cursorLatLng?.lng.toFixed(5) ?? "---";
  const formattedZoom = zoom?.toFixed(2) ?? "---";

  // console.log("routeReports", routeReports);

  const toggleMap: Record<
    LayerType,
    { value: boolean; set: (val: boolean) => void }
  > = {
    event: { value: eventToggle, set: setEventToggle },
    hospital: { value: hospitalToggle, set: setHospitalToggle },
    // traffic: { value: trafficToggle, set: setTrafficToggle },
    temperature: { value: temperatureToggle, set: setTemperatureToggle },
    precipitation: { value: precipitationToggle, set: setPrecipitationToggle },
    cyclone: { value: cycloneToggle, set: setCycloneToggle },
  };

  const mapStyles = [
    { id: "dusk", label: "Dusk", icon: "icn_dusk" },
    { id: "dawn", label: "Dawn", icon: "icn_dawn" },
    { id: "night", label: "Night", icon: "icn_night" },
    { id: "day", label: "Day", icon: "icn_day" },
  ];

  const { mapRef } = useMapStore();
  const [selectedStyle, setSelectedStyle] = useState("dusk");

  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
    mapRef.setConfigProperty?.("basemap", "lightPreset", style);
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
              <div
                className={`${styles.layerItem} ${value ? styles.active : ""}`}
              >
                <img
                  src={`/images/icn_${layer}${isActive ? "_active" : ""}.svg`}
                  alt={layer}
                  className={styles.icon}
                />
              </div>
              <span
                className={`${styles.label} ${value ? styles.activeLabel : ""}`}
              >
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
        <p className={styles.subtitle}>🗺️ Map Style</p>
        <div className={styles.styleGrid}>
          {mapStyles.map((style) => (
            <div className={styles.styleGridItemWrapper} key={style.id}>
              <div className={styles.styleGridItem} key={style.id}>
                <div
                  key={style.id}
                  className={`${styles.styleWrapper} ${
                    selectedStyle === style.id ? styles.activeStyle : ""
                  }`}
                  onClick={() => handleStyleChange(style.id)}
                >
                  <Image
                    width={38}
                    height={38}
                    src={`/icon/${style.icon}.png`}
                    alt={style.label}
                    className={styles.mapStyleIcon}
                  />
                </div>
              </div>
              <span
                className={`${styles.label} ${
                  selectedStyle === style.id ? styles.activeLabel : ""
                }`}
              >
                {style.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <hr className={styles.divider} />

      {routeReports.length > 0 && (
        <div className={styles.section}>
          <p className={styles.subtitle}>🔁 Route Report</p>
          {routeReports.map((report) => (
            <div key={report.id}>
              {report.isClear ? (
                <>
                  <p className={styles.success}>
                    ✅ Route {report.id + 1} : no obstacles!
                  </p>
                  <p className={`${styles.detail} ${styles.green}`}>
                    This route doesn't pass through obstacles.
                  </p>
                </>
              ) : (
                <>
                  <p className={styles.warning}>
                    ⚠️ Route {report.id + 1} : should be avoided.
                  </p>
                  <p className={`${styles.detail} ${styles.red}`}>
                    This route passes through obstacles.
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
