/* eslint no-shadow:[0] */
import {describe, test} from "vitest";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import turfCentroid from "@turf/centroid";
import createSyntheticEvent from "synthetic-dom-events";
import { spy } from "sinon";

import { MapLibreDraw } from "../index.ts";
import { mouseClick } from "../../test/utils/mouse_click.ts";
import { touchTap } from "../../test/utils/touch_tap.ts";
import { getGeoJSON } from "../../test/utils/get_geojson.ts";
import { createMap } from "../../test/utils/create_map.ts";
import { setupAfterNextRender } from "../../test/utils/after_next_render.ts";
import { makeMouseEvent } from "../../test/utils/make_mouse_event.ts";
import { makeTouchEvent } from "../../test/utils/make_touch_event.ts";
import { ModeStrings } from "../constants/modes.ts";

describe("direct_select", async () => {
  const mapContainer = document.createElement("div");
  document.body.appendChild(mapContainer);
  const map = createMap({ container: mapContainer });

  const Draw = new MapLibreDraw();
  map.addControl(Draw);

  spy(map, "fire");

  const afterNextRender = setupAfterNextRender(map);

  const cleanUp = async function () {
    Draw.deleteAll();
    map.fire.resetHistory();
    await afterNextRender();
  };

  const getFireArgs = function () {
    const args: any[] = [];
    for (let i = 0; i < map.fire.callCount; i++) {
      args.push(map.fire.getCall(i).args);
    }
    return args;
  };

  await test("direct_select - init map for tests", () => {
    const done = function () {
      map.off("load", done);
    };

    if (map.loaded()) {
      done();
    } else {
      map.on("load", done);
    }
  });

  await test(
    "direct_select - should fire correct actionable when no vertices selected",
    async () => {
      const ids = Draw.add(getGeoJSON("polygon"));
      Draw.changeMode(ModeStrings.simple_select, {
        featureIds: ids,
      });

      await afterNextRender();

      Draw.changeMode(ModeStrings.direct_select, {
        featureId: ids[0],
      });

      await afterNextRender();

      const actionableArgs = getFireArgs().filter(
        (arg) => arg[0] === "draw.actionable",
      );
      assert(
        actionableArgs.length > 0,
        "should have fired an actionable event",
      );
      if (actionableArgs.length > 0) {
        const actionable = actionableArgs[actionableArgs.length - 1][1];
        assertEquals(
          actionable.actions.combineFeatures,
          false,
          "should fire correct combine actionable",
        );
        assertEquals(
          actionable.actions.uncombineFeatures,
          false,
          "should fire correct uncombine actionable",
        );
        assertEquals(
          actionable.actions.trash,
          false,
          "should fire correct trash actionable",
        );
      }

      await cleanUp();
    },
  );

  await test(
    "direct_select - should fire correct actionable when a vertex is selected by clicking",
    async () => {
      const ids = Draw.add(getGeoJSON("polygon"));
      Draw.changeMode(ModeStrings.direct_select, {
        featureId: ids[0],
      });
      const clickAt = getGeoJSON("polygon").geometry.coordinates[0][0];
      await afterNextRender();

      mouseClick(map, makeMouseEvent(clickAt[0], clickAt[1]));

      await afterNextRender();
      const actionableArgs = getFireArgs().filter(
        (arg) => arg[0] === "draw.actionable",
      );
      assert(
        actionableArgs.length > 0,
        "should have fired an actionable event",
      );
      if (actionableArgs.length > 0) {
        const actionable = actionableArgs[actionableArgs.length - 1][1];
        assertEquals(
          actionable.actions.combineFeatures,
          false,
          "should fire correct combine actionable",
        );
        assertEquals(
          actionable.actions.uncombineFeatures,
          false,
          "should fire correct uncombine actionable",
        );
        assertEquals(
          actionable.actions.trash,
          true,
          "should fire correct trash actionable",
        );
      }

      await cleanUp();
    },
  );

  await test(
    "direct_select - should fire correct actionable when a vertex is selected by tapping",
    async () => {
      const ids = Draw.add(getGeoJSON("polygon"));
      Draw.changeMode(ModeStrings.direct_select, {
        featureId: ids[0],
      });
      const tapAt = getGeoJSON("polygon").geometry.coordinates[0][0];
      await afterNextRender();

      touchTap(map, makeTouchEvent(tapAt[0], tapAt[1]));
      await afterNextRender();

      const actionableArgs = getFireArgs().filter(
        (arg) => arg[0] === "draw.actionable",
      );
      assert(
        actionableArgs.length > 0,
        "should have fired an actionable event",
      );
      if (actionableArgs.length > 0) {
        const actionable = actionableArgs[actionableArgs.length - 1][1];
        assertEquals(
          actionable.actions.combineFeatures,
          false,
          "should fire correct combine actionable",
        );
        assertEquals(
          actionable.actions.uncombineFeatures,
          false,
          "should fire correct uncombine actionable",
        );
        assertEquals(
          actionable.actions.trash,
          true,
          "should fire correct trash actionable",
        );
      }

      await cleanUp();
    },
  );

  await test(
    "direct_select - trashing vertices should delete the correct ones",
    async () => {
      const longLine = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [10, 0],
            [20, 0],
            [30, 0],
            [40, 0],
            [50, 0],
            [60, 0],
            [70, 0],
            [80, 0],
            [80, 10],
            [70, 10],
            [60, 10],
            [50, 10],
          ],
        },
      };
      const ids = Draw.add(longLine);
      Draw.changeMode(ModeStrings.direct_select, {
        featureId: ids[0],
      });

      await afterNextRender();
      // select multiple nodes at indices 9, 10, 11
      mouseClick(map, makeMouseEvent(70, 10, { shiftKey: true }));
      mouseClick(map, makeMouseEvent(80, 10, { shiftKey: true }));
      mouseClick(map, makeMouseEvent(60, 10, { shiftKey: true }));
      await afterNextRender();
      Draw.trash();
      const afterTrash = Draw.get(ids[0]);
      assertEquals(afterTrash.geometry.coordinates, [
        [0, 0],
        [10, 0],
        [20, 0],
        [30, 0],
        [40, 0],
        [50, 0],
        [60, 0],
        [70, 0],
        [80, 0],
        [50, 10],
      ]);
      await cleanUp();
    },
  );

  await test(
    "direct_select - a click on a vertex and than dragging the map shouldn't drag the vertex",
    async () => {
      const ids = Draw.add(getGeoJSON("polygon"));
      Draw.changeMode(ModeStrings.direct_select, {
        featureId: ids[0],
      });

      const clickAt = getGeoJSON("polygon").geometry.coordinates[0][0];
      await afterNextRender();
      mouseClick(map, makeMouseEvent(clickAt[0], clickAt[1]));
      await afterNextRender();
      map.fire("mousedown", makeMouseEvent(clickAt[0] + 15, clickAt[1] + 15));
      map.fire(
        "mousemove",
        makeMouseEvent(clickAt[0] + 30, clickAt[1] + 30, { buttons: 1 }),
      );
      map.fire("mouseup", makeMouseEvent(clickAt[0] + 30, clickAt[1] + 30));
      const afterMove = Draw.get(ids[0]);
      assertEquals(
        getGeoJSON("polygon").geometry,
        afterMove.geometry,
        "should be the same after the drag",
      );
      await cleanUp();
    },
  );

  await test(
    "direct_select - fire one update when dragging mouse leaves container and button is released outside",
    async () => {
      const ids = Draw.add(getGeoJSON("polygon"));
      Draw.changeMode(ModeStrings.direct_select, {
        featureId: ids[0],
      });

      const startPosition = getGeoJSON("polygon").geometry.coordinates[0][1];
      await afterNextRender();
      mouseClick(map, makeMouseEvent(startPosition[0], startPosition[1]));
      await afterNextRender();
      map.fire.resetHistory();
      map.fire("mousedown", makeMouseEvent(startPosition[0], startPosition[1]));
      map.fire(
        "mousemove",
        makeMouseEvent(startPosition[0] + 15, startPosition[1] + 15, {
          buttons: 1,
        }),
      );
      mapContainer.dispatchEvent(createSyntheticEvent("mouseout"));
      map.fire(
        "mousemove",
        makeMouseEvent(startPosition[0] + 30, startPosition[1] + 30),
        { buttons: 1 },
      );
      map.fire(
        "mouseup",
        makeMouseEvent(startPosition[0] + 30, startPosition[1] + 30),
      );

      const afterMove = Draw.get(ids[0]);
      const args = getFireArgs().filter((arg) => arg[0] === "draw.update");
      assertEquals(args.length, 1, "draw.update called once");
      assertEquals(
        afterMove.geometry.coordinates[0][1][0],
        startPosition[0] + 15,
        "point lng moved only the first amount",
      );
      assertEquals(
        afterMove.geometry.coordinates[0][1][1],
        startPosition[1] + 15,
        "point lat moved only the first amount",
      );

      await cleanUp();
    },
  );

  await test(
    "direct_select - fire two updates when dragging mouse leaves container then returns and button is released inside",
    async () => {
      const ids = Draw.add(getGeoJSON("polygon"));
      Draw.changeMode(ModeStrings.direct_select, {
        featureId: ids[0],
      });

      const startPosition = getGeoJSON("polygon").geometry.coordinates[0][1];
      await afterNextRender();
      mouseClick(map, makeMouseEvent(startPosition[0], startPosition[1]));
      await afterNextRender();
      map.fire.resetHistory();
      map.fire("mousedown", makeMouseEvent(startPosition[0], startPosition[1]));
      map.fire(
        "mousemove",
        makeMouseEvent(startPosition[0] + 15, startPosition[1] + 15, {
          buttons: 1,
        }),
      );
      mapContainer.dispatchEvent(createSyntheticEvent("mouseout"));
      map.fire(
        "mousemove",
        makeMouseEvent(startPosition[0] + 30, startPosition[1] + 30, {
          buttons: 1,
        }),
      );
      map.fire(
        "mouseup",
        makeMouseEvent(startPosition[0] + 30, startPosition[1] + 30),
      );

      const afterMove = Draw.get(ids[0]);
      const args = getFireArgs().filter((arg) => arg[0] === "draw.update");
      assertEquals(args.length, 2, "draw.update called twice");
      assertEquals(
        afterMove.geometry.coordinates[0][1][0],
        startPosition[0] + 30,
        "point lng moved to the mouseup location",
      );
      assertEquals(
        afterMove.geometry.coordinates[0][1][1],
        startPosition[1] + 30,
        "point lat moved to the mouseup location",
      );

      await cleanUp();
    },
  );

  await test(
    "direct_select - drag feature if no vertices are selected",
    async () => {
      const [polygonId] = Draw.add(getGeoJSON("polygon"));
      Draw.changeMode(ModeStrings.direct_select, {
        featureId: polygonId,
      });

      const startPosition = getGeoJSON("polygon").geometry.coordinates[0][1];
      const centroid = turfCentroid(getGeoJSON("polygon")).geometry.coordinates;
      await afterNextRender();
      map.fire.resetHistory();
      mouseClick(map, makeMouseEvent(centroid[0], centroid[1]));
      map.fire("mousedown", makeMouseEvent(centroid[0], centroid[1]));
      map.fire(
        "mousemove",
        makeMouseEvent(centroid[0] + 15, centroid[1] + 15, { buttons: 1 }),
      );
      map.fire("mouseup", makeMouseEvent(centroid[0] + 15, centroid[1] + 15));

      const afterMove = Draw.get(polygonId);
      const args = getFireArgs().filter((arg) => arg[0] === "draw.update");
      assertEquals(args.length, 1, "draw.update called once");
      assertEquals(
        afterMove.geometry.coordinates[0][1][0],
        startPosition[0] + 15,
        "point lng moved to the mouseup location",
      );
      assertEquals(
        afterMove.geometry.coordinates[0][1][1],
        startPosition[1] + 15,
        "point lat moved to the mouseup location",
      );

      await cleanUp();
    },
  );

  await test(
    "direct_select - dragging a selected vertex updates stored coordinates",
    async () => {
      const [lineId] = Draw.add(getGeoJSON("line"));
      Draw.changeMode(ModeStrings.direct_select, {
        featureId: lineId,
      });

      assertEquals(
        Draw.getSelectedPoints().features[0],
        undefined,
        "no initial selection",
      );

      const startPosition = getGeoJSON("line").geometry.coordinates[0];
      const endPosition = [startPosition[0] + 10, startPosition[1] + 10];
      await afterNextRender();

      map.fire.resetHistory();
      mouseClick(map, makeMouseEvent(startPosition[0], startPosition[1]));
      assertEquals(
        Draw.getSelectedPoints().features[0].geometry.coordinates,
        startPosition,
        "click saves selection",
      );

      map.fire("mousedown", makeMouseEvent(startPosition[0], startPosition[1]));
      map.fire(
        "mousemove",
        makeMouseEvent(endPosition[0], endPosition[1], { buttons: 1 }),
      );
      map.fire("mouseup", makeMouseEvent(endPosition[0], endPosition[1]));
      await afterNextRender();

      assertEquals(
        Draw.getSelectedPoints().features[0].geometry.coordinates,
        endPosition,
        "selection is accurate after dragging",
      );
      await cleanUp();
    },
  );

  document.body.removeChild(mapContainer);
});
