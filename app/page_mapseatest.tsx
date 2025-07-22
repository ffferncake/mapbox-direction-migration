// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-require-imports */
// "use client";
// import "mapbox-gl/dist/mapbox-gl.css";
// import { useEffect, useRef } from "react";
// import dynamic from "next/dynamic";
// import "@aerisweather/mapsgl/dist/mapsgl.css";
// import { useMapStore } from "./provider/mapStore"; // Zustand store for global map management
// import IncidentLayer from "./_components/feature/LeftNav/_component/IncidentLayer";
// import { layerStore } from "@/app/provider/layerStore";

// const MapComponent = () => {
//   const mapRefContainer = useRef<any>(null);
//   // const controllerRef = useRef<any>(null);
//   const { mapRef, setMap, setCursorLatLng, setZoom } = useMapStore(); // Zustand setters

//   useEffect(() => {
//     const mapboxgl = require("mapbox-gl");
//     // const mapsgl = require("@aerisweather/mapsgl");

//     mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

//     const map = new mapboxgl.Map({
//       container: mapRefContainer.current,
//       style: "mapbox://styles/mapbox/standard",
//       // style: "mapbox://styles/mapbox/navigation-preview-night-v4",
//       zoom: 13,
//       center: [100.4818, 13.7463],
//       // pitch: 74,
//       // bearing: 12.8,
//       // hash: true
//       projection: "mercator"
//     });
//     setMap(map);

//     // const account = new mapsgl.Account(
//     //   "dj3hazg1e9Evj9EcFg9fz",
//     //   "6ngFwXzTQx7scqQbSeXGUlvWVS8IcAL4KzeHOsBc"
//     // );

//     // const controller = new mapsgl.MapboxMapController(map, {
//     //   account
//     // });
//     // controllerRef.current = controller;

//     // controller.on("load", () => {
//     //   setController(controller);
//     // });
//   }, [setMap]);

//   useEffect(() => {
//     if (!mapRef) return;

//     const handleLoad = () => {
//       mapRef.setConfigProperty?.("basemap", "lightPreset", "dawn");
//       // mapRef.setConfigProperty("basemap", "lightPreset", "dusk");

//       const zoomBasedReveal = (value: any) => {
//         return ["interpolate", ["linear"], ["zoom"], 11, 0.0, 13, value];
//       };

//       // mapRef.setRain?.({
//       //   density: zoomBasedReveal(0.5),
//       //   intensity: 1.0,
//       //   color: "#a8adbc",
//       //   opacity: 0.7,
//       //   vignette: zoomBasedReveal(1.0),
//       //   "vignette-color": "#464646",
//       //   direction: [0, 80],
//       //   "droplet-size": [2.6, 18.2],
//       //   "distortion-strength": 0.7,
//       //   "center-thinning": 0
//       // });
//     };

//     mapRef.on("style.load", handleLoad);

//     return () => {
//       mapRef.off("style.load", handleLoad);
//     };
//   }, [mapRef]);

//   useEffect(() => {
//     if (!mapRef) return;
//     const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
//       const { lng, lat } = e.lngLat;
//       setCursorLatLng({ lat, lng });
//       setZoom(mapRef.getZoom());
//     };

//     mapRef.on("mousemove", handleMouseMove);
//     return () => mapRef.off("mousemove", handleMouseMove);
//   }, [mapRef, setCursorLatLng, setZoom]);

//   useEffect(() => {
//     if (!mapRef) return;

//     const updateWMSLayer = async () => {
//       const bounds = mapRef.getBounds(); // in lngLat
//       const bbox = [
//         bounds.getWest(),
//         bounds.getSouth(),
//         bounds.getEast(),
//         bounds.getNorth(),
//       ];

//       const wmsUrl = `https://nsidc.org/api/mapservices/NSIDC/wms?service=WMS&version=1.1.0&request=GetMap&layers=NSIDC:g02135_concentration_raster_daily_s&styles=&bbox=${bbox.join(',')}&width=256&height=256&srs=EPSG:4326&format=image/png`;

//       const img = new Image();
//       img.crossOrigin = "anonymous";
//       img.onload = () => {
//         if (mapRef.getSource("wms-source")) {
//           mapRef.getSource("wms-source").updateImage({
//             url: wmsUrl,
//             coordinates: [
//               [bbox[0], bbox[3]], // top-left
//               [bbox[2], bbox[3]], // top-right
//               [bbox[2], bbox[1]], // bottom-right
//               [bbox[0], bbox[1]], // bottom-left
//             ],
//           });
//         } else {
//           mapRef.addSource("wms-source", {
//             type: "image",
//             url: wmsUrl,
//             coordinates: [
//               [bbox[0], bbox[3]],
//               [bbox[2], bbox[3]],
//               [bbox[2], bbox[1]],
//               [bbox[0], bbox[1]],
//             ],
//           });

//           mapRef.addLayer({
//             id: "wms-layer",
//             type: "raster",
//             source: "wms-source",
//             paint: { "raster-opacity": 0.5 },
//           });
//         }
//       };
//       img.src = wmsUrl;
//     };

//     mapRef.on("moveend", updateWMSLayer);
//     updateWMSLayer(); // Initial call

//     return () => {
//       mapRef.off("moveend", updateWMSLayer);
//       if (mapRef.getLayer("wms-layer")) {
//         mapRef.removeLayer("wms-layer");
//       }
//       if (mapRef.getSource("wms-source")) {
//         mapRef.removeSource("wms-source");
//       }
//     };
//   }, [mapRef]);


//   return (
//     <div>
//       <div
//         ref={mapRefContainer}
//         style={{ height: "100vh", width: "100%" }}
//       ></div>
//     </div>
//   );
// };

// export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "@aerisweather/mapsgl/dist/mapsgl.css";
import { useMapStore } from "./provider/mapStore"; // Zustand store for global map management
import IncidentLayer from "./_components/feature/LeftNav/_component/IncidentLayer";
import { layerStore } from "@/app/provider/layerStore";

const MapComponent = () => {
  const mapRefContainer = useRef<any>(null);
  // const controllerRef = useRef<any>(null);
  const { mapRef, setMap, setCursorLatLng, setZoom } = useMapStore(); // Zustand setters

  useEffect(() => {
    const mapboxgl = require("mapbox-gl");
    // const mapsgl = require("@aerisweather/mapsgl");

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: mapRefContainer.current,
      style: "mapbox://styles/mapbox/standard",
      // style: "mapbox://styles/mapbox/navigation-preview-night-v4",
      zoom: 13,
      center: [100.4818, 13.7463],
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
      mapRef.setConfigProperty?.("basemap", "lightPreset", "dawn");
      // mapRef.setConfigProperty("basemap", "lightPreset", "dusk");

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
      // const nsidcUrl = (
      //   bounds: mapboxgl.LngLatBounds
      // ) => {
      //   const [w, s, e, n] = [
      //     Math.max(-180, bounds.getWest()),
      //     Math.max(-90, bounds.getSouth()),
      //     Math.min(180, bounds.getEast()),
      //     Math.min(90, bounds.getNorth()),
      //   ];
      //   return (
      //     `https://nsidc.org/api/mapservices/NSIDC/wms?service=WMS&version=1.1.0&` +
      //     `request=GetMap&layers=NSIDC:g02135_extent_raster_daily_n&styles=&` +
      //     `bbox=${w},${s},${e},${n}&width=256&height=256&` +
      //     `srs=EPSG:4326&format=image/png&transparent=true`
      //   );
      // };

      // const updateNSIDC = () => {
      //   const bounds = mapRef.getBounds();
      //   const url = nsidcUrl(bounds);

      //   const img = new Image();
      //   img.crossOrigin = "anonymous";
      //   img.onload = () => {
      //     if (mapRef.getSource("nsidc-wms-source")) {
      //       (mapRef.getSource("nsidc-wms-source") as any).updateImage({
      //         url,
      //         coordinates: [
      //           [bounds.getWest(), bounds.getNorth()],
      //           [bounds.getEast(), bounds.getNorth()],
      //           [bounds.getEast(), bounds.getSouth()],
      //           [bounds.getWest(), bounds.getSouth()],
      //         ],
      //       });
      //     } else {
      //       mapRef.addSource("nsidc-wms-source", {
      //         type: "image",
      //         url,
      //         coordinates: [
      //           [bounds.getWest(), bounds.getNorth()],
      //           [bounds.getEast(), bounds.getNorth()],
      //           [bounds.getEast(), bounds.getSouth()],
      //           [bounds.getWest(), bounds.getSouth()],
      //         ],
      //       });
      //       mapRef.addLayer({
      //         id: "nsidc-wms-layer",
      //         type: "raster",
      //         source: "nsidc-wms-source",
      //         paint: { "raster-opacity": 0.5 },
      //       });
      //     }
      //   };
      //   img.src = url;
      // };

      // // NSIDC: update on moveend
      // mapRef.on("moveend", updateNSIDC);
      // updateNSIDC();

   
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

  useEffect(() => {
    if (!mapRef) return;
  
    const fetchIcebergs = async () => {
      const bounds = mapRef.getBounds();
      const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ];
  
      const url = `https://icebergfinder.com/api/icebergs?bbox=${bbox.join(",")}`;
  
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch iceberg data");
        const geojson = await res.json();
  
        if (mapRef.getSource("icebergs")) {
          (mapRef.getSource("icebergs") as mapboxgl.GeoJSONSource).setData(geojson);
        } else {
          mapRef.addSource("icebergs", {
            type: "geojson",
            data: geojson,
          });
  
          mapRef.addLayer({
            id: "icebergs",
            type: "circle",
            source: "icebergs",
            paint: {
              "circle-radius": 6,
              "circle-color": "#00bfff",
              "circle-stroke-width": 1,
              "circle-stroke-color": "#ffffff",
            },
          });
        }
      } catch (error) {
        console.error("Error fetching iceberg data:", error);
      }
    };
  
    mapRef.on("moveend", fetchIcebergs);
    fetchIcebergs(); // initial call
  
    return () => {
      mapRef.off("moveend", fetchIcebergs);
      if (mapRef.getLayer("icebergs")) mapRef.removeLayer("icebergs");
      if (mapRef.getSource("icebergs")) mapRef.removeSource("icebergs");
    };
  }, [mapRef]);
  

  return (
    <div>
      <div
        ref={mapRefContainer}
        style={{ height: "100vh", width: "100%" }}
      ></div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });
