import test from "node:test";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import { spy } from "sinon";
import { Feat } from "../src/feature_types/feature.ts";
import { PointFeat } from "../src/feature_types/point.ts";
import { PolygonFeat } from "../src/feature_types/polygon.ts";
import { LineStringFeat } from "../src/feature_types/line_string.ts";
import { MultiFeat } from "../src/feature_types/multi_feature.ts";
import { createMockFeatureContext } from "./utils/create_mock_feature_context.ts";
import { getPublicMemberKeys } from "./utils/get_public_member_keys.ts";

test("MultiPoint via MultiFeature", () => {
  assert(
    MultiFeat.prototype instanceof Feat,
    "inherits from Feature",
  );

  // Prototype members
  assertEquals(
    typeof MultiFeat.prototype.isValid,
    "function",
    "polygon.isValid",
  );
  assertEquals(
    typeof MultiFeat.prototype.setCoordinates,
    "function",
    "polygon.setCoordinates",
  );
  assertEquals(
    typeof MultiFeat.prototype.getCoordinate,
    "function",
    "polygon.getCoordinate",
  );
  assertEquals(
    typeof MultiFeat.prototype.getCoordinates,
    "function",
    "polygon.getCoordinates",
  );
  assertEquals(
    typeof MultiFeat.prototype.updateCoordinate,
    "function",
    "polygon.updateCoordinate",
  );
  assertEquals(
    typeof MultiFeat.prototype.addCoordinate,
    "function",
    "polygon.addCoordinate",
  );
  assertEquals(
    typeof MultiFeat.prototype.removeCoordinate,
    "function",
    "polygon.removeCoordinate",
  );
  assertEquals(
    typeof MultiFeat.prototype.getFeatures,
    "function",
    "polygon.getFeatures",
  );

  assertEquals(
    Object.getOwnPropertyNames(MultiFeat.prototype).length,
    10,
    "no unexpected prototype members",
  );
});

test("MultiPoint", () => {
  const rawMultiPoint = {
    type: "Feature",
    id: "wahoo",
    properties: { foo: "bar" },
    geometry: {
      type: "MultiPoint",
      coordinates: [
        [1, 1],
        [2, 2],
        [3, 3],
      ],
    },
  };
  const ctx = createMockFeatureContext();
  let multiPoint;
  try{
    multiPoint = new MultiFeat(ctx, rawMultiPoint);
  } catch(e) {
    throw "MultiPoint type does not throw";
  }
  const changedSpy = spy(multiPoint, "changed");

  // Instance members
  assertEquals(multiPoint.ctx, ctx, "multiPoint.ctx");
  assertEquals(multiPoint.coordinates, undefined, "no coordinates");
  assertEquals(
    multiPoint.properties,
    { foo: "bar" },
    "multiPoint.properties",
  );
  assertEquals(multiPoint.id, "wahoo", "multiPoint.id");
  assertEquals(multiPoint.type, "MultiPoint", "multiPoint.type");
  assertEquals(multiPoint.features.length, 3, "multiPoint.features");
  // multiPoint.changed gets counted because it's used below
  assertEquals(
    Object.getOwnPropertyNames(multiPoint).length,
    8,
    "no unexpected instance members",
  );

  const pointA = multiPoint.features[0];
  const pointB = multiPoint.features[1];
  const pointC = multiPoint.features[2];

  assertEquals(
    pointA,
    new PointFeat(ctx, {
      id: pointA.id,
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [1, 1],
        type: "Point",
      },
    }),
  );
  assertEquals(
    pointB,
    new PointFeat(ctx, {
      id: pointB.id,
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [2, 2],
        type: "Point",
      },
    }),
  );
  assertEquals(
    pointC,
    new PointFeat(ctx, {
      id: pointC.id,
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [3, 3],
        type: "Point",
      },
    }),
  );

  const pointAGetCoordinateSpy = spy(pointA, "getCoordinate");
  const pointBGetCoordinateSpy = spy(pointB, "getCoordinate");
  const pointCGetCoordinateSpy = spy(pointC, "getCoordinate");
  const coordinate = multiPoint.getCoordinate("2");
  assertEquals(
    pointAGetCoordinateSpy.callCount,
    0,
    "point A getCoordinate not called",
  );
  assertEquals(
    pointBGetCoordinateSpy.callCount,
    0,
    "point B getCoordinate not called",
  );
  assertEquals(pointCGetCoordinateSpy.callCount, 1, "point C getCoordinate");
  assertEquals(coordinate, [3, 3], "correct coordinate");

  const pointAUpdateCoordinateSpy = spy(pointA, "updateCoordinate");
  const pointBUpdateCoordinateSpy = spy(pointB, "updateCoordinate");
  const pointCUpdateCoordinateSpy = spy(pointC, "updateCoordinate");
  multiPoint.updateCoordinate("0", 99, 100);
  assertEquals(
    pointAUpdateCoordinateSpy.callCount,
    1,
    "point A updateCoordinate",
  );
  assertEquals(
    pointBUpdateCoordinateSpy.callCount,
    0,
    "point B updateCoordinate not called",
  );
  assertEquals(
    pointCUpdateCoordinateSpy.callCount,
    0,
    "point C updateCoordinate not called",
  );
  assertEquals(
    multiPoint.getCoordinate("0"),
    [99, 100],
    "correct coordinate",
  );

  assertEquals(
    multiPoint.getCoordinates(),
    [
      [99, 100],
      [2, 2],
      [3, 3],
    ],
    "getCoordinates returns the complete multi-coordinates",
  );

  multiPoint.setCoordinates([
    [6, 6],
    [7, 7],
  ]);
  assertEquals(changedSpy.callCount, 2, "changed called by setCoordinates");
  assertEquals(multiPoint.getCoordinates(), [
    [6, 6],
    [7, 7],
  ]);

  assertEquals(multiPoint.isValid(), true, "positive validation works");
  multiPoint.setCoordinates([[1], []]);
  assertEquals(multiPoint.isValid(), false, "negative validation works");
});

