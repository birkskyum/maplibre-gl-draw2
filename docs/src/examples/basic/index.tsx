import * as turf from "@turf/turf";
import { MapLibreDraw } from "@birkskyum/maplibre-gl-draw";
import { IControl, Map as MapGL } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// import "@birkskyum/maplibre-gl-draw/dist/maplibre-gl-draw.css";
import { createEffect } from "solid-js";

export default function() {

    let draw;
    let map;
    createEffect(() => {
        

    MapLibreDraw.constants.classes.CONTROL_BASE = "maplibregl-ctrl";
    MapLibreDraw.constants.classes.CONTROL_PREFIX = "maplibregl-ctrl-";
    MapLibreDraw.constants.classes.CONTROL_GROUP = "maplibregl-ctrl-group";

    let modes = MapLibreDraw.modes;

    map = new MapGL({
        container: "map", // container id
        style:
        "https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL", //hosted style id
        center: [-91.874, 42.76], // starting position
        zoom: 12, // starting zoom
    });

    draw = new MapLibreDraw({
        modes: {
        ...modes,
        },
        displayControlsDefault: false,
        controls: {
        polygon: true,
        trash: true,
        },
    });
    
    map.addControl(draw as unknown as IControl);

    map.on("draw.create", updateArea);
    map.on("draw.delete", updateArea);
    map.on("draw.update", updateArea);
    })
  function updateArea(e) {
    const data = draw.getAll();
    const answer = document.getElementById("calculated-area");
    if (data.features.length > 0) {
      const area = turf.area(data);
      // restrict to area to 2 decimal points
      const roundedArea = Math.round(area * 100) / 100;
      answer.innerHTML = `<p><strong>${roundedArea}</strong></p><p>square meters</p>`;
    } else {
      answer.innerHTML = "";
      if (e.type !== "draw.delete")
        alert("Use the draw tools to draw a polygon!");
    }
  }

  return (
    <>
      <div id="map" class="h-full"></div>
      <div class="calculation-box">
        <p>Draw a polygon using the draw tools.</p>
        <div id="calculated-area"></div>
      </div>
    </>
  );
}
