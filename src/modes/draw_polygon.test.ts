import { test, describe } from "vitest";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import { MapLibreDraw } from "../index.ts";
import { createMap } from "../../test/utils/create_map.ts";
import { mouseClick } from "../../test/utils/mouse_click.ts";
import { touchTap } from "../../test/utils/touch_tap.ts";
import { makeMouseEvent } from "../../test/utils/make_mouse_event.ts";
import { makeTouchEvent } from "../../test/utils/make_touch_event.ts";
import { DrawPolygon } from "./draw_polygon.ts";
import { PolygonFeat } from "../feature_types/polygon.ts";
import { createMockDrawModeContext } from "../../test/utils/create_mock_draw_mode_context.ts";
import { createMockLifecycleContext } from "../../test/utils/create_mock_lifecycle_context.ts";
import { setupAfterNextRender } from "../../test/utils/after_next_render.ts";
import { objectToMode } from "./object_to_mode.ts";
const drawPolygonMode = objectToMode(DrawPolygon);

import {
  enterEvent,
  escapeEvent,
  startLineStringEvent,
  startPointEvent,
  startPolygonEvent,
} from "../../test/utils/key_events.ts";

test("draw_polygon mode initialization", () => {
  const context = createMockDrawModeContext();
  const mode = drawPolygonMode(context);
  const lifecycleContext = createMockLifecycleContext();
  mode.start.call(lifecycleContext);

  assertEquals(context.store.add.callCount, 1, "store.add called");

  const emptyPolygon = new PolygonFeat(context, {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [[]],
    },
  });
  // Strip ids for this comparison
  assertEquals(
    Object.assign({}, context.store.add.getCall(0).args[0], { id: null }),
    Object.assign({}, emptyPolygon, { id: null }),
    "with a new polygon",
  );
});

test("draw_polygon start", async () => {
  const context = createMockDrawModeContext();
  const lifecycleContext = createMockLifecycleContext();
  const mode = drawPolygonMode(context);

  mode.start.call(lifecycleContext);
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
    ["polygon"],
    "ui.setActiveButton received correct arguments",
  );

  await new Promise((resolve) => setTimeout(resolve, 10));
  assertEquals(context.map.doubleClickZoom.disable.callCount, 1);
});

test("draw_polygon stop with valid polygon", () => {
  const context = createMockDrawModeContext();
  const mode = drawPolygonMode(context);
  const lifecycleContext = createMockLifecycleContext();
  mode.start.call(lifecycleContext);

  // Fake a valid polygon
  const testPolygon = context.store.get(context.store.getAllIds()[0]);
  testPolygon.isValid = () => true;

  mode.stop.call();
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

test("draw_polygon stop with invalid polygon", () => {
  const context = createMockDrawModeContext();
  const mode = drawPolygonMode(context);
  const lifecycleContext = createMockLifecycleContext();
  mode.start.call(lifecycleContext);

  // Fake an invalid polygon
  const testPolygon = context.store.get(context.store.getAllIds()[0]);
  testPolygon.isValid = () => false;

  mode.stop.call();
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
    [[testPolygon.id], { silent: true }],
    "store.delete received correct arguments",
  );
});

test("draw_polygon render active polygon with no coordinates", () => {
  const context = createMockDrawModeContext();
  const mode = drawPolygonMode(context);
  const lifecycleContext = createMockLifecycleContext();
  mode.start.call(lifecycleContext);
  const testPolygon = context.store.get(context.store.getAllIds()[0]);

  const memo: any[] = [];
  const geojson = {
    type: "Feature",
    properties: {
      id: testPolygon.id,
    },
    geometry: {
      type: "Polygon",
      coordinates: [],
    },
  };
  mode.render(geojson, (x) => memo.push(x));
  assertEquals(memo.length, 0, "does not render");
});

test("draw_polygon render active polygon with 1 coordinate (and closer)", () => {
  const context = createMockDrawModeContext();
  const mode = drawPolygonMode(context);
  const lifecycleContext = createMockLifecycleContext();
  mode.start.call(lifecycleContext);
  const testPolygon = context.store.get(context.store.getAllIds()[0]);

  const memo: any[] = [];
  const geojson = {
    type: "Feature",
    properties: {
      id: testPolygon.id,
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [10, 10],
          [10, 10],
        ],
      ],
    },
  };
  mode.render(geojson, (x) => memo.push(x));
  assertEquals(memo.length, 0, "does not render");
});

