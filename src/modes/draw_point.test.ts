import { test, describe } from "vitest";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import { MapLibreDraw } from "../index.ts";
import { mouseClick } from "../../test/utils/mouse_click.ts";
import { touchTap } from "../../test/utils/touch_tap.ts";
import { createMap } from "../../test/utils/create_map.ts";
import { makeMouseEvent } from "../../test/utils/make_mouse_event.ts";
import { makeTouchEvent } from "../../test/utils/make_touch_event.ts";
import { DrawPoint } from "../modes/draw_point.ts";
import { PointFeat } from "../feature_types/point.ts";
import { createMockDrawModeContext } from "../../test/utils/create_mock_draw_mode_context.ts";
import { createMockLifecycleContext } from "../../test/utils/create_mock_lifecycle_context.ts";
import { enterEvent, escapeEvent } from "../../test/utils/key_events.ts";
import { objectToMode } from "../modes/object_to_mode.ts";
const drawPointMode = objectToMode(DrawPoint);

test("draw_point mode initialization", () => {
  const context = createMockDrawModeContext();
  const lifecycleContext = createMockLifecycleContext();
  const modeHandler = drawPointMode(context);
  modeHandler.start.call(lifecycleContext);

  assertEquals(context.store.add.callCount, 1, "store.add called");

  const emptypoint = new PointFeat(context, {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Point",
      coordinates: [],
    },
  });
  // Strip ids for this comparison
  assertEquals(
    Object.assign({}, context.store.add.getCall(0).args[0], { id: null }),
    Object.assign({}, emptypoint, { id: null }),
    "with a new line",
  );
});

test("draw_point start", () => {
  const context = createMockDrawModeContext();
  const lifecycleContext = createMockLifecycleContext();
  const modeHandler = drawPointMode(context);
  modeHandler.start.call(lifecycleContext);

  assertEquals(
    context.store.clearSelected.callCount,
    1,
    "store.clearSelected called",
  );
  assertEquals(
    context.ui.queueMapClasses.callCount,
    1,
    "ui.queueMapClasses called",
  );
  assertEquals(
    context.ui.queueMapClasses.getCall(0).args,
    [{ mouse: "add" }],
    "ui.queueMapClasses received correct arguments",
  );
  assertEquals(
    context.ui.setActiveButton.callCount,
    1,
    "ui.setActiveButton called",
  );
  assertEquals(
    context.ui.setActiveButton.getCall(0).args,
    ["point"],
    "ui.setActiveButton received correct arguments",
  );

  assertEquals(lifecycleContext.on.callCount, 12, "this.on called");
});

test("draw_point stop with point placed", () => {
  const context = createMockDrawModeContext();
  const modeHandler = drawPointMode(context);
  const lifecycleContext = createMockLifecycleContext();
  modeHandler.start.call(lifecycleContext);

  // Fake a placed point
  const id = context.store.getAllIds()[0];
  const point = context.store.get(id);
  point.updateCoordinate(10, 20);

  modeHandler.stop.call(lifecycleContext);
  assertEquals(
    context.ui.setActiveButton.callCount,
    2,
    "ui.setActiveButton called",
  );
  assertEquals(
    context.ui.setActiveButton.getCall(1).args,
    [undefined],
    "ui.setActiveButton received correct arguments",
  );
  assertEquals(context.store.delete.callCount, 0, "store.delete not called");
});

test("draw_point stop with no point placed", () => {
  const context = createMockDrawModeContext();
  const modeHandler = drawPointMode(context);
  const lifecycleContext = createMockLifecycleContext();
  modeHandler.start.call(lifecycleContext);

  const id = context.store.getAllIds()[0];
  const point = context.store.get(id);

  modeHandler.stop.call(lifecycleContext);

  assertEquals(
    context.ui.setActiveButton.callCount,
    2,
    "ui.setActiveButton called",
  );
  assertEquals(
    context.ui.setActiveButton.getCall(1).args,
    [undefined],
    "ui.setActiveButton received correct arguments",
  );
  assertEquals(context.store.delete.callCount, 1, "store.delete called");
  assertEquals(
    context.store.delete.getCall(0).args,
    [[point.id], { silent: true }],
    "store.delete received correct arguments",
  );
});