// Tests below less in depth becuase we know the
// inner-workings are the same
test("MultiPolygon via MultiFeature", () => {
  const rawMultiPolygon = {
    type: "Feature",
    id: "zing",
    properties: { f: "a" },
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
            [1, 1],
          ],
        ],
        [
          [
            [2, 1],
            [6, 2],
            [8, 3],
            [2, 4],
            [2, 1],
          ],
          [
            [1, 1],
            [2, 2],
            [3, 3],
            [1, 1],
          ],
        ],
      ],
    },
  };
  const ctx = createMockFeatureContext();
  let multiPolygon;
  try{
    multiPolygon = new MultiFeat(ctx, rawMultiPolygon);
  } catch(e) {
  throw "MultiPolygon type does not throw"
  }

  const polygonA = multiPolygon.features[0];
  const polygonB = multiPolygon.features[1];

  assertEquals(
    polygonA,
    new PolygonFeat(ctx, {
      id: polygonA.id,
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
            [1, 1],
          ],
        ],
        type: "Polygon",
      },
    }),
  );
  assertEquals(
    polygonB,
    new PolygonFeat(ctx, {
      id: polygonB.id,
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [
            [2, 1],
            [6, 2],
            [8, 3],
            [2, 4],
            [2, 1],
          ],
          [
            [1, 1],
            [2, 2],
            [3, 3],
            [1, 1],
          ],
        ],
        type: "Polygon",
      },
    }),
  );
});

test("MultiLineString via MultiFeature", () => {
  const rawMultiLineString = {
    type: "Feature",
    id: "lineline",
    properties: { g: "h" },
    geometry: {
      type: "MultiLineString",
      coordinates: [
        [
          [1, 1],
          [2, 2],
          [3, 3],
        ],
        [
          [4, 4],
          [5, 5],
          [6, 6],
        ],
      ],
    },
  };
  const ctx = createMockFeatureContext();
  let multiLineString;
  try {
    multiLineString = new MultiFeat(ctx, rawMultiLineString);
  } catch (e) { 
    throw "MultiLineString type does not throw"
  }

  const lineStringA = multiLineString.features[0];
  const lineStringB = multiLineString.features[1];

  assertEquals(
    lineStringA,
    new LineStringFeat(ctx, {
      id: lineStringA.id,
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [1, 1],
          [2, 2],
          [3, 3],
        ],
        type: "LineString",
      },
    }),
  );
  assertEquals(
    lineStringB,
    new LineStringFeat(ctx, {
      id: lineStringB.id,
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [4, 4],
          [5, 5],
          [6, 6],
        ],
        type: "LineString",
      },
    }),
  );
});

test("Invalid MultiFeature type", () => {
  const rawThing = {
    type: "Feature",
    id: "blergh",
    properties: { g: "h" },
    geometry: {
      type: "thing",
      coordinates: [
        [
          [1, 1],
          [2, 2],
          [3, 3],
        ],
        [
          [4, 4],
          [5, 5],
          [6, 6],
        ],
      ],
    },
  };
  let thing;
  assertThrows(() => {
    thing = new MultiFeat(createMockFeatureContext(), rawThing);
  }, "invalid type throws");
  assertEquals(thing, undefined);
});
