import test from "node:test";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import { spy } from "sinon";
import { Feat } from "../src/feature_types/feature.ts";
import { PointFeat } from "../src/feature_types/point.ts";
import { MapLibreDraw } from "../src/index.ts";
import { createFeature } from "./utils/create_feature.ts";
import { getPublicMemberKeys } from "./utils/get_public_member_keys.ts";
import { createMockFeatureContext } from "./utils/create_mock_feature_context.ts";
import { drawGeometry } from "./utils/draw_geometry.ts";
import { createMap } from "./utils/create_map.ts";

test("Point constructor and API", () => {
  const rawPoint = createFeature("point");
  const ctx = createMockFeatureContext();
  const point = new PointFeat(ctx, rawPoint);

  // Instance members
  assertEquals(point.ctx, ctx, "point.ctx");
  assertEquals(
    point.coordinates,
    rawPoint.geometry.coordinates,
    "point.coordinates",
  );
  assertEquals(point.properties, rawPoint.properties, "point.properties");
  assertEquals(point.id, rawPoint.id, "point.id");
  assertEquals(point.type, rawPoint.geometry.type, "point.type");
  assertEquals(
    getPublicMemberKeys(point).length,
    5,
    "no unexpected instance members",
  );

  // Prototype members
  assertEquals(typeof PointFeat.prototype.isValid, "function", "point.isValid");
  assertEquals(
    typeof PointFeat.prototype.getCoordinate,
    "function",
    "point.getCoordinate",
  );
  assertEquals(
    typeof PointFeat.prototype.updateCoordinate,
    "function",
    "point.updateCoordinate",
  );
  assertEquals(
    Object.getOwnPropertyNames(PointFeat.prototype).length,
    4,
    "no unexpected prototype members",
  );

  assert(
    PointFeat.prototype instanceof Feat,
    "inherits from Feature",
  );
});

test("Point#isValid", () => {
  const validRawPoint = createFeature("point");
  const validPoint = new PointFeat(createMockFeatureContext(), validRawPoint);
  assertEquals(validPoint.isValid(), true, "returns true for valid point");

  const invalidRawPointA = createFeature("point");
  invalidRawPointA.geometry.coordinates = [0, "1"];
  const invalidPointA = new PointFeat(
    createMockFeatureContext(),
    invalidRawPointA,
  );
  assertEquals(
    invalidPointA.isValid(),
    false,
    "returns false with non-number coordinate",
  );

  const invalidRawPointB = createFeature("point");
  invalidRawPointB.geometry.coordinates = ["1", 0];
  const invalidPointB = new PointFeat(
    createMockFeatureContext(),
    invalidRawPointA,
  );
  assertEquals(
    invalidPointB.isValid(),
    false,
    "returns false with non-number coordinate, again",
  );
});

test("Point#updateCoordinate, Point#getCoordinate", () => {
  const rawPoint = createFeature("point");
  rawPoint.geometry.coordinates = [1, 2];
  const point = new PointFeat(createMockFeatureContext(), rawPoint);
  const changedSpy = spy(point, "changed");

  assertEquals(point.getCoordinate(), [1, 2]);

  point.updateCoordinate(3, 4, 5);
  assertEquals(changedSpy.callCount, 1);
  assertEquals(
    point.getCoordinate(),
    [4, 5],
    "handles 3 arguments, ignoring the first (as path)",
  );

  point.updateCoordinate(6, 7);
  assertEquals(point.getCoordinate(), [6, 7], "handles 2 arguments");
});

test("Point integration test", async () => {
  const pointCoordinates = [10, 10];
  const map = createMap();
  const Draw = new MapLibreDraw();
  map.addControl(Draw);

  await map.on("load");

  await drawGeometry(map, Draw, "Point", pointCoordinates);

  const feats = Draw.getAll().features;
  assertEquals(1, feats.length, "only one");
  assertEquals("Point", feats[0].geometry.type, "of the right type");
  assertEquals(
    [10, 10],
    feats[0].geometry.coordinates,
    "in the right spot",
  );

  Draw.onRemove();
});
