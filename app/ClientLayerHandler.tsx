"use client";
import { useState, } from "react";
// import { layerStore } from "@/app/provider/layerStore";
import IncidentLayer from "@/app/_components/feature/LeftNav/_component/IncidentLayer";
import LeftNav from "./_components/feature/LeftNav/LeftNav";
import styles from "./_components/feature/LeftNav/LeftNav.module.css";

export default function ClientLayerHandler() {
  const [showNav, setShowNav] = useState(true);

  return (
    <>
      <IncidentLayer />
      {showNav && <LeftNav />}
      {/* Toggle button */}
      <button
        onClick={() => setShowNav(!showNav)}
        className={styles.toggleButton}
        style={{ left: showNav ? "285px" : "0px" }}
      >
        <span
          className={`${styles.toggleIcon} ${
            showNav ? styles.toggleIconRotated : ""
          }`}
        >
          ❯
        </span>
      </button>
    </>
  );

  //   }

  return null;
}