test("draw_polygon render active polygon with 2 coordinates (and closer)", () => {
  const context = createMockDrawModeContext();
  const mode = drawPolygonMode(context);
  const lifecycleContext = createMockLifecycleContext();
  mode.start.call(lifecycleContext);
  const testPolygon = context.store.get(context.store.getAllIds()[0]);

  const memo: any[] = [];
  const geojson = {
    type: "Feature",
    properties: {
      id: testPolygon.id,
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [0, 10],
          [0, 0],
        ],
      ],
    },
  };
  mode.render(geojson, (x) => memo.push(x));
  assertEquals(memo.length, 2, "does render");
  assertEquals(
    memo[1],
    {
      type: "Feature",
      properties: {
        id: testPolygon.id,
        active: "true",
        meta: "feature",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [0, 0],
          [0, 10],
        ],
      },
    },
    "renders as a LineString with meta: feature, active: true",
  );
});

test("draw_polygon render active polygon with 3 coordinates (and closer)", () => {
  const context = createMockDrawModeContext();
  const mode = drawPolygonMode(context);
  const lifecycleContext = createMockLifecycleContext();
  mode.start.call(lifecycleContext);
  const testPolygon = context.store.get(context.store.getAllIds()[0]);

  const memo: any[] = [];
  const geojson = {
    type: "Feature",
    properties: {
      id: testPolygon.id,
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [0, 10],
          [10, 10],
          [10, 0],
          [0, 0],
        ],
      ],
    },
  };
  mode.render(geojson, (x) => memo.push(x));
  assertEquals(memo.length, 3, "does render");
  assertEquals(
    memo[0],
    {
      type: "Feature",
      properties: {
        parent: testPolygon.id,
        meta: "vertex",
        coord_path: "0.0",
        active: "false",
      },
      geometry: {
        type: "Point",
        coordinates: [0, 0],
      },
    },
    "renders the start point point with meta: vertex",
  );
  assertEquals(
    memo[1],
    {
      type: "Feature",
      properties: {
        parent: testPolygon.id,
        meta: "vertex",
        coord_path: "0.2",
        active: "false",
      },
      geometry: {
        type: "Point",
        coordinates: [10, 10],
      },
    },
    "renders end point with meta: vertex",
  );
  assertEquals(
    memo[2],
    {
      type: "Feature",
      properties: {
        id: testPolygon.id,
        active: "true",
        meta: "feature",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [0, 10],
            [10, 10],
            [10, 0],
            [0, 0],
          ],
        ],
      },
    },
    "renders as a polygon with meta: feature, active: true",
  );
});

test("draw_polygon render inactive feature", () => {
  const context = createMockDrawModeContext();
  const mode = drawPolygonMode(context);
  const lifecycleContext = createMockLifecycleContext();
  mode.start.call(lifecycleContext);

  const memo: any[] = [];
  const geojson = {
    type: "Feature",
    properties: {
      meta: "meh",
    },
    geometry: {
      type: "LineString",
      coordinates: [
        [0, 0],
        [0, 10],
      ],
    },
  };
  mode.render(geojson, (x) => memo.push(x));
  assertEquals(memo.length, 1, "does render");
  assertEquals(
    memo[0],
    {
      type: "Feature",
      properties: {
        active: "false",
        meta: "meh",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [0, 0],
          [0, 10],
        ],
      },
    },
    "unaltered except active: false",
  );
});

describe("draw_polygon mouse interaction", async (t) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const map = createMap({ container });
  const Draw = new MapLibreDraw();
  map.addControl(Draw);

  await map.on("load");

  // The following sub-tests share state ...
  const afterNextRender = setupAfterNextRender(map);

  Draw.changeMode("draw_polygon");
  test("first click", () => {
    mouseClick(map, makeMouseEvent(10, 20));

    const { features } = Draw.getAll();
    assertEquals(features.length, 1, "polygon created");
    const polygon = Draw.getAll().features[0];
    assertEquals(polygon.geometry.type, "Polygon");

    assertEquals(
      polygon.geometry.coordinates,
      [
        [
          [10, 20],
          [10, 20],
          [10, 20],
        ],
      ],
      "starting coordinate added",
    );
  });

  await test("move mouse", () => {
    map.fire("mousemove", makeMouseEvent(15, 23));
    const polygon = Draw.getAll().features[0];
    assertEquals(
      polygon.geometry.coordinates,
      [
        [
          [10, 20],
          [15, 23],
          [10, 20],
        ],
      ],
      "middle coordinate added",
    );
  });

  await test("move mouse again", () => {
    map.fire("mousemove", makeMouseEvent(30, 33));
    const polygon = Draw.getAll().features[0];
    assertEquals(
      polygon.geometry.coordinates,
      [
        [
          [10, 20],
          [30, 33],
          [10, 20],
        ],
      ],
      "middle coordinate replaced",
    );
  });

  await test("click to add another vertex", () => {
    mouseClick(map, makeMouseEvent(35, 35));
    const polygon = Draw.getAll().features[0];
    assertEquals(
      polygon.geometry.coordinates,
      [
        [
          [10, 20],
          [35, 35],
          [35, 35],
          [10, 20],
        ],
      ],
      "middle coordinate replaced",
    );
  });

  test("add more points then click on the last vertex to finish", () => {
    mouseClick(map, makeMouseEvent(40, 40));
    mouseClick(map, makeMouseEvent(50, 50));
    mouseClick(map, makeMouseEvent(55, 55));
    mouseClick(map, makeMouseEvent(55, 55));
    const polygon = Draw.getAll().features[0];
    assertEquals(
      polygon.geometry.coordinates,
      [
        [
          [10, 20],
          [35, 35],
          [40, 40],
          [50, 50],
          [55, 55],
          [10, 20],
        ],
      ],
      "all coordinates in place",
    );

    mouseClick(map, makeMouseEvent(40, 40));
    assertEquals(
      polygon.geometry.coordinates,
      [
        [
          [10, 20],
          [35, 35],
          [40, 40],
          [50, 50],
          [55, 55],
          [10, 20],
        ],
      ],
      "since we exited draw_polygon mode, another click does not add a coordinate",
    );
  });

  await test("start a polygon but trash it before completion", () => {
    // Start a new polygon
    Draw.deleteAll();
    Draw.changeMode("draw_polygon");
    mouseClick(map, makeMouseEvent(1, 1));
    mouseClick(map, makeMouseEvent(2, 2));
    mouseClick(map, makeMouseEvent(3, 3));

    const polygon = Draw.getAll().features[0];
    assertEquals(polygon.geometry.coordinates, [
      [
        [1, 1],
        [2, 2],
        [3, 3],
        [3, 3],
        [1, 1],
      ],
    ]);

    Draw.trash();
    assertEquals(Draw.getAll().features.length, 0, "no feature added");

    mouseClick(map, makeMouseEvent(1, 1));
    assertEquals(Draw.getAll().features.length, 0, "no longer drawing");
  });

  await test(
    "start a polygon but trash it with Escape before completion",
    () => {
      // Start a new polygon
      Draw.deleteAll();
      Draw.changeMode("draw_polygon");
      mouseClick(map, makeMouseEvent(1, 1));
      mouseClick(map, makeMouseEvent(2, 2));
      mouseClick(map, makeMouseEvent(3, 3));

      const polygon = Draw.getAll().features[0];
      assertEquals(polygon.geometry.coordinates, [
        [
          [1, 1],
          [2, 2],
          [3, 3],
          [3, 3],
          [1, 1],
        ],
      ]);

      container.dispatchEvent(escapeEvent);

      assertEquals(Draw.getAll().features.length, 0, "no feature added");

      mouseClick(map, makeMouseEvent(1, 1));
      assertEquals(Draw.getAll().features.length, 0, "no longer drawing");
    },
  );

  // ZERO CLICK TESTS

  await test("start a polygon and end it with Enter", () => {
    // Start a new polygon
    Draw.deleteAll();
    Draw.changeMode("draw_polygon");
    mouseClick(map, makeMouseEvent(1, 1));
    mouseClick(map, makeMouseEvent(2, 2));
    mouseClick(map, makeMouseEvent(3, 3));

    const polygon = Draw.getAll().features[0];
    assertEquals(polygon.geometry.coordinates, [
      [
        [1, 1],
        [2, 2],
        [3, 3],
        [3, 3],
        [1, 1],
      ],
    ]);

    container.dispatchEvent(enterEvent);

    assertEquals(Draw.getAll().features.length, 1, "the feature was added");
    assertEquals(
      Draw.getAll().features[0].geometry.coordinates,
      [
        [
          [1, 1],
          [2, 2],
          [3, 3],
          [1, 1],
        ],
      ],
      "the polygon is correct",
    );

    mouseClick(map, makeMouseEvent(1, 1));
    assertEquals(Draw.getAll().features.length, 1, "no longer drawing");
  });

  await test("start draw_polygon mode then changemode before a click", () => {
    Draw.deleteAll();
    assertEquals(Draw.getAll().features.length, 0, "no features yet");

    Draw.changeMode("draw_polygon");
    assertEquals(Draw.getAll().features.length, 1, "polygon is added");
    const polygon = Draw.getAll().features[0];
    assertEquals(polygon.geometry.type, "Polygon");

    Draw.changeMode("simple_select");
    assertEquals(Draw.getAll().features.length, 0, "polygon is removed");
  });

  // ONE CLICK TESTS

  await test("start draw_polygon mode then enter after one click", () => {
    Draw.deleteAll();
    assertEquals(Draw.getAll().features.length, 0, "no features yet");

    Draw.changeMode("draw_polygon");
    assertEquals(Draw.getAll().features.length, 1, "polygon is added");
    mouseClick(map, makeMouseEvent(1, 1));
    map.fire("mousemove", makeMouseEvent(16, 16));

    const polygon = Draw.getAll().features[0];
    assertEquals(
      polygon.geometry.coordinates,
      [
        [
          [1, 1],
          [16, 16],
          [1, 1],
        ],
      ],
      "and has right coordinates",
    );

    container.dispatchEvent(enterEvent);
    assertEquals(Draw.getAll().features.length, 0, "polygon was removed");
  });

  await test(
    "start draw_polygon mode then start a point after one click",
    () => {
      Draw.deleteAll();
      assertEquals(Draw.getAll().features.length, 0, "no features yet");

      Draw.changeMode("draw_polygon");
      assertEquals(Draw.getAll().features.length, 1, "polygon is added");
      mouseClick(map, makeMouseEvent(1, 1));
      map.fire("mousemove", makeMouseEvent(16, 16));

      const polygon = Draw.getAll().features[0];
      assertEquals(
        polygon.geometry.coordinates,
        [
          [
            [1, 1],
            [16, 16],
            [1, 1],
          ],
        ],
        "and has right coordinates",
      );

      container.dispatchEvent(startPointEvent);
      assertEquals(Draw.get(polygon.id), undefined, "polygon was removed");
    },
  );

  await test(
    "start draw_polygon mode then start a line_string after one click",
    () => {
      Draw.deleteAll();
      assertEquals(Draw.getAll().features.length, 0, "no features yet");

      Draw.changeMode("draw_polygon");
      assertEquals(Draw.getAll().features.length, 1, "polygon is added");
      mouseClick(map, makeMouseEvent(1, 1));
      map.fire("mousemove", makeMouseEvent(16, 16));

      const polygon = Draw.getAll().features[0];
      assertEquals(
        polygon.geometry.coordinates,
        [
          [
            [1, 1],
            [16, 16],
            [1, 1],
          ],
        ],
        "and has right coordinates",
      );

      container.dispatchEvent(startLineStringEvent);
      assertEquals(Draw.get(polygon.id), undefined, "polygon was removed");
    },
  );

  await test(
    "start draw_polygon mode then start a new polygon after one click",
    () => {
      Draw.deleteAll();
      assertEquals(Draw.getAll().features.length, 0, "no features yet");

      Draw.changeMode("draw_polygon");
      assertEquals(Draw.getAll().features.length, 1, "polygon is added");
      mouseClick(map, makeMouseEvent(1, 1));
      map.fire("mousemove", makeMouseEvent(16, 16));

      const polygon = Draw.getAll().features[0];
      assertEquals(
        polygon.geometry.coordinates,
        [
          [
            [1, 1],
            [16, 16],
            [1, 1],
          ],
        ],
        "and has right coordinates",
      );

      container.dispatchEvent(startPolygonEvent);
      assertEquals(Draw.get(polygon.id), undefined, "polygon was removed");
    },
  );

  await test("start draw_polygon mode then doubleclick", () => {
    Draw.deleteAll();
    assertEquals(Draw.getAll().features.length, 0, "no features yet");

    Draw.changeMode("draw_polygon");
    assertEquals(Draw.getAll().features.length, 1, "polygon is added");
    mouseClick(map, makeMouseEvent(1, 1));
    mouseClick(map, makeMouseEvent(1, 1));

    assertEquals(Draw.getAll().features.length, 0, "polygon was removed");
  });

  // TWO CLICK TESTS

  test("start draw_polygon mode then enter after two clicks", () => {
    Draw.deleteAll();
    assertEquals(Draw.getAll().features.length, 0, "no features yet");

    Draw.changeMode("draw_polygon");
    assertEquals(Draw.getAll().features.length, 1, "polygon is added");
    mouseClick(map, makeMouseEvent(1, 1));
    mouseClick(map, makeMouseEvent(16, 16));
    map.fire("mousemove", makeMouseEvent(8, 0));

    const polygon = Draw.getAll().features[0];
    assertEquals(
      polygon.geometry.coordinates,
      [
        [
          [1, 1],
          [16, 16],
          [8, 0],
          [1, 1],
        ],
      ],
      "and has right coordinates",
    );

    container.dispatchEvent(enterEvent);
    assertEquals(Draw.getAll().features.length, 0, "polygon was removed");
  });

  await test(
    "start draw_polygon mode then start a point after two clicks",
    () => {
      Draw.deleteAll();
      assertEquals(Draw.getAll().features.length, 0, "no features yet");

      Draw.changeMode("draw_polygon");
      assertEquals(Draw.getAll().features.length, 1, "polygon is added");
      mouseClick(map, makeMouseEvent(1, 1));
      mouseClick(map, makeMouseEvent(16, 16));
      map.fire("mousemove", makeMouseEvent(8, 0));

      const polygon = Draw.getAll().features[0];
      assertEquals(
        polygon.geometry.coordinates,
        [
          [
            [1, 1],
            [16, 16],
            [8, 0],
            [1, 1],
          ],
        ],
        "and has right coordinates",
      );

      container.dispatchEvent(startPointEvent);
      assertEquals(Draw.get(polygon.id), undefined, "polygon was removed");
    },
  );

  await test(
    "start draw_polygon mode then start a line_string after two clicks",
    () => {
      Draw.deleteAll();
      assertEquals(Draw.getAll().features.length, 0, "no features yet");

      Draw.changeMode("draw_polygon");
      assertEquals(Draw.getAll().features.length, 1, "polygon is added");
      mouseClick(map, makeMouseEvent(1, 1));
      mouseClick(map, makeMouseEvent(16, 16));
      map.fire("mousemove", makeMouseEvent(8, 0));

      const polygon = Draw.getAll().features[0];
      assertEquals(
        polygon.geometry.coordinates,
        [
          [
            [1, 1],
            [16, 16],
            [8, 0],
            [1, 1],
          ],
        ],
        "and has right coordinates",
      );

      container.dispatchEvent(startLineStringEvent);
      assertEquals(Draw.get(polygon.id), undefined, "polygon was removed");
    },
  );

  await test(
    "start draw_polygon mode then start a new polygon after two clicks",
    () => {
      Draw.deleteAll();
      assertEquals(Draw.getAll().features.length, 0, "no features yet");

      Draw.changeMode("draw_polygon");
      assertEquals(Draw.getAll().features.length, 1, "polygon is added");
      mouseClick(map, makeMouseEvent(1, 1));
      mouseClick(map, makeMouseEvent(16, 16));
      map.fire("mousemove", makeMouseEvent(8, 0));

      const polygon = Draw.getAll().features[0];
      assertEquals(
        polygon.geometry.coordinates,
        [
          [
            [1, 1],
            [16, 16],
            [8, 0],
            [1, 1],
          ],
        ],
        "and has right coordinates",
      );

      container.dispatchEvent(startPolygonEvent);
      assertEquals(Draw.get(polygon.id), undefined, "polygon was removed");
    },
  );

  test("start draw_polygon mode then doubleclick", () => {
    Draw.deleteAll();
    assertEquals(Draw.getAll().features.length, 0, "no features yet");

    Draw.changeMode("draw_polygon");
    assertEquals(Draw.getAll().features.length, 1, "polygon is added");
    mouseClick(map, makeMouseEvent(1, 1));
    mouseClick(map, makeMouseEvent(16, 16));
    mouseClick(map, makeMouseEvent(16, 16));

    assertEquals(Draw.getAll().features.length, 0, "polygon was removed");
  });

  // FIVE CLICK TEST

  await test(
    "end draw_polygon mode by clicking on the start point",
    async () => {
      Draw.deleteAll();
      assertEquals(Draw.getAll().features.length, 0, "no features yet");
      Draw.changeMode("draw_polygon");
      let polygon = Draw.getAll().features[0];
      assertEquals(polygon !== undefined, true, "polygon is added");
      mouseClick(map, makeMouseEvent(0, 0));
      mouseClick(map, makeMouseEvent(20, 0));
      mouseClick(map, makeMouseEvent(20, 20));
      mouseClick(map, makeMouseEvent(0, 20));

      await afterNextRender();

      map.fire("mousemove", makeMouseEvent(0, 0));
      mouseClick(map, makeMouseEvent(0, 0));

      polygon = Draw.get(polygon.id);
      assertEquals(
        polygon.geometry.coordinates,
        [
          [
            [0, 0],
            [20, 0],
            [20, 20],
            [0, 20],
            [0, 0],
          ],
        ],
        "and has right coordinates",
      );
      Draw.deleteAll();
    },
  );

  document.body.removeChild(container);
});

