import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

import "../../../dist/maplibre-gl-draw.css";
import {MapLibreDraw } from "../../../src/index.ts";
import { createEffect } from "solid-js";
import { Button } from "../components/button.tsx";
import {DrawAssistedRectangle} from "../../../src/modes/draw_assisted_rectangle.ts"
import { DrawRectangle } from "../../../src/modes/draw_rectangle.ts";


export default function ReinitControl() {
  
  createEffect(() => {

    const map = new maplibregl.Map({
      container: "map",
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      zoom: 1,
      center: [0, 0],
    });
    
    const modes = MapLibreDraw.modes;
    modes.draw_assisted_rectangle = DrawAssistedRectangle;
    modes.draw_rectangle = DrawRectangle;

    const Draw = new MapLibreDraw({ 
      modes
     });
    map.addControl(Draw, "top-right");

    map.on("load", () => {
      // Jump into draw point mode via a custom UI element
      const startRectangle = document.getElementById("start-rectangle");
      startRectangle!.onclick = function () {
        Draw.changeMode("draw_rectangle");
      };

      // Jump into draw line mode via a custom UI element
      const startLine = document.getElementById("start-assisted-rectangle");
      startLine!.onclick = function () {
        Draw.changeMode("draw_assisted_rectangle");
      };

      // Jump into draw polygon mode via a custom UI element
      const startPolygon = document.getElementById("start-polygon");
      startPolygon!.onclick = function () {
        Draw.changeMode("draw_polygon");
      };
    });


  });
  return (
    <>
      <div id="map" class="h-full"></div>
      <div class="left-2 bottom-2 flex gap-1 absolute">
        <Button id="start-rectangle">Rectangle</Button>
        <Button id="start-assisted-rectangle">Assisted Rectangle</Button>
        <Button id="start-polygon">Polygon</Button>
      </div> 
    </>
  )
}



