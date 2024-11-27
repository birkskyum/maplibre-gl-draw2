import test from "node:test";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import { euclideanDistance } from "../src/lib/euclidean_distance.ts";

test("euclideanDistance", () => {
  assertEquals(
    euclideanDistance({ x: 1, y: 1 }, { x: 4, y: 4 }),
    4.242640687119285,
  );
  assertEquals(
    euclideanDistance({ x: -10, y: 99.486354 }, { x: 0, y: -0.324736 }),
    100.31078549681536,
  );
});
