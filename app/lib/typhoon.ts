// lib/typhoon.ts
import {
  point,
  buffer,
  featureCollection,
  simplify,
  cleanCoords,
  convex,
} from "@turf/turf";

export const renderTropicalCyclone = async (
  map: mapboxgl.Map,
  cycloneDataUrl: string = "/api/kma-proxy"
) => {
  const response = await fetch(cycloneDataUrl);
  const text = await response.text();

  const parseForecastText = (text: string) => {
    const lines = text.split("\n").map((line) => line.trim());
    const forecastPoints: any[] = [];

    for (const line of lines) {
      if (line.startsWith("#") || !line.trim()) continue;
      const parts = line.split(/\s+/);
      if (parts.length < 20) continue;

      const lat = parseFloat(parts[7]);
      const lon = parseFloat(parts[8]);
      const rad = parseInt(parts[15]);
      const ws = parseInt(parts[11]);
      const ps = parseInt(parts[10]);
      const timeRaw = parts[6];
      const utcTimeStr = `${timeRaw.slice(0, 4)}-${timeRaw.slice(
        4,
        6
      )}-${timeRaw.slice(6, 8)}T${timeRaw.slice(8, 10)}:${timeRaw.slice(
        10
      )}:00Z`;

      const localTime = new Date(utcTimeStr).toLocaleString("en-US", {
        timeZone: "Asia/Seoul",
        hour12: true,
      });

      forecastPoints.push({
        lat,
        lon,
        rad,
        ws,
        ps,
        time: utcTimeStr,
        localTime,
      });
    }
    return forecastPoints;
  };

  const forecastPoints = parseForecastText(text);
  const now = new Date();

  // Create pairwise convex hulls between consecutive circles
  const segmentHulls: any[] = [];

  const pointFeatures = forecastPoints.map((p: any) =>
    point([p.lon, p.lat], {
      wind: p.ws,
      pressure: p.ps,
      time: p.time,
      localTime: p.localTime,
    })
  );

  const circleBuffers:any = forecastPoints
    .filter((p: any) => p.rad > 0)
    .map((p: any) => {
      const center = point([p.lon, p.lat]);
      return buffer(center, p.rad, { units: "kilometers", steps: 64 });
    });

  if (!map.getSource("typhoon-circles")) {
    map.addSource("typhoon-circles", {
      type: "geojson",
      data: featureCollection(circleBuffers),
    });

    map.addLayer({
      id: "typhoon-circles",
      type: "line",
      source: "typhoon-circles",
      paint: {
        "line-color": "#888",
        "line-width": 1,
        "line-dasharray": [2, 2],
      },
    });
  }

  console.log("circleBuffers:", circleBuffers);
  console.log("segmentHulls:", segmentHulls);

  for (let i = 0; i < circleBuffers.length - 1; i++) {
    const coords1 = circleBuffers[i].geometry.coordinates[0];
    const coords2 = circleBuffers[i + 1].geometry.coordinates[0];
    const fc = featureCollection(
      [...coords1, ...coords2].map((c: any) => point(c))
    );
    const segment = convex(fc);
    if (segment) {
      const cleaned = cleanCoords(segment);
      const simplified = simplify(cleaned, {
        tolerance: 0.02,
        highQuality: true,
      });
      segmentHulls.push(simplified);
    }
  }

  const forecastLineCoords = forecastPoints.map((p: any) => [p.lon, p.lat]);

  const forecastLineGeoJSON: any = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: forecastLineCoords,
    },
  };

  if (!map.getSource("typhoon-points")) {
    map.addSource("typhoon-points", {
      type: "geojson",
      data: featureCollection(pointFeatures),
    });

    map.addLayer({
      id: "typhoon-points",
      type: "circle",
      source: "typhoon-points",
      paint: {
        "circle-radius": 5,
        "circle-color": "#d7191c",
        "circle-stroke-color": "#fff",
        "circle-stroke-width": 1,
      },
    });

    map.addLayer({
      id: "typhoon-labels",
      type: "symbol",
      source: "typhoon-points",
      layout: {
        "text-field": [
          "concat",
          ["get", "localTime"],
          "\nWind: ",
          ["get", "wind"],
          " kts",
        ],
        "text-font": ["Open Sans Bold"],
        "text-size": 12,
        "text-offset": [0, 1.2],
        "text-anchor": "top",
      },
      paint: {
        "text-color": "#333",
        "text-halo-color": "#fff",
        "text-halo-width": 1.5,
      },
    });
  }

  if (!map.getSource("forecast-line")) {
    map.addSource("forecast-line", {
      type: "geojson",
      data: forecastLineGeoJSON,
    });

    map.addLayer({
      id: "forecast-line",
      type: "line",
      source: "forecast-line",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#0066ff",
        "line-width": 3,
      },
    });
  }

  if (!map.getSource("segment-hulls")) {
    map.addSource("segment-hulls", {
      type: "geojson",
      data: featureCollection(segmentHulls),
    });

    map.addLayer({
      id: "segment-hulls-fill",
      type: "fill",
      source: "segment-hulls",
      paint: {
        "fill-color": "#a6a6a6",
        "fill-opacity": 0.3,
      },
    });

    map.addLayer({
      id: "segment-hulls-outline",
      type: "line",
      source: "segment-hulls",
      paint: {
        "line-color": "#ffaa00",
        "line-width": 2,
        "line-dasharray": [2, 2],
      },
    });
  }
};
