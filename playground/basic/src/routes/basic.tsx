import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

import "../../../../dist/maplibre-gl-draw.css";
import {MapLibreDraw } from "../../../../src/index.ts";
import { createEffect } from "solid-js";


export default function Basic() {
  
  createEffect(() => {

    const map = new maplibregl.Map({
      container: "map",
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      zoom: 1,
      center: [0, 0],
    });
    
    const modes = MapLibreDraw.modes;
    const Draw = new MapLibreDraw({ modes });
    map.addControl(Draw, "top-right");


  });
  return (
    <>
        <div id="map" class="h-full"></div>
  
    </>
  )
}


