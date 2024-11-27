import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

import "../../../../dist/maplibre-gl-draw.css";
import {MapLibreDraw } from "../../../../src/index.ts";
import { createEffect } from "solid-js";

import './basic.css'

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
      addButton.onclick = function () {
        if (drawIsActive) return;
        drawIsActive = true;
        map.addControl(Draw, "bottom-right");
      };

      // Remove draw from the map if it is active
      const removeButton = document.getElementById("removeBtn");
      removeButton.onclick = function () {
        if (!drawIsActive) return;
        drawIsActive = false;
        map.removeControl(Draw);
      };

      // Toggle the style between dark and streets
      const flipStyleButton = document.getElementById("flipStyleBtn");
      let currentStyle = "positron-gl-style";
      flipStyleButton.onclick = function () {
        const style = currentStyle === "positron-gl-style"
          ? "dark-matter-gl-style"
          : "positron-gl-style";
        map.setStyle(
          `https://basemaps.cartocdn.com/gl/${currentStyle}/style.json`,
        );
        currentStyle = style;
      };

      // toggle double click zoom
      const doubleClickZoom = document.getElementById("doubleClickZoom");
      let doubleClickZoomOn = true;
      doubleClickZoom.onclick = function () {
        if (doubleClickZoomOn) {
          doubleClickZoomOn = false;
          map.doubleClickZoom.disable();
          doubleClickZoom.innerText = "enable dblclick zoom";
        } else {
          map.doubleClickZoom.enable();
          doubleClickZoomOn = true;
          doubleClickZoom.innerText = "disable dblclick zoom";
        }
      };

      // Jump into draw point mode via a custom UI element
      const startPoint = document.getElementById("start-point");
      startPoint.onclick = function () {
        Draw.changeMode("draw_point");
      };

      // Jump into draw line mode via a custom UI element
      const startLine = document.getElementById("start-line");
      startLine.onclick = function () {
        Draw.changeMode("draw_line_string");
      };

      // Jump into draw polygon mode via a custom UI element
      const startPolygon = document.getElementById("start-polygon");
      startPolygon.onclick = function () {
        Draw.changeMode("draw_polygon");
      };
    });


  });
  return (
    <>
        <div id="map" class="h-[100vh] "></div>
    <div class="start-draw">
      <div id="start-point">POINT</div>
      <div id="start-line">LINE</div>
      <div id="start-polygon">POLYGON</div>
    </div> 
    </>
  )
}


