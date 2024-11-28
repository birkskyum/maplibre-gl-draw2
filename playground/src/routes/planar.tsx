import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { IControl } from "maplibre-gl";

import "../../../dist/maplibre-gl-draw.css";
import { MapLibreDraw } from "../../../src/index.ts";
import { createEffect } from "solid-js";
import { Button } from "../components/button.tsx";
import { DrawAssistedRectangle } from "../../../src/modes/draw_assisted_rectangle.ts";
import { A } from "@solidjs/router";
import { DrawCircleMode } from "../../../src/modes/circle/CircleMode.ts";
import { DragCircleMode } from "../../../src/modes/circle/DragCircleMode.ts";
import { SRMode, SRStyle, SRCenter } from "../../../src/modes/scale_rotate.ts";
import { DrawCircleRadiusMode } from "../../../src/modes/circle/RadiusMode.ts";
import { DrawRectangle } from "../../../src/modes/draw_rectangle.ts";

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
        draw_circle: DrawCircleMode,
        draw_circle_radius: DrawCircleRadiusMode,
        drag_circle: DragCircleMode,
        scale_rotate: SRMode,
      },
    });
    map.addControl(Draw as unknown as IControl, "top-right");

    });
    return (
      <>
        <div class="flex h-screen w-full">
          <div class="w-[250px] bg-gray-100 p-5">
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
                  <Button onClick={() => Draw.changeMode("draw_point")}>Point</Button>
                </li>
                <li>
                  <Button onClick={() => Draw.changeMode("draw_line_string")}>Line</Button>
                </li>
                <li>
                  <Button onClick={() => Draw.changeMode("draw_polygon")}>Polygon</Button>
                </li>
                <li>
                  <Button onClick={() => Draw.changeMode("draw_rectangle")}>2-Click Rectangle</Button>
                </li>
                <li>
                  <Button onClick={() => Draw.changeMode("draw_assisted_rectangle")}>
                    3-Click "Assisted" Rectangle
                  </Button>
                </li>
                <li>
                  <Button onClick={() => Draw.changeMode("draw_circle", {
                    initialRadiusInKm: 1000
                  })}>1-Click Circle</Button>
                </li>
                <li>
                  <Button onClick={() => Draw.changeMode("drag_circle")}>Drag Circle</Button>
                </li>
                <li>
                  <Button onClick={() => Draw.changeMode("draw_circle_radius")}>
                    Draw Circle Radius
                  </Button>
                </li>
              </ul>

              <p class="text-xl mt-3">Edit</p>

              <ul class="list-disc p-0">
                <li>
                  <Button onClick={() => Draw.changeMode("scale_rotate")}>Scale and Rotate</Button>
                </li>
                <li>
                <Button onClick={() => Draw.ctx.events?.combineFeatures()}>Combine</Button>
                  
                </li>
                <li>
                <Button onClick={() => Draw.ctx.events?.uncombineFeatures()}>Uncombine</Button>
                </li>

                <li>
                <Button onClick={() => Draw.ctx.events?.trash()}>Delete</Button>
                </li>
              </ul>

              <p class="text-xl mt-3">Selection modes</p>
              <ul class="list-disc p-0">
                <li>
                  <Button onClick={() => Draw.changeMode("simple_select")}>Simple Select</Button>
                </li>
                <li>
                  <Button onClick={() => Draw.changeMode("direct_select")}>Direct Select</Button>
                </li>
                <li>
                  <Button onClick={() => Draw.changeMode("static")}>Static (no selection)</Button>
                </li>

              </ul>

            </nav>
          </div>

        <div id="map" class="h-full w-full"></div>
      </div>
    </>
  );
}
