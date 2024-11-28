import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

import "../../../dist/maplibre-gl-draw.css";
import {MapLibreDraw } from "../../../src/index.ts";
import { createEffect } from "solid-js";
import { Button } from "../components/button.tsx";

import {CircleMode} from "../../../src/modes/circle/CircleMode.ts";
import {DragCircleMode} from "../../../src/modes/circle/DragCircleMode.ts";
import {DirectModeOverride} from "../../../src/modes/circle/DirectModeOverride.ts";
import {SimpleSelectModeOverride} from "../../../src/modes/circle/SimpleSelectModeOverride.ts";

export default function ReinitControl() {
  
  createEffect(() => {

    const map = new maplibregl.Map({
      container: "map",
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      zoom: 1,
      center: [0, 0],
    });
    
    const modes = MapLibreDraw.modes;
    const Draw = new MapLibreDraw({ modes:{
        ...modes,
        draw_circle  : CircleMode,
        drag_circle  : DragCircleMode,
        // direct_select: DirectModeOverride,
        // simple_select: SimpleSelectModeOverride
    } });
    map.addControl(Draw, "top-right");

    map.on("load", () => {
      // Jump into draw point mode via a custom UI element
      const startCircle = document.getElementById("start-circle");
      startCircle!.onclick = function () {
        Draw.changeMode("draw_circle");
      };

      // Jump into draw line mode via a custom UI element
      const startDragCircle = document.getElementById("start-drag-circle");
      startDragCircle!.onclick = function () {
        Draw.changeMode("drag_circle");
      };

    });


  });
  return (
    <>
      <div id="map" class="h-full"></div>
      <div class="left-2 bottom-2 flex gap-1 absolute">
        <Button id="start-circle">Circle Mode</Button>
        <Button id="start-drag-circle">Drag Circle Mode</Button>
      </div> 
    </>
  )
}



