import test from "node:test";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import { spy } from "sinon";
import { Feat } from "../src/feature_types/feature.ts";
import { PolygonFeat } from "../src/feature_types/polygon.ts";
import { MapLibreDraw } from "../src/index.ts";
import { createFeature } from "./utils/create_feature.ts";
import { getPublicMemberKeys } from "./utils/get_public_member_keys.ts";
import { createMockFeatureContext } from "./utils/create_mock_feature_context.ts";
import { drawGeometry } from "./utils/draw_geometry.ts";
import { createMap } from "./utils/create_map.ts";

test("Polygon constructor and API", () => {
  const rawPolygon = createFeature("polygon");
  rawPolygon.geometry.coordinates = [
    [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
      [1, 2],
    ],
  ];
  const ctx = createMockFeatureContext();
  const polygon = new PolygonFeat(ctx, rawPolygon);

  // Instance members
  assertEquals(polygon.ctx, ctx, "polygon.ctx");
  assertEquals(
    polygon.coordinates,
    [
      [
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
      ],
    ],
    "polygon.coordinates remove the last coordinate of the ring (which matches the first)",
  );
  assertEquals(polygon.properties, rawPolygon.properties, "polygon.properties");
  assertEquals(polygon.id, rawPolygon.id, "polygon.id");
  assertEquals(polygon.type, rawPolygon.geometry.type, "polygon.type");
  assertEquals(
    getPublicMemberKeys(polygon).length,
    5,
    "no unexpected instance members",
  );

  // Prototype members
  assertEquals(
    typeof PolygonFeat.prototype.isValid,
    "function",
    "polygon.isValid",
  );
  assertEquals(
    typeof PolygonFeat.prototype.incomingCoords,
    "function",
    "polygon.incomingCoords",
  );
  assertEquals(
    typeof PolygonFeat.prototype.setCoordinates,
    "function",
    "polygon.setCoordinates",
  );
  assertEquals(
    typeof PolygonFeat.prototype.addCoordinate,
    "function",
    "polygon.addCoordinate",
  );
  assertEquals(
    typeof PolygonFeat.prototype.getCoordinate,
    "function",
    "polygon.getCoordinate",
  );
  assertEquals(
    typeof PolygonFeat.prototype.getCoordinates,
    "function",
    "polygon.getCoordinates",
  );
  assertEquals(
    typeof PolygonFeat.prototype.removeCoordinate,
    "function",
    "polygon.removeCoordinate",
  );
  assertEquals(
    typeof PolygonFeat.prototype.updateCoordinate,
    "function",
    "polygon.updateCoordinate",
  );
  assertEquals(
    Object.getOwnPropertyNames(PolygonFeat.prototype).length,
    9,
    "no unexpected prototype members",
  );

  assert(
    PolygonFeat.prototype instanceof Feat,
    "inherits from Feature",
  );
});

test("Polygon#isValid", () => {
  const validRawPolygon = createFeature("polygon");
  const validPolygon = new PolygonFeat(
    createMockFeatureContext(),
    validRawPolygon,
  );
  assertEquals(validPolygon.isValid(), true, "returns true for valid polygons");

  const invalidRawPolygonA = createFeature("polygon");
  invalidRawPolygonA.geometry.coordinates = [
    [
      [1, 2],
      [3, 4],
      [5, 6],
    ],
    [
      [7, 8],
      [9, 10],
    ],
  ];
  const invalidPolygonA = new PolygonFeat(
    createMockFeatureContext(),
    invalidRawPolygonA,
  );
  assertEquals(
    invalidPolygonA.isValid(),
    false,
    "returns false when a ring has fewer than 3 coordinates",
  );
});