describe("draw_polygon touch interaction", async (t) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const map = createMap({ container });
  const Draw = new MapLibreDraw();
  map.addControl(Draw);

  await map.on("load");

  // The following sub-tests share state ...

  Draw.changeMode("draw_polygon");
  test("first tap", () => {
    touchTap(map, makeTouchEvent(100, 200));

    const { features } = Draw.getAll();
    assertEquals(features.length, 1, "polygon created");
    const polygon = Draw.getAll().features[0];
    assertEquals(polygon.geometry.type, "Polygon");

    assertEquals(
      polygon.geometry.coordinates,
      [
        [
          [100, 200],
          [100, 200],
          [100, 200],
        ],
      ],
      "starting coordinate added",
    );
  });

  await test("tap to add another vertex", () => {
    touchTap(map, makeTouchEvent(135, 135));
    const polygon = Draw.getAll().features[0];
    assertEquals(
      polygon.geometry.coordinates,
      [
        [
          [100, 200],
          [135, 135],
          [135, 135],
          [100, 200],
        ],
      ],
      "middle coordinate replaced",
    );
  });

  await test("add more points then tap on the last vertex to finish", () => {
    touchTap(map, makeTouchEvent(400, 400));
    touchTap(map, makeTouchEvent(500, 500));
    touchTap(map, makeTouchEvent(550, 550));
    touchTap(map, makeTouchEvent(550, 550));
    const polygon = Draw.getAll().features[0];
    assertEquals(
      polygon.geometry.coordinates,
      [
        [
          [100, 200],
          [135, 135],
          [400, 400],
          [500, 500],
          [550, 550],
          [100, 200],
        ],
      ],
      "all coordinates in place",
    );

    touchTap(map, makeTouchEvent(400, 400));
    assertEquals(
      polygon.geometry.coordinates,
      [
        [
          [100, 200],
          [135, 135],
          [400, 400],
          [500, 500],
          [550, 550],
          [100, 200],
        ],
      ],
      "since we exited draw_polygon mode, another tap does not add a coordinate",
    );
  });

  await test("start a polygon but trash it before completion", () => {
    // Start a new polygon
    Draw.deleteAll();
    Draw.changeMode("draw_polygon");
    touchTap(map, makeTouchEvent(100, 100));
    touchTap(map, makeTouchEvent(200, 200));
    touchTap(map, makeTouchEvent(300, 300));

    const polygon = Draw.getAll().features[0];
    assertEquals(polygon.geometry.coordinates, [
      [
        [100, 100],
        [200, 200],
        [300, 300],
        [300, 300],
        [100, 100],
      ],
    ]);

    Draw.trash();
    assertEquals(Draw.getAll().features.length, 0, "no feature added");

    touchTap(map, makeTouchEvent(1, 1));
    assertEquals(Draw.getAll().features.length, 0, "no longer drawing");
  });

  document.body.removeChild(container);
});
