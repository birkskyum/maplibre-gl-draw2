import { test } from "vitest";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import Point from "@mapbox/point-geometry";
import { mouseEventPoint } from "../src/lib/mouse_event_point.ts";

test("mouseEventPoint", () => {
  const mockContainer = {
    clientLeft: 2,
    clientTop: 1,
    getBoundingClientRect() {
      return {
        left: 10,
        top: 20,
      };
    },
  };

  const mockEvent = {
    clientX: 15,
    clientY: 33,
  };

  const result = mouseEventPoint(mockEvent, mockContainer);
  assertEquals(result instanceof Point, true);
  assertEquals(result.x, 3);
  assertEquals(result.y, 12);
});