test("draw_point render the active point", () => {
  const context = createMockDrawModeContext();
  const modeHandler = drawPointMode(context);
  const lifecycleContext = createMockLifecycleContext();
  modeHandler.start.call(lifecycleContext);

  const id = context.store.getAllIds()[0];
  const point = context.store.get(id);

  const memo: any[] = [];
  const geojson = {
    type: "Feature",
    properties: {
      id: point.id,
    },
    geometry: {
      type: "Point",
      coordinates: [10, 10],
    },
  };
  modeHandler.render(geojson, (x) => memo.push(x));
  assertEquals(memo.length, 0, "active point does not render");
});

test("draw_point render an inactive feature", () => {
  const context = createMockDrawModeContext();
  const modeHandler = drawPointMode(context);
  const lifecycleContext = createMockLifecycleContext();
  modeHandler.start.call(lifecycleContext);

  const memo: any[] = [];
  const geojson = {
    type: "Feature",
    properties: {
      meta: "nothing",
    },
    geometry: {
      type: "LineString",
      coordinates: [
        [10, 10],
        [20, 20],
      ],
    },
  };
  modeHandler.render(geojson, (x) => memo.push(x));
  assertEquals(memo.length, 1, "does render");
  assertEquals(
    memo[0],
    {
      type: "Feature",
      properties: {
        active: "false",
        meta: "nothing",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [10, 10],
          [20, 20],
        ],
      },
    },
    "unaltered except active: false",
  );
});

describe("draw_point mouse interaction", async (t) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const map = createMap({ container });
  const Draw = new MapLibreDraw();
  map.addControl(Draw);

  await map.on("load");

  // The following sub-tests share state ...

  test("clicking", () => {
    Draw.deleteAll();
    Draw.changeMode("draw_point");
    mouseClick(map, makeMouseEvent(10, 20));

    const { features } = Draw.getAll();
    assertEquals(features.length, 1, "point created");
    const point = Draw.getAll().features[0];
    assertEquals(point.geometry.type, "Point");

    assertEquals(point.geometry.coordinates, [10, 20], "coordinate added");

    mouseClick(map, makeMouseEvent(30, 30));
    assertEquals(
      features.length,
      1,
      "mode has changed, so another click does not create another point",
    );
  });

  await test("exist before clicking by hitting Escape", () => {
    Draw.deleteAll();
    Draw.changeMode("draw_point");

    container.dispatchEvent(escapeEvent);

    assertEquals(Draw.getAll().features.length, 0, "no feature added");
    mouseClick(map, makeMouseEvent(30, 30));
    assertEquals(
      Draw.getAll().features.length,
      0,
      "mode has changed, so a click does not create another point",
    );
  });

  await test("exist before clicking by hitting Enter", () => {
    Draw.deleteAll();
    Draw.changeMode("draw_point");

    container.dispatchEvent(enterEvent);

    assertEquals(Draw.getAll().features.length, 0, "no feature added");
    mouseClick(map, makeMouseEvent(30, 30));
    assertEquals(
      Draw.getAll().features.length,
      0,
      "mode has changed, so a click does not create another point",
    );
  });

  test("exist before clicking with Trash", () => {
    Draw.deleteAll();
    Draw.changeMode("draw_point");

    Draw.trash();

    assertEquals(Draw.getAll().features.length, 0, "no feature added");
    mouseClick(map, makeMouseEvent(30, 30));
    assertEquals(
      Draw.getAll().features.length,
      0,
      "mode has changed, so a click does not create another point",
    );
  });

  document.body.removeChild(container);
});

describe("draw_point touch interaction", async (t) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const map = createMap({ container });
  const Draw = new MapLibreDraw();
  map.addControl(Draw);

  await map.on("load");
  // The following sub-tests share state ...

  test("tapping", () => {
    Draw.deleteAll();
    Draw.changeMode("draw_point");
    touchTap(map, makeTouchEvent(10, 20));

    const { features } = Draw.getAll();
    assertEquals(features.length, 1, "point created");
    const point = Draw.getAll().features[0];
    assertEquals(point.geometry.type, "Point");

    assertEquals(point.geometry.coordinates, [10, 20], "coordinate added");

    touchTap(map, makeTouchEvent(30, 30));
    assertEquals(
      features.length,
      1,
      "mode has changed, so another click does not create another point",
    );
  });

  document.body.removeChild(container);
});
