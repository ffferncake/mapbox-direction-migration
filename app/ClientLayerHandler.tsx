"use client";

import { layerStore } from "@/app/provider/layerStore";
import IncidentLayer from "@/app/_components/feature/LeftNav/_component/IncidentLayer";

export default function ClientLayerHandler() {
  const { activeLayer } = layerStore();

  console.log("ClientLayerHandler activeLayer:", activeLayer);
  //   if (activeLayer === "event") {
  return <IncidentLayer />;
  //   }

  return null;
}
