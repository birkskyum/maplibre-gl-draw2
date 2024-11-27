import { test } from "vitest";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import { isEventAtCoordinates } from "../src/lib/is_event_at_coordinates.ts";

test("isEventAtCoordinates", () => {
  assert(
    isEventAtCoordinates(
      {
        lngLat: {
          lng: 3,
          lat: 29,
        },
      },
      [3, 29],
    ),
  );
  assertEquals(
    isEventAtCoordinates(
      {
        lngLat: {
          lng: -3,
          lat: 29,
        },
      },
      [3, 29],
    ),
    false,
  );

  assertEquals(
    isEventAtCoordinates(
      {
        nothing: true,
      },
      [3, 29],
    ),
    false,
  );
});
