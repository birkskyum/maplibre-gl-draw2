"use strict";

import { Evented } from "../lib/evented.ts";
import { formatNumber } from "../lib/format_number";
import land from "../fixtures/urban_areas.json";
import { fpsRunner } from "../lib/fps.ts";
import { TraceMouse } from "../lib/mouse_trace.ts";
import { traceProgress } from "../lib/trace_progress.ts";

export class Benchmark extends Evented {
  constructor(options) {
    super();

    const out = options.createMap();

    const drawing = [];
    land.features.forEach((feature) => {
      feature.geometry.coordinates.forEach((ring) => {
        // eslint-disable-next-line new-cap
        drawing.push(TraceMouse(ring, out.map));
      });
    });

    traceProgress(land.features, out.map);

    const traceMouse = function (cb) {
      const runner = function (count) {
        const draw = drawing[count];
        if (draw) {
          out.draw.changeMode("draw_polygon");
          draw(() => {
            runner(count + 1);
          });
        } else {
          cb();
        }
      };
      runner(0);
    };

    out.map.on("load", () => {
      setTimeout(() => {
        const FPSControl = fpsRunner();
        FPSControl.start();
        traceMouse(() => {
          const fps = FPSControl.stop();
          if (fps < 55) {
            this.fire("fail", {
              message: `${formatNumber(fps)} fps - expected 55fps or better`,
            });
          } else {
            this.fire("pass", { message: `${formatNumber(fps)} fps` });
          }
          out.draw.changeMode("simple_select");
        });
      }, 2000);
    });
  }
}
