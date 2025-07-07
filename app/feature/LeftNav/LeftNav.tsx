"use client";
import React, { useState } from "react";
import styles from "./LeftNav.module.css";

type LayerType =
  | "event"
  | "hospital"
  | "traffic"
  | "temperature"
  | "precipitation";

const layers: LayerType[] = [
  "event",
  "hospital",
  "traffic",
  "temperature",
  "precipitation"
];

export default function LeftNav() {
  const [activeLayer, setActiveLayer] = useState<LayerType | null>("event");
  const [hoverLayer, setHoverLayer] = useState<LayerType | null>(null);

  const getIconSrc = (layer: LayerType) => {
    const isActive = layer === activeLayer || layer === hoverLayer;
    return `/images/icn_${layer}${isActive ? "_active" : ""}.svg`;
  };

  return (
    <div className={styles.leftNav}>
      {/* <div className={styles.section}> */}
        <p className={styles.subtitle}>Layers</p>
        <div className={styles.layerGrid}>
          {layers.map((layer) => (
            <div
              key={layer}
              className={styles.layerWrapper}
              onClick={() => setActiveLayer(layer)}
              onMouseEnter={() => setHoverLayer(layer)}
              onMouseLeave={() => setHoverLayer(null)}
            >
              <div
                className={`${styles.layerItem} ${
                  layer === activeLayer ? styles.active : ""
                }`}
              >
                <img
                  src={getIconSrc(layer)}
                  alt={layer}
                  className={styles.icon}
                />
              </div>
              <span
                className={`${styles.label} ${
                  layer === activeLayer ? styles.activeLabel : ""
                }`}
              >
                {layer.charAt(0).toUpperCase() + layer.slice(1)}
              </span>
            </div>
          ))}
        </div>
      {/* </div> */}

      <hr className={styles.divider} />

      <div className={styles.section}>
        <p className={styles.subtitle}>📍 Coordinate</p>
        <p>Lat : 13.771 | Lng: 100.493</p>
        <p>Zoom Level : 12.60</p>
        <p>MGRS : 47PPR61442298</p>
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