test("Polygon#incomingCoords, Polygon#getCoordinates", () => {
  const rawPolygon = createFeature("polygon");
  const polygon = new PolygonFeat(createMockFeatureContext(), rawPolygon);
  const changedSpy = spy(polygon, "changed");

  polygon.incomingCoords([
    [
      [1, 2],
      [3, 4],
      [5, 6],
      [1, 2],
    ],
  ]);
  assertEquals(changedSpy.callCount, 1, "calls polygon.changed");
  assertEquals(
    polygon.coordinates,
    [
      [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
    ],
    "sets new coordinates, eliminating last (closing) one",
  );
  assertEquals(
    polygon.getCoordinates(),
    [
      [
        [1, 2],
        [3, 4],
        [5, 6],
        [1, 2],
      ],
    ],
    "getCoordinates return closed rings",
  );
});

test("Polygon#setCoordinates", () => {
  const rawPolygon = createFeature("polygon");
  const polygon = new PolygonFeat(createMockFeatureContext(), rawPolygon);
  const changedSpy = spy(polygon, "changed");

  polygon.setCoordinates([
    [
      [1, 2],
      [3, 4],
      [5, 6],
    ],
  ]);
  assertEquals(changedSpy.callCount, 1, "polygon.changed called");
  assertEquals(
    polygon.coordinates,
    [
      [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
    ],
    "new coordinates set",
  );
});

test("Polygon#addCoordinate, Polygon#removeCoordinate", () => {
  const rawPolygon = createFeature("polygon");
  rawPolygon.geometry.coordinates = [
    [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [1, 1],
    ],
    [
      [2, 1],
      [3, 2],
      [4, 3],
      [5, 4],
      [2, 1],
    ],
  ];
  const polygon = new PolygonFeat(createMockFeatureContext(), rawPolygon);
  const changedSpy = spy(polygon, "changed");

  changedSpy.resetHistory();
  polygon.addCoordinate("1.1", 99, 100);
  assertEquals(changedSpy.callCount, 1, "polygon.changed was called");
  assertEquals(
    polygon.getCoordinates(),
    [
      [
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
        [1, 1],
      ],
      [
        [2, 1],
        [99, 100],
        [3, 2],
        [4, 3],
        [5, 4],
        [2, 1],
      ],
    ],
    "new coordinate added at right place in right ring",
  );

  changedSpy.resetHistory();
  polygon.removeCoordinate("0.3");
  assertEquals(changedSpy.callCount, 1, "polygon.changed was called");
  assertEquals(
    polygon.getCoordinates(),
    [
      [
        [1, 1],
        [2, 2],
        [3, 3],
        [1, 1],
      ],
      [
        [2, 1],
        [99, 100],
        [3, 2],
        [4, 3],
        [5, 4],
        [2, 1],
      ],
    ],
    "coordinate removed at right place in right ring",
  );
});

test("Polygon#updateCoordinate, Polygon#getCoordinate", () => {
  const rawPolygon = createFeature("polygon");
  rawPolygon.geometry.coordinates = [
    [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [1, 1],
    ],
    [
      [2, 1],
      [3, 2],
      [4, 3],
      [5, 4],
      [2, 1],
    ],
  ];
  const polygon = new PolygonFeat(createMockFeatureContext(), rawPolygon);
  const changedSpy = spy(polygon, "changed");

  changedSpy.resetHistory();
  assertEquals(
    polygon.getCoordinate("1.2"),
    [4, 3],
    "getCoordinate returns right one",
  );
  polygon.updateCoordinate("1.2", 99, 100);
  assertEquals(changedSpy.callCount, 1, "polygon.changed was called");
  assertEquals(
    polygon.getCoordinates(),
    [
      [
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
        [1, 1],
      ],
      [
        [2, 1],
        [3, 2],
        [99, 100],
        [5, 4],
        [2, 1],
      ],
    ],
    "correct coordinate was changed",
  );
  assertEquals(
    polygon.getCoordinate("1.2"),
    [99, 100],
    "getCoordinate still works",
  );
});

test("Polygon integration", async () => {
  const polygonCoordinates = [
    [
      [0, 0],
      [30, 15],
      [32, 35],
      [15, 30],
      [0, 0],
    ],
  ];
  const map = createMap();
  const Draw = new MapLibreDraw();
  map.addControl(Draw);

  await map.on("load");

  await drawGeometry(map, Draw, "Polygon", polygonCoordinates);

  const feats = Draw.getAll().features;
  assertEquals(1, feats.length, "only one");
  assertEquals("Polygon", feats[0].geometry.type, "of the right type");
  assertEquals(
    feats[0].geometry.coordinates[0].length,
    polygonCoordinates[0].length,
    "right number of points",
  );
  assertEquals(
    feats[0].geometry.coordinates,
    polygonCoordinates,
    "in the right spot",
  );
  Draw.onRemove();
});
