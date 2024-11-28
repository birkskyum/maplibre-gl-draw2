import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { IControl } from "maplibre-gl";

import "../../../dist/maplibre-gl-draw.css";
import { DrawRectangle, MapLibreDraw } from "../../../src/index.ts";
import { createEffect } from "solid-js";
import { Button } from "../components/button.tsx";
import { DrawAssistedRectangle } from "../../../src/modes/draw_assisted_rectangle.ts";
import { A } from "@solidjs/router";
import { CircleMode } from "../../../src/modes/circle/CircleMode.ts";
import { DragCircleMode } from "../../../src/modes/circle/DragCircleMode.ts";
import { SRMode, SRStyle, SRCenter } from "../../../src/modes/scale_rotate.ts";
import { RadiusMode } from "../../../src/modes/circle/RadiusMode.ts";

export default function ReinitControl() {
  let drawIsActive = true;
  let map: maplibregl.Map;
  let Draw: MapLibreDraw;

  createEffect(async () => {
    map = new maplibregl.Map({
      container: "map",
      // style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      zoom: 2,
      center: [10, 50],
    });

    const style = await fetch(
      "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    ).then((response) => response.json());

    style.projection = { type: "globe" };

    map.setStyle(style);

    map.addControl(new maplibregl.GlobeControl());

    Draw = new MapLibreDraw({
      modes: {
        ...MapLibreDraw.modes,
        draw_assisted_rectangle: DrawAssistedRectangle,
        draw_rectangle: DrawRectangle,
        draw_circle: CircleMode,
        draw_circle_radius: RadiusMode,
        drag_circle: DragCircleMode,
        scale_rotate: SRMode,
      },
    });
    map.addControl(Draw as unknown as IControl, "top-right");

    map.on("load", () => {
      const startPoint = document.getElementById("start-point");
      startPoint!.onclick = function () {
        Draw.changeMode("draw_point");
      };

      const startLine = document.getElementById("start-line");
      startLine!.onclick = function () {
        Draw.changeMode("draw_line_string");
      };

      const startRectangle = document.getElementById("start-rectangle");
      startRectangle!.onclick = function () {
        Draw.changeMode("draw_rectangle");
      };

      const startAssistedRectangle = document.getElementById(
        "start-assisted-rectangle"
      );
      startAssistedRectangle!.onclick = function () {
        Draw.changeMode("draw_assisted_rectangle");
      };

      const startPolygon = document.getElementById("start-polygon");
      startPolygon!.onclick = function () {
        Draw.changeMode("draw_polygon");
      };

      // const startCircle = document.getElementById("start-circle");
      // startCircle!.onclick = function () {
      //   Draw.changeMode("draw_circle");
      // };

      const startCircleRadius = document.getElementById(
        "start-draw-circle-radius"
      );
      startCircleRadius!.onclick = function () {
        Draw.changeMode("draw_circle_radius");
      };

      const startDragCircle = document.getElementById("start-drag-circle");
      startDragCircle!.onclick = function () {
        Draw.changeMode("drag_circle");
      };

      const startRSRectangle = document.getElementById("start-scale-rotate");
      startRSRectangle!.onclick = function () {
        Draw.changeMode("scale_rotate");
      };

      const staticMode = document.getElementById("static");
      staticMode!.onclick = function () {
        Draw.changeMode("static");
      };
    });
  });
  return (
    <>
      <div class="flex h-screen w-full">
        <div class="w-[250px] bg-gray-100 p-5">
          {/* <h2>Pages</h2> */}
          <nav>
            <p class="text-xl">Installation</p>

            <ul class="list-disc p-0">
              <li>
                <Button
                  onClick={() => {
                    if (drawIsActive) return;
                    drawIsActive = true;
                    map.addControl(Draw as unknown as IControl, "top-right");
                  }}
                >
                  Add draw
                </Button>
              </li>
              <li>
                <Button
                  onClick={() => {
                    if (!drawIsActive) return;
                    drawIsActive = false;
                    map.removeControl(Draw as unknown as IControl);
                  }}
                >
                  Remove draw
                </Button>
              </li>
            </ul>

            <p class="text-xl  mt-3">Draw</p>
            <ul class="list-disc p-0">
              <li>
                <Button id="start-point">Point</Button>
              </li>
              <li>
                <Button id="start-line">Line</Button>
              </li>
              <li>
                <Button id="start-polygon">Polygon</Button>
              </li>

              <li>
                <Button id="start-rectangle"> 2-Click Rectangle</Button>
              </li>
              <li>
                <Button id="start-assisted-rectangle">
                  3-Click "Assisted" Rectangle
                </Button>
              </li>
              {/* <li>
              <Button id="start-circle">1-Click Circle</Button>
            </li> */}
              <li>
                <Button id="start-drag-circle">Drag Circle</Button>
              </li>
              <li>
                <Button id="start-draw-circle-radius">
                  Draw Circle Radius
                </Button>
              </li>
            </ul>

            <p class="text-xl mt-3">Edit</p>

            <ul class="list-disc p-0">
              <li>
                <Button id="start-scale-rotate">Scale and Rotate</Button>
              </li>
              <li>
                <A
                  href="/planar/scale-rotate"
                  class="no-underline text-gray-700"
                >
                  Combine
                </A>
              </li>
              <li>
                <A
                  href="/planar/scale-rotate"
                  class="no-underline text-gray-700"
                >
                  Uncombine
                </A>
              </li>
            </ul>

            <p class="text-xl mt-3">Read-only</p>
            <ul class="list-disc p-0">
              <li>
                <Button id="static">Static Mode</Button>
              </li>
            </ul>
          </nav>
        </div>

        <div id="map" class="h-full w-full"></div>
      </div>
    </>
  );
}
