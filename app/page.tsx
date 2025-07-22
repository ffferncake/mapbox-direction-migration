/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "@aerisweather/mapsgl/dist/mapsgl.css";
import { useMapStore } from "./provider/mapStore"; // Zustand store for global map management
import IncidentLayer from "./_components/feature/LeftNav/_component/IncidentLayer";
import { layerStore } from "@/app/provider/layerStore";
import mapboxgl from "mapbox-gl";
import styles from "./_components/feature/LeftNav/_component/IncidentLayer.module.css"; // Import styles for popup
const MapComponent = () => {
  const mapRefContainer = useRef<any>(null);
  // const controllerRef = useRef<any>(null);
  const { mapRef, setMap, setCursorLatLng, setZoom } = useMapStore(); // Zustand setters
  const [disaster, setDisaster] = useState<any>(null);

  useEffect(() => {
    const mapboxgl = require("mapbox-gl");
    // const mapsgl = require("@aerisweather/mapsgl");

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: mapRefContainer.current,
      style: "mapbox://styles/mapbox/standard",
      // style: "mapbox://styles/mapbox/navigation-preview-night-v4",
      zoom: 5,
      center: [-55.7229, 51.9558],
      // center: [100.4818, 13.7463],
      // pitch: 74,
      // bearing: 12.8,
      // hash: true
      projection: "mercator"
    });
    setMap(map);

    // const account = new mapsgl.Account(
    //   "dj3hazg1e9Evj9EcFg9fz",
    //   "6ngFwXzTQx7scqQbSeXGUlvWVS8IcAL4KzeHOsBc"
    // );

    // const controller = new mapsgl.MapboxMapController(map, {
    //   account
    // });
    // controllerRef.current = controller;

    // controller.on("load", () => {
    //   setController(controller);
    // });
  }, [setMap]);

  useEffect(() => {
    if (!mapRef) return;

    const handleLoad = () => {
      // mapRef.setConfigProperty?.("basemap", "lightPreset", "dawn");
      mapRef.setConfigProperty("basemap", "lightPreset", "dusk");

      const zoomBasedReveal = (value: any) => {
        return ["interpolate", ["linear"], ["zoom"], 11, 0.0, 13, value];
      };

      // mapRef.setRain?.({
      //   density: zoomBasedReveal(0.5),
      //   intensity: 1.0,
      //   color: "#a8adbc",
      //   opacity: 0.7,
      //   vignette: zoomBasedReveal(1.0),
      //   "vignette-color": "#464646",
      //   direction: [0, 80],
      //   "droplet-size": [2.6, 18.2],
      //   "distortion-strength": 0.7,
      //   "center-thinning": 0
      // });
    };

    mapRef.on("style.load", handleLoad);

    return () => {
      mapRef.off("style.load", handleLoad);
    };
  }, [mapRef]);

  useEffect(() => {
    if (!mapRef) return;
    const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      setCursorLatLng({ lat, lng });
      setZoom(mapRef.getZoom());
    };

    mapRef.on("mousemove", handleMouseMove);
    return () => mapRef.off("mousemove", handleMouseMove);
  }, [mapRef, setCursorLatLng, setZoom]);

  // useEffect(() => {
  //   if (!mapRef) return;

  //   const updateWMSLayer = async () => {
  //     const bounds = mapRef.getBounds(); // in lngLat
  //     const bbox = [
  //       bounds.getWest(),
  //       bounds.getSouth(),
  //       bounds.getEast(),
  //       bounds.getNorth(),
  //     ];
  //     const wmsUrl = `https://nsidc.org/api/mapservices/NSIDC/wms?service=WMS&version=1.1.0&request=GetMap&layers=NSIDC:g02135_extent_raster_daily_n&styles=&bbox=${bbox.join(',')}&width=256&height=256&srs=EPSG:4326&format=image/png&transparent=true`;

  //     const img = new Image();
  //     img.crossOrigin = "anonymous";
  //     img.onload = () => {
  //       if (mapRef.getSource("wms-source")) {
  //         mapRef.getSource("wms-source").updateImage({
  //           url: wmsUrl,
  //           coordinates: [
  //             [bbox[0], bbox[3]], // top-left
  //             [bbox[2], bbox[3]], // top-right
  //             [bbox[2], bbox[1]], // bottom-right
  //             [bbox[0], bbox[1]], // bottom-left
  //           ],
  //         });
  //       } else {
  //         mapRef.addSource("wms-source", {
  //           type: "image",
  //           url: wmsUrl,
  //           coordinates: [
  //             [bbox[0], bbox[3]],
  //             [bbox[2], bbox[3]],
  //             [bbox[2], bbox[1]],
  //             [bbox[0], bbox[1]],
  //           ],
  //         });

  //         mapRef.addLayer({
  //           id: "wms-layer",
  //           type: "raster",
  //           source: "wms-source",
  //           paint: { "raster-opacity": 0.5 },
  //         });
  //       }
  //     };
  //     img.src = wmsUrl;
  //   };

  //   mapRef.on("moveend", updateWMSLayer);
  //   updateWMSLayer(); // Initial call

  //   return () => {
  //     mapRef.off("moveend", updateWMSLayer);
  //     if (mapRef.getLayer("wms-layer")) {
  //       mapRef.removeLayer("wms-layer");
  //     }
  //     if (mapRef.getSource("wms-source")) {
  //       mapRef.removeSource("wms-source");
  //     }
  //   };
  // }, [mapRef]);
  useEffect(() => {
    if (!mapRef) return;

    // Helper to add both overlays
    const addOverlays = () => {
      // --- NSIDC WMS overlay (as you already have) ---
      const nsidcUrl = (
        bounds: mapboxgl.LngLatBounds
      ) => {
        const [w, s, e, n] = [
          Math.max(-180, bounds.getWest()),
          Math.max(-90, bounds.getSouth()),
          Math.min(180, bounds.getEast()),
          Math.min(90, bounds.getNorth()),
        ];
        return (
          `https://nsidc.org/api/mapservices/NSIDC/wms?service=WMS&version=1.1.0&` +
          `request=GetMap&layers=NSIDC:nsidc_0051_raster_n&styles=&` +
          `bbox=${w},${s},${e},${n}&width=256&height=256&` +
          `srs=EPSG:4326&format=image/png&transparent=true`
        );
      };

      const updateNSIDC = () => {
        const bounds = mapRef.getBounds();
        const url = nsidcUrl(bounds);

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (mapRef.getSource("nsidc-wms-source")) {
            (mapRef.getSource("nsidc-wms-source") as any).updateImage({
              url,
              coordinates: [
                [bounds.getWest(), bounds.getNorth()],
                [bounds.getEast(), bounds.getNorth()],
                [bounds.getEast(), bounds.getSouth()],
                [bounds.getWest(), bounds.getSouth()],
              ],
            });
          } else {
            mapRef.addSource("nsidc-wms-source", {
              type: "image",
              url,
              coordinates: [
                [bounds.getWest(), bounds.getNorth()],
                [bounds.getEast(), bounds.getNorth()],
                [bounds.getEast(), bounds.getSouth()],
                [bounds.getWest(), bounds.getSouth()],
              ],
            });
            mapRef.addLayer({
              id: "nsidc-wms-layer",
              type: "raster",
              source: "nsidc-wms-source",
              paint: { "raster-opacity": 0.5 },
            });
          }
        };
        img.src = url;
      };

      // NSIDC: update on moveend
      mapRef.on("moveend", updateNSIDC);
      updateNSIDC();


      // if (!mapRef.getSource("cmems-ssh")) {
      //   mapRef.addSource("cmems-ssh", {
      //     type: "raster",
      //     tileSize: 256,
      //     tiles: [
      //       "https://wmts.marine.copernicus.eu/teroWmts?" +
      //       "service=WMTS&request=GetTile" +
      //       "&layer=SEALEVEL_GLO_PHY_L4_NRT_008_046/cmems_obs-sl_glo_phy-ssh_nrt_allsat-l4-duacs-0.25deg_P1D_202311/adt" +
      //       "&tilematrixset=EPSG:4326" +
      //       "&tilematrix={z}" +
      //       "&tilerow={y}" +
      //       "&tilecol={x}" +
      //       "&time=2024-05-16" +
      //       "&style=default"
      //     ]
      //   });

      //   mapRef.addLayer({
      //     id: "cmems-ssh-layer",
      //     type: "raster",
      //     source: "cmems-ssh",
      //     paint: {}
      //   });
      // }



    };

    // If the style is already loaded, run immediately...
    if (mapRef.isStyleLoaded()) {
      addOverlays();
    }
    // ...otherwise wait for it
    mapRef.on("style.load", addOverlays);

    // Cleanup on unmount
    return () => {
      mapRef.off("style.load", addOverlays);
      mapRef.off("moveend", () => { }); // NSIDC moveend handler
      if (mapRef.getLayer("nsidc-wms-layer")) mapRef.removeLayer("nsidc-wms-layer");
      if (mapRef.getSource("nsidc-wms-source")) mapRef.removeSource("nsidc-wms-source");
      if (mapRef.getLayer("copernicus-wmts-layer")) mapRef.removeLayer("copernicus-wmts-layer");
      if (mapRef.getSource("copernicus-wmts")) mapRef.removeSource("copernicus-wmts");
    };
  }, [mapRef]);

  // useEffect(() => {
  //   if (!mapRef) return;

  //   const fetchIcebergs = async () => {
  //     const bounds = mapRef.getBounds();
  //     const bbox = [
  //       bounds.getWest(),
  //       bounds.getSouth(),
  //       bounds.getEast(),
  //       bounds.getNorth(),
  //     ];

  //     const url = `https://icebergfinder.com/api/icebergs?bbox=${bbox.join(",")}`;

  //     try {
  //       const res = await fetch(url);
  //       if (!res.ok) throw new Error("Failed to fetch iceberg data");
  //       const geojson = await res.json();
  //       console.log("Iceberg GeoJSON:", geojson);
  //       if (mapRef.getSource("icebergs")) {
  //         (mapRef.getSource("icebergs") as mapboxgl.GeoJSONSource).setData(geojson);
  //       } else {
  //         mapRef.addSource("icebergs", {
  //           type: "geojson",
  //           data: geojson,
  //         });

  //         mapRef.loadImage("/icon/icn_iceberg.png", (error: any, image: any) => {
  //           if (error || !image) {
  //             console.error("Failed to load icon image");
  //             return;
  //           }

  //           if (!mapRef.hasImage("iceberg-icon")) {
  //             mapRef.addImage("iceberg-icon", image);
  //           }
  //         });

  //         mapRef.addLayer({
  //           id: "icebergs",
  //           type: "symbol",
  //           source: "icebergs",
  //           layout: {
  //             "icon-image": "iceberg-icon",
  //             "icon-size": 0.8,
  //             "icon-allow-overlap": true,
  //           },
  //         });

  //         // 🔄 Add popup listeners **inside** after layer added
  //         // let popup: mapboxgl.Popup | null = null;

  //         // mapRef.on("mouseenter", "icebergs", (e: any) => {
  //         //   mapRef.getCanvas().style.cursor = "pointer";
  //         //   const coordinates = e.features[0].geometry.coordinates.slice();

  //         //   let observer = "Unknown observer";
  //         //   let maniceCode = "Unknown type";

  //         //   try {
  //         //     const props = e.features[0].properties;

  //         //     // If `props` is a string (rare), parse it
  //         //     const parsedProps = typeof props === "string" ? JSON.parse(props) : props;

  //         //     observer = parsedProps?.observer || "Unknown observer";
  //         //     maniceCode = parsedProps?.ManiceCode || "Unknown type";
  //         //   } catch (err) {
  //         //     console.warn("Failed to access properties:", err);
  //         //   }

  //         //   if (popup) popup.remove();
  //         //   popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
  //         //     .setLngLat(coordinates)
  //         //     .setHTML(
  //         //       `<div class="${styles.eventPopupContent}">
  //         //         <h2 class="${styles.eventPopuptitle}">ICEBERG</h2>
  //         //         <div class="${styles.eventPopupDivider}"></div>
  //         //         <p><strong>Observer:</strong> ${observer}</p>
  //         //         <p><strong>Type:</strong> ${maniceCode}</p>
  //         //       </div>`
  //         //     )
  //         //     .addTo(mapRef);
  //         // });

  //         // mapRef.on("mouseleave", "icebergs", () => {
  //         //   mapRef.getCanvas().style.cursor = "";
  //         //   if (popup) popup.remove();
  //         //   popup = null;
  //         // });
  //         const popup = new mapboxgl.Popup({ closeButton: true });

  //         mapRef.on("click", "icebergs", (e: any) => {
  //           const coordinates = e.features[0].geometry.coordinates.slice();
  //           const props = e.features[0].properties;

  //           let observer = "";
  //           let maniceCode = "";
  //           let placeName = "";
  //           let dateTime = "";

  //           try {
  //             observer = props.observer || "-";
  //             dateTime = props.dateTime || "-";

  //             const rawCode = props.ManiceCode || "-";
  //             maniceCode = rawCode.replace(/_/g, " "); // ✅ Replace underscores

  //             if (typeof props.place === "string") {
  //               const parsedPlace = JSON.parse(props.place);
  //               placeName = parsedPlace?.name || "-";
  //             } else {
  //               placeName = props.place?.name || "-";
  //             }
  //           } catch (err) {
  //             console.warn("Failed to parse iceberg properties:", err);
  //           }

  //           while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
  //             coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  //           }

  //           popup
  //             .setLngLat(coordinates)
  //             .setHTML(
  //               `<div class="${styles.eventPopupContent}">
  //                 <h2 class="${styles.eventPopuptitle}">ICEBERG</h2>
  //                 <div class="${styles.eventPopupDivider}"></div>
  //                 <div class="${styles.eventPopupWrapper}"><p class="${styles.eventPopupHeader}">Date : </p>${dateTime}</div>
  //                 <div class="${styles.eventPopupWrapper}"><p class="${styles.eventPopupHeader}">Observer : </p>${observer}</div>
  //                 <div class="${styles.eventPopupWrapper}"><p class="${styles.eventPopupHeader}">Place : </p>${placeName}</div>
  //                 <div class="${styles.eventPopupWrapper}"><p class="${styles.eventPopupHeader}">Type : </p>${maniceCode}</div>
  //               </div>`
  //             )
  //             .addTo(mapRef);
  //         });

  //       }
  //     } catch (error) {
  //       console.error("Error fetching iceberg data:", error);
  //     }
  //   };

  //   mapRef.on("moveend", fetchIcebergs);
  //   fetchIcebergs(); // initial call

  //   return () => {
  //     mapRef.off("moveend", fetchIcebergs);
  //     if (mapRef.getLayer("icebergs")) mapRef.removeLayer("icebergs");
  //     if (mapRef.getSource("icebergs")) mapRef.removeSource("icebergs");
  //   };
  // }, [mapRef]);

  useEffect(() => {
    if (!mapRef) return;

    const fetchDisaster = async () => {
      try {
        // call your own API route instead of Ambee directly
        const res = await fetch("http://localhost:3001/api/disaster");

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setDisaster(json);
        console.log("Latest disaster via proxy:", json);
      } catch (err) {
        console.error("Failed to load disaster data:", err);
      }
    };

    fetchDisaster();
  }, [mapRef]);

  useEffect(() => {
    if (!mapRef || !disaster) return;

    const siFeatures = disaster
      .flatMap((continentEntry: any) => continentEntry.data?.result || [])
      .filter((event: any) => event.event_type === "SI")
      .map((event: any) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [event.lng, event.lat],
        },
        properties: {
          event_id: event.event_id,
          event_name: event.event_name,
          date: event.date,
          continent: event.continent,
          country_code: event.country_code,
          source_id: event.source_event_id,
        },
      }));

    const geoJson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: siFeatures,
    };

    if (mapRef.getSource("si-events")) {
      (mapRef.getSource("si-events") as mapboxgl.GeoJSONSource).setData(geoJson);
    } else {
      mapRef.addSource("si-events", {
        type: "geojson",
        data: geoJson,
      });

      mapRef.loadImage("/icon/icn_iceberg.png", (error: any, image: any) => {
        if (error || !image) return;

        if (!mapRef.hasImage("si-icon")) {
          mapRef.addImage("si-icon", image);
        }

        mapRef.addLayer({
          id: "si-layer",
          type: "symbol",
          source: "si-events",
          layout: {
            "icon-image": "si-icon",
            "icon-size": 0.8,
            "icon-allow-overlap": true,
          },
        });
      });
    }


    const popup = new mapboxgl.Popup({ closeButton: true });

    mapRef.on("click", "si-layer", (e: any) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const props = e.features[0].properties;

      const icebergName = props.event_name || "-";
      const date = props.date || "-";
      const continent = props.continent || "-";
      const countryCode = props.country_code || "-";
      const sourceId = props.source_event_id || "-";
      const eventId = props.event_id;
      console.log("Clicked eventId:", eventId);
      
      popup
        .setLngLat(coordinates)
        .setHTML(
          `<div class="${styles.eventPopupContent}">
            <h2 class="${styles.eventPopuptitle}">${icebergName}</h2>
            <div class="${styles.eventPopupDivider}"></div>
            <div class="${styles.eventPopupWrapper}">
              <p class="${styles.eventPopupHeader}">Date:</p> ${date}
            </div>
            <div class="${styles.eventPopupWrapper}">
              <p class="${styles.eventPopupHeader}">Continent:</p> ${continent.toUpperCase()}
            </div>
            <div class="${styles.eventPopupWrapper}">
              <p class="${styles.eventPopupHeader}">Country Code:</p> ${countryCode.toUpperCase()}
            </div>
            <div class="${styles.eventPopupWrapper}">
              <p class="${styles.eventPopupHeader}">Source ID:</p> ${sourceId}
            </div>
          </div>`
        )
        .addTo(mapRef);

      // if (eventId) {
      //   fetch(`http://localhost:3001/api/disaster/event?eventId=${eventId}`)
      //     .then((res) => {
      //       if (!res.ok) throw new Error(`Failed to fetch event data: ${res.status}`);
      //       return res.json();
      //     })
      //     .then((eventDetails) => {
      //       console.log("Fetched event details:", eventDetails);
      //       // Optional: dynamically update popup or UI with more detailed info
      //     })
      //     .catch((err) => {
      //       console.error("Error fetching event details:", err);
      //     });
      // }

    });

    return () => {
      if (mapRef.getLayer("si-layer")) mapRef.removeLayer("si-layer");
      if (mapRef.getSource("si-events")) mapRef.removeSource("si-events");
    };
  }, [mapRef, disaster]);

  return (
    <div>
      <div
        ref={mapRefContainer}
        style={{ height: "100vh", width: "100%" }}
      ></div>
      <div
        id="reports"
        style={{ position: "absolute", top: 10, left: 10, zIndex: 9999 }}
      ></div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });
