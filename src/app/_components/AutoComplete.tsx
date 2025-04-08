/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { useMapStore } from "@/app/store/mapStore";

const AutoComplete = () => {
    const [options, setOptions] = useState<any>([]);
    const [search, setSearch] = useState<any>("");
    const [select, setSelect] = useState<any>();
    const { mapRef } = useMapStore(); 

    useEffect(() => {
        (async () => {
            const result = await axios.get(
                `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${search}&f=json`
            );
            setOptions(result.data.suggestions || [{ text: "default" }]);
        })();
    }, [search]);

    useEffect(() => {
        (async () => {
            if (!select) return;
            const resp = await axios.get(
                `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?address=${select}&f=json`
            );
            const result = resp.data.candidates[0];
            if (!result) return;
            mapRef?.flyTo({
                center: [result.location.x, result.location.y],
                essential: true, // this animation is considered essential with respect to prefers-reduced-motion
            });
        })();
    }, [mapRef, select]);

    return (
        <Autocomplete
            // multiple
            freeSolo
            options={options.map((option: any) => option.text)}
            //   onChange={(e) => setSelect(e.target.innerText)}
            onKeyDown={(e: any) => {
                // console.log(e.code);
                if (e.code === "Enter") {
                    console.log(e.target);
                    setSelect(e.target.value);
                }
            }}
            onInputChange={(e: any, value: any) => setSelect(value)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label=""
                    // variant="filled"
                    variant="outlined"
                    placeholder="ค้นหา"
                    onChange={(e) => setSearch(e.target.value)}
                    size="small"
                />
            )}
        />
    );
};

export default AutoComplete;