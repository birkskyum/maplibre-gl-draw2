import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

import "../../../../dist/maplibre-gl-draw.css";
import {MapLibreDraw } from "../../../../src/index.ts";
import { createEffect } from "solid-js";
import { Button } from "../components/button.tsx";


export default function ReinitControl() {
  
  createEffect(() => {

    const map = new maplibregl.Map({
      container: "map",
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      zoom: 1,
      center: [0, 0],
    });

    const modes = MapLibreDraw.modes;
    const Draw = new MapLibreDraw({ modes });
    let drawIsActive = true;
    map.addControl(Draw, "top-right");

    map.on("load", () => {
      // Add Draw to the map if it is inactive
      const addButton = document.getElementById("addBtn");
      addButton!.onclick = function () {
        if (drawIsActive) return;
        drawIsActive = true;
        map.addControl(Draw, "top-right");
      };

      // Remove draw from the map if it is active
      const removeButton = document.getElementById("removeBtn");
      removeButton!.onclick = function () {
        if (!drawIsActive) return;
        drawIsActive = false;
        map.removeControl(Draw);
      };

      // Toggle the style between dark and streets
      const flipStyleButton = document.getElementById("flipStyleBtn");
      let currentStyle = "positron-gl-style";
      flipStyleButton!.onclick = function () {
        const style = currentStyle === "positron-gl-style"
          ? "dark-matter-gl-style"
          : "positron-gl-style";
        map.setStyle(
          `https://basemaps.cartocdn.com/gl/${currentStyle}/style.json`,
        );
        currentStyle = style;
      };

    });


  });
  return (
    <>
        <div id="map" class="h-full"></div>


    <div class="left-2 bottom-2 flex gap-1 absolute">
      <Button id="addBtn">Add draw"</Button>
      <Button id="removeBtn">Remove draw</Button>
      <Button id="flipStyleBtn">Change style</Button>
    </div>
    </>
  )
}