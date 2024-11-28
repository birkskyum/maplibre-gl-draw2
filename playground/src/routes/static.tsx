import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

import "../../../dist/maplibre-gl-draw.css";
import {MapLibreDraw } from "../../../src/index.ts";

import { createEffect } from "solid-js";

import { ModeClasses } from "../../../src/modes.ts";
import { Button } from "../components/button.tsx";

export default function Static() {
  
  createEffect(() => {

    const map = new maplibregl.Map({
      container: "map",
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      zoom: 1,
      center: [0, 0],
    });

    let modes = ModeClasses;

    const Draw = new MapLibreDraw({ 
      modes: modes,
      defaultMode: "static",
      displayControlsDefault: false,
      controls: {
          point: true,
          line_string: true,
          polygon: true,
          trash: true,
          combine_features: true,
          uncombine_features: true
      }
     });



    map.on("load", () => {
      const startPolygon = document.getElementById("start-polygon");
      startPolygon!.onclick = function () {
        Draw.changeMode("draw_polygon");
      };
      
      const staticMode = document.getElementById("static");
      staticMode!.onclick = function () {
        Draw.changeMode("static");
      };
    });

    const defaultSelect = document.getElementById("simple-select");
    defaultSelect!.onclick = function () {
      Draw.changeMode("simple_select");
    };
    map.addControl(Draw, "top-right");

  });


  return (
    <>
        <div id="map" class="h-full"></div>
        <div class="left-2 bottom-2 flex gap-1 absolute">
        <Button id="static">Static Mode</Button>
        <Button id="simple-select">Simple Select</Button>
        <Button id="start-polygon">Draw Polygon</Button>
      </div> 
    </>
  )
}


