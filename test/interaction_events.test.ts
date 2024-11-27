// These tests ensure that user interactions fire the right events

import test from "node:test";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import { spy } from "sinon";
import { MapLibreDraw } from "../src/index.ts";
import { mouseClick } from "./utils/mouse_click.ts";
import { createMap } from "./utils/create_map.ts";
import { setupAfterNextRender } from "./utils/after_next_render.ts";
import { makeMouseEvent } from "./utils/make_mouse_event.ts";

import { backspaceEvent, enterEvent, escapeEvent } from "./utils/key_events.ts";

test("ensure user interactions fire right events", async (t) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const map = createMap({ container });
  const fireSpy = spy(map, "fire");
  const afterNextRender = setupAfterNextRender(map);
  const Draw = new MapLibreDraw();
  const onAdd = Draw.onAdd.bind(Draw);
  let controlGroup = null;

  Draw.onAdd = function (m) {
    controlGroup = onAdd(m);
    return controlGroup;
  };

  map.addControl(Draw);

  await map.on("load");

  document.body.removeChild(container);

  function flushDrawEvents() {
    const drawEvents: any[] = [];
    for (let i = 0; i < fireSpy.callCount; i++) {
      const eventName = fireSpy.getCall(i).args[0];
      if (typeof eventName !== "string" || eventName.indexOf("draw.") !== 0) {
        continue;
      }
      // Ignore draw.render events for now
      if (eventName === "draw.render") continue;
      // Ignore draw.actionable events for now
      if (eventName === "draw.actionable") continue;
      drawEvents.push(eventName);
    }
    fireSpy.resetHistory();
    return drawEvents;
  }

  function getEventCall(eventName) {
    for (let i = 0; i < fireSpy.callCount; i++) {
      const call = fireSpy.getCall(i);
      if (call.args[0] === eventName) return call;
    }
  }

  function firedWith(eventName, expectedEventData) {
    const call = getEventCall(eventName);
    if (!call) {
      assert.fail(`${eventName} never called`);
      return {};
    }
    assert(`${eventName} called`);
    const actualEventData = Object.assign({}, call.args[1]);

    if (actualEventData.features) {
      actualEventData.features = actualEventData.features.map(withoutId);
    }
    assertEquals(actualEventData, expectedEventData, "with correct data");
    return call.args[1];
  }

  function withoutId(obj) {
    const clone = Object.assign({}, obj);
    delete clone.id;
    return clone;
  }

  function repeat(count, fn) {
    for (let i = 1; i <= count; i++) {
      fn(i);
    }
  }

  const pointButton = controlGroup.getElementsByClassName(
    "maplibre-gl-draw_point",
  )[0];
  const lineButton = controlGroup.getElementsByClassName(
    "maplibre-gl-draw_line",
  )[0];
  const trashButton = controlGroup.getElementsByClassName(
    "maplibre-gl-draw_trash",
  )[0];
  const polygonButton = controlGroup.getElementsByClassName(
    "maplibre-gl-draw_polygon",
  )[0];

  // The sequence of these tests matters: each uses state established
  // in the prior tests. These variables keep track of bits of that state.

  await t.test("enter draw_point mode", () => {
    fireSpy.resetHistory();

    // Click the line button
    pointButton.click();
    firedWith("draw.modechange", {
      mode: "draw_point",
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.modechange"],
      "no unexpected draw events",
    );
  });

  const pointA = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Point",
      coordinates: [25, 25],
    },
  };

  await t.test("create a point", async () => {
    // Now in `draw_point` mode ...
    // Move around, then click to create the point
    map.fire("mousemove", makeMouseEvent(10, 10));
    map.fire("mousemove", makeMouseEvent(20, 20));
    mouseClick(map, makeMouseEvent(25, 25));
    await afterNextRender();

    firedWith("draw.create", {
      features: [pointA],
    });

    firedWith("draw.modechange", {
      mode: "simple_select",
    });

    firedWith("draw.selectionchange", {
      features: [pointA],
      points: [],
    });

    assertEquals(
      flushDrawEvents(),
      ["draw.create", "draw.modechange", "draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  await t.test("deselect that point", async () => {
    // Now in `simple_select` mode ...
    // Move around, then click away from the selected point
    map.fire("mousemove", makeMouseEvent(10, 10));
    map.fire("mousemove", makeMouseEvent(20, 20));
    mouseClick(map, makeMouseEvent(5, 5));
    await afterNextRender();
    firedWith("draw.selectionchange", {
      features: [],
      points: [],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  await t.test("re-select that point", async () => {
    // Now in `simple_select` mode ...
    // Move around, then click the existing point
    map.fire("mousemove", makeMouseEvent(10, 10));
    map.fire("mousemove", makeMouseEvent(20, 20));
    mouseClick(map, makeMouseEvent(25, 25));
    await afterNextRender();
    firedWith("draw.selectionchange", {
      features: [pointA],
      points: [],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  const pointB = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Point",
      coordinates: [35, 15],
    },
  };

  await t.test("drag that point", async () => {
    // Now in `simple_select` mode ...
    map.fire("mousedown", makeMouseEvent(25, 25));
    repeat(10, (i) => {
      map.fire("mousemove", makeMouseEvent(25 + i, 25 - i, { buttons: 1 }));
    });
    map.fire("mouseup", makeMouseEvent(35, 10));
    await afterNextRender();
    firedWith("draw.update", {
      action: "move",
      features: [pointB],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.update"],
      "no unexpected draw events",
    );
  });

  await t.test("delete that point with the Trash button", async () => {
    // Now in `simple_select` mode ...
    trashButton.click();
    await afterNextRender();
    firedWith("draw.delete", {
      features: [pointB],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.delete"],
      "no unexpected draw events",
    );
  });

  await t.test("enter draw_line_string mode", () => {
    // Click the line button
    lineButton.click();
    firedWith("draw.modechange", {
      mode: "draw_line_string",
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.modechange"],
      "no unexpected draw events",
    );
  });

  const lineA = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [
        [10, 10],
        [30, 30],
        [50, 50],
      ],
    },
  };

  await t.test("create a line", async () => {
    // Now in `draw_line_string` mode...
    // Move around, then click and move to create the line
    map.fire("mousemove", makeMouseEvent(10, 10));
    map.fire("mousemove", makeMouseEvent(20, 20));
    mouseClick(map, makeMouseEvent(10, 10));
    repeat(20, (i) => {
      map.fire("mousemove", makeMouseEvent(10 + i, 10 + i));
    });
    mouseClick(map, makeMouseEvent(30, 30));
    repeat(20, (i) => {
      map.fire("mousemove", makeMouseEvent(30 + i, 30 + i));
    });
    mouseClick(map, makeMouseEvent(50, 50));
    mouseClick(map, makeMouseEvent(50, 50));

    await afterNextRender();

    firedWith("draw.create", {
      features: [lineA],
    });

    firedWith("draw.modechange", {
      mode: "simple_select",
    });

    firedWith("draw.selectionchange", {
      features: [lineA],
      points: [],
    });

    assertEquals(
      flushDrawEvents(),
      ["draw.create", "draw.modechange", "draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  await t.test("deselect that line", async () => {
    // Now in `simple_select` mode ...
    mouseClick(map, makeMouseEvent(5, 5));
    await afterNextRender();
    firedWith("draw.selectionchange", {
      features: [],
      points: [],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  await t.test("re-select that line", async () => {
    // Now in `simple_select` mode ...
    // Click somewhere on the line
    mouseClick(map, makeMouseEvent(30, 30));
    await afterNextRender();
    firedWith("draw.selectionchange", {
      features: [lineA],
      points: [],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  const lineB = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [
        [20, 0],
        [40, 20],
        [60, 40],
      ],
    },
  };

  await t.test("move the line", async () => {
    // Now in `simple_select` mode ...
    // Mousedown anywhere on the line, not vertex
    map.fire("mousedown", makeMouseEvent(20, 20));
    // Drag it a little bit
    repeat(10, (i) => {
      map.fire("mousemove", makeMouseEvent(20 + i, 20 - i, { buttons: 1 }));
    });
    // Release the mouse
    map.fire("mouseup", makeMouseEvent(40, 0));

    await afterNextRender();

    firedWith("draw.update", {
      action: "move",
      features: [lineB],
    });

    assertEquals(
      flushDrawEvents(),
      ["draw.update"],
      "no unexpected draw events",
    );
  });

  await t.test("select a vertex", async () => {
    // Now in `simple_select` mode ...
    // Click a vertex
    mouseClick(map, makeMouseEvent(40, 20));

    await afterNextRender();

    firedWith("draw.modechange", {
      mode: "direct_select",
    });

    firedWith("draw.selectionchange", {
      features: [lineB],
      points: [
        {
          geometry: {
            coordinates: [40, 20],
            type: "Point",
          },
          properties: {},
          type: "Feature",
        },
      ],
    });

    assertEquals(
      flushDrawEvents(),
      ["draw.modechange", "draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  const lineC = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [
        [20, 0],
        [62, 42],
        [60, 40],
      ],
    },
  };

  await t.test("move the vertex", async () => {
    // Now in `direct_select` mode ...
    // Click the vertex again
    map.fire("mousedown", makeMouseEvent(40, 20));
    // Drag it a little bit
    repeat(22, (i) => {
      map.fire("mousemove", makeMouseEvent(40 + i, 20 + i, { buttons: 1 }));
    });
    // Release the mouse
    map.fire("mouseup", makeMouseEvent(60, 40));

    await afterNextRender();

    firedWith("draw.update", {
      action: "change_coordinates",
      features: [lineC],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.update", "draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  const lineD = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [
        [20, 0],
        [41, 21],
        [62, 42],
        [60, 40],
      ],
    },
  };

  await t.test("add another vertex", async () => {
    // Now in `direct_select` mode ...
    // Click a midpoint of lineC
    mouseClick(map, makeMouseEvent(41, 21));
    await afterNextRender();
    firedWith("draw.update", {
      action: "change_coordinates",
      features: [lineD],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.update"],
      "no unexpected draw events",
    );
  });

  const lineE = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [
        [20, 0],
        [62, 42],
        [60, 40],
      ],
    },
  };

  await t.test("delete a vertex with Backspace", async () => {
    // Now in `direct_select` mode ...
    // Click a vertex
    mouseClick(map, makeMouseEvent(41, 21));
    container.dispatchEvent(backspaceEvent);
    await afterNextRender();
    firedWith("draw.update", {
      action: "change_coordinates",
      features: [lineE],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.update", "draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  // Leaving that line in place while moving on to
  // mess with polygons

  await t.test("enter draw_polygon mode", async () => {
    // Click the polygon button
    polygonButton.click();

    await afterNextRender();

    firedWith("draw.modechange", {
      mode: "draw_polygon",
    });

    firedWith("draw.selectionchange", {
      features: [],
      points: [],
    });

    assertEquals(
      flushDrawEvents(),
      ["draw.modechange", "draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  const polygonA = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [0, 30],
          [30, 30],
          [30, 0],
          [0, 0],
        ],
      ],
    },
  };

  await t.test("create a polygon", async () => {
    // Now in `draw_polygon` mode ...
    mouseClick(map, makeMouseEvent(0, 0));
    repeat(20, (i) => {
      map.fire("mousemove", makeMouseEvent(0, 0 + i));
    });
    mouseClick(map, makeMouseEvent(0, 30));
    repeat(20, (i) => {
      map.fire("mousemove", makeMouseEvent(0 + i, 30));
    });
    mouseClick(map, makeMouseEvent(30, 30));
    repeat(20, (i) => {
      map.fire("mousemove", makeMouseEvent(30, 30 - i));
    });
    mouseClick(map, makeMouseEvent(30, 0));
    mouseClick(map, makeMouseEvent(30, 0));

    await afterNextRender();

    firedWith("draw.create", {
      features: [polygonA],
    });

    firedWith("draw.modechange", {
      mode: "simple_select",
    });

    firedWith("draw.selectionchange", {
      features: [polygonA],
      points: [],
    });

    assertEquals(
      flushDrawEvents(),
      ["draw.create", "draw.modechange", "draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  await t.test("deselect the polygon", async () => {
    // Now in `simple_select` mode ...
    mouseClick(map, makeMouseEvent(-10, -10));

    await afterNextRender();

    firedWith("draw.selectionchange", {
      features: [],
      points: [],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  await t.test("box-select the line and the polygon", async () => {
    // Now in `simple_select` mode ...
    // Mouse down with the shift key
    map.fire("mousedown", makeMouseEvent(200, 200, { shiftKey: true }));
    repeat(20, (i) => {
      map.fire(
        "mousemove",
        makeMouseEvent(200 - 10 * i, 200 - 10 * i, { buttons: 1 }),
      );
    });
    map.fire("mouseup", makeMouseEvent(0, 0));

    await afterNextRender();

    firedWith("draw.selectionchange", {
      features: [lineE, polygonA],
      points: [],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  const lineF = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [
        [40, -20],
        [82, 22],
        [80, 20],
      ],
    },
  };

  const polygonB = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [20, -20],
          [20, 10],
          [50, 10],
          [50, -20],
          [20, -20],
        ],
      ],
    },
  };

  await t.test("move the line and the polygon", async () => {
    // Now in `simple_select` mode ...
    // Mousedown anywhere on either feature, not a vertex
    map.fire("mousedown", makeMouseEvent(0, 15));
    // Drag it a little bit
    repeat(20, (i) => {
      map.fire("mousemove", makeMouseEvent(0 + i, 15 - i, { buttons: 1 }));
    });
    // Release the mouse
    map.fire("mouseup", makeMouseEvent(20, -5));

    await afterNextRender();

    firedWith("draw.update", {
      action: "move",
      features: [lineF, polygonB],
    });

    assertEquals(
      flushDrawEvents(),
      ["draw.update"],
      "no unexpected draw events",
    );
  });

  await t.test("deselect both", async () => {
    // Now in `simple_select` mode ...
    mouseClick(map, makeMouseEvent(-10, -10));

    await afterNextRender();

    firedWith("draw.selectionchange", {
      features: [],
      points: [],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  await t.test("select the polygon", async () => {
    // Now in `simple_select` mode ...
    mouseClick(map, makeMouseEvent(48, 0));

    await afterNextRender();

    firedWith("draw.selectionchange", {
      features: [polygonB],
      points: [],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  await t.test("select a vertex", async () => {
    // Now in `simple_select` mode ...
    mouseClick(map, makeMouseEvent(20, -20));

    await afterNextRender();

    firedWith("draw.modechange", {
      mode: "direct_select",
    });

    firedWith("draw.selectionchange", {
      features: [polygonB],
      points: [
        {
          geometry: {
            coordinates: [20, -20],
            type: "Point",
          },
          properties: {},
          type: "Feature",
        },
      ],
    });

    assertEquals(
      flushDrawEvents(),
      ["draw.modechange", "draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  await t.test("add another vertex to the selection", async () => {
    // Now in `simple_select` mode ...
    mouseClick(map, makeMouseEvent(20, 10, { shiftKey: true }));
    await afterNextRender();
    assertEquals(
      flushDrawEvents(),
      ["draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  const polygonC = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [0, -20],
          [0, 10],
          [50, 10],
          [50, -20],
          [0, -20],
        ],
      ],
    },
  };

  await t.test("move the vertices", async () => {
    // Now in `direct_select` mode ...
    // Click a vertex again
    map.fire("mousedown", makeMouseEvent(20, 10));
    // Drag it a little bit
    repeat(20, (i) => {
      map.fire("mousemove", makeMouseEvent(20 - i, 10, { buttons: 1 }));
    });
    // Release the mouse
    map.fire("mouseup", makeMouseEvent(0, 10));

    await afterNextRender();

    firedWith("draw.update", {
      action: "change_coordinates",
      features: [polygonC],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.update", "draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  const polygonD = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [0, -20],
          [0, 10],
          [25, 10],
          [50, 10],
          [50, -20],
          [0, -20],
        ],
      ],
    },
  };

  await t.test("add another vertex", async () => {
    // Now in `direct_select` mode ...
    // Click a midpoint
    mouseClick(map, makeMouseEvent(25, 10));

    await afterNextRender();

    firedWith("draw.update", {
      action: "change_coordinates",
      features: [polygonD],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.update"],
      "no unexpected draw events",
    );
  });

  const polygonE = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [0, 10],
          [50, 10],
          [50, -20],
          [0, 10],
        ],
      ],
    },
  };

  await t.test(
    "select then delete two vertices with Draw.trash()",
    async () => {
      // Now in `direct_select` mode ...
      mouseClick(map, makeMouseEvent(0, -20));
      mouseClick(map, makeMouseEvent(25, 10, { shiftKey: true }));
      Draw.trash();

      await afterNextRender();

      firedWith("draw.update", {
        action: "change_coordinates",
        features: [polygonE],
      });
      assertEquals(
        flushDrawEvents(),
        ["draw.update", "draw.selectionchange"],
        "no unexpected draw events",
      );
    },
  );

  await t.test("select the polygon", async () => {
    // Deselect everything
    mouseClick(map, makeMouseEvent(-200, -200));

    await afterNextRender();

    flushDrawEvents();
    // Now in `simple_select` mode ...
    // Click the polygon
    mouseClick(map, makeMouseEvent(50, 10));

    await afterNextRender();

    firedWith("draw.selectionchange", {
      features: [polygonE],
      points: [],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  await t.test("add the line to the selection", async () => {
    // Now in `simple_select` mode ...
    // shift-click to add to selection
    mouseClick(map, makeMouseEvent(82, 22, { shiftKey: true }));

    await afterNextRender();

    firedWith("draw.selectionchange", {
      features: [polygonE, lineF],
      points: [],
    });
    assertEquals(
      flushDrawEvents(),
      ["draw.selectionchange"],
      "no unexpected draw events",
    );
  });

  // Below are tests to ensure that API usage to modify data does not
  // trigger events, only user interactions
  await t.test("API usage does not trigger events", async () => {
    Draw.deleteAll();
    Draw.add({
      type: "Feature",
      id: "point",
      properties: {},
      geometry: {
        type: "Point",
        coordinates: [10, 10],
      },
    });
    Draw.add({
      type: "Feature",
      id: "line",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [10, 10],
          [20, 20],
        ],
      },
    });
    Draw.changeMode("draw_point");
    Draw.changeMode("draw_line_string");
    Draw.changeMode("draw_polygon");
    Draw.changeMode("simple_select");
    Draw.delete("point");

    await afterNextRender();
    assertEquals(flushDrawEvents(), [], "no unexpected draw events");
  });

  await t.test(
    "except when the API function does not directly correspond to the event",
    async () => {
      const line = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [10, 10],
            [20, 20],
            [30, 30],
          ],
        },
      };
      const lineId = Draw.add(line)[0];
      Draw.changeMode("simple_select", {
        featureIds: [lineId],
      });
      await afterNextRender();
      Draw.trash();
      await afterNextRender();
      firedWith("draw.delete", {
        features: [line],
      });
      assertEquals(
        flushDrawEvents(),
        ["draw.delete"],
        "no unexpected draw events",
      );
    },
  );

  await t.test("start draw_point mode then exit with Enter", async () => {
    Draw.deleteAll();
    Draw.changeMode("draw_point");
    container.dispatchEvent(enterEvent);

    await afterNextRender();

    firedWith("draw.modechange", {
      mode: "simple_select",
    });
    assertEquals(Draw.getAll().features.length, 0, "no feature created");
    assertEquals(
      flushDrawEvents(),
      ["draw.modechange"],
      "no unexpected draw events",
    );
  });

  await t.test("start draw_point mode then exit with Escape", async () => {
    Draw.deleteAll();
    Draw.changeMode("draw_point");
    container.dispatchEvent(escapeEvent);

    await afterNextRender();

    firedWith("draw.modechange", {
      mode: "simple_select",
    });
    assertEquals(Draw.getAll().features.length, 0, "no feature created");
    assertEquals(
      flushDrawEvents(),
      ["draw.modechange"],
      "no unexpected draw events",
    );
  });

  await t.test(
    "start draw_line_string mode and drawing a line then finish with Enter",
    async () => {
      Draw.deleteAll();
      Draw.changeMode("draw_line_string");
      mouseClick(map, makeMouseEvent(240, 240));
      mouseClick(map, makeMouseEvent(260, 260));
      container.dispatchEvent(enterEvent);

      await afterNextRender();

      const expectedLine = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [240, 240],
            [260, 260],
          ],
        },
      };

      firedWith("draw.create", {
        features: [expectedLine],
      });

      firedWith("draw.selectionchange", {
        features: [expectedLine],
        points: [],
      });

      firedWith("draw.modechange", {
        mode: "simple_select",
      });

      assertEquals(
        flushDrawEvents(),
        ["draw.create", "draw.modechange", "draw.selectionchange"],
        "no unexpected draw events",
      );
    },
  );

  await t.test(
    "start draw_line_string mode then exit with Escape",
    async () => {
      Draw.deleteAll();
      Draw.changeMode("draw_line_string");
      mouseClick(map, makeMouseEvent(0, 0));
      mouseClick(map, makeMouseEvent(20, 20));
      container.dispatchEvent(escapeEvent);

      await afterNextRender();

      firedWith("draw.modechange", {
        mode: "simple_select",
      });
      assertEquals(Draw.getAll().features.length, 0, "no feature created");
      assertEquals(
        flushDrawEvents(),
        ["draw.modechange"],
        "no unexpected draw events",
      );
    },
  );

  await t.test(
    "start draw_polygon mode and drawing a polygon then finish with Enter",
    async () => {
      Draw.deleteAll();
      Draw.changeMode("draw_polygon");
      mouseClick(map, makeMouseEvent(240, 240));
      mouseClick(map, makeMouseEvent(260, 260));
      mouseClick(map, makeMouseEvent(300, 200));
      container.dispatchEvent(enterEvent);

      await afterNextRender();

      const expectedPolygon = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [240, 240],
              [260, 260],
              [300, 200],
              [240, 240],
            ],
          ],
        },
      };
      firedWith("draw.create", {
        features: [expectedPolygon],
      });

      firedWith("draw.selectionchange", {
        features: [expectedPolygon],
        points: [],
      });

      firedWith("draw.modechange", {
        mode: "simple_select",
      });

      assertEquals(
        flushDrawEvents(),
        ["draw.create", "draw.modechange", "draw.selectionchange"],
        "no unexpected draw events",
      );
    },
  );

  await t.test("start draw_polygon mode then exit with Escape", async () => {
    Draw.deleteAll();
    Draw.changeMode("draw_polygon");
    mouseClick(map, makeMouseEvent(0, 0));
    mouseClick(map, makeMouseEvent(20, 20));
    mouseClick(map, makeMouseEvent(30, 30));
    container.dispatchEvent(escapeEvent);
    await afterNextRender();

    firedWith("draw.modechange", {
      mode: "simple_select",
    });
    assertEquals(Draw.getAll().features.length, 0, "no feature created");
    assertEquals(
      flushDrawEvents(),
      ["draw.modechange"],
      "no unexpected draw events",
    );
  });

  await t.test("box selection includes no features", async () => {
    Draw.deleteAll();
    Draw.changeMode("simple_select");
    mouseClick(map, makeMouseEvent(0, 0, { shiftKey: true }));
    mouseClick(map, makeMouseEvent(100, 100, { shiftKey: true }));
    await afterNextRender();
    assertEquals(flushDrawEvents(), [], "no unexpected draw events");
  });
});
