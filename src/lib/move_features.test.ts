import { test } from "vitest";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import { getGeoJSON } from "../../test/utils/get_geojson.ts";
import { createMockFeatureContext } from "../../test/utils/create_mock_feature_context.ts";
import { PointFeat } from "../feature_types/point.ts";
import { LineStringFeat } from "../feature_types/line_string.ts";
import { PolygonFeat } from "../feature_types/polygon.ts";
import { moveFeatures } from "./move_features.ts";

const mockFeatureContext = createMockFeatureContext();

test("moveFeatures point", () => {
  const point = new PointFeat(mockFeatureContext, getGeoJSON("point"));
  point.setCoordinates([10, 20]);
  moveFeatures([point], { lng: 7, lat: 13 });
  assertEquals(point.getCoordinates(), [17, 33]);
});

test("moveFeatures point beyond north limit map", () => {
  const point = new PointFeat(mockFeatureContext, getGeoJSON("point"));
  point.setCoordinates([10, 20]);
  moveFeatures([point], { lng: 50, lat: 120 });
  assertEquals(point.getCoordinates(), [60, 85]);
});

test("moveFeatures point beyond south limit", () => {
  const point = new PointFeat(mockFeatureContext, getGeoJSON("point"));
  point.setCoordinates([10, 20]);
  moveFeatures([point], { lng: -20, lat: -200 });
  assertEquals(point.getCoordinates(), [-10, -85]);
});

test("moveFeatures line", () => {
  const line = new LineStringFeat(mockFeatureContext, getGeoJSON("line"));
  line.setCoordinates([
    [10, 15],
    [-10, -30],
    [17, 33],
  ]);
  moveFeatures([line], { lng: 7, lat: 13 });
  assertEquals(line.getCoordinates(), [
    [17, 28],
    [-3, -17],
    [24, 46],
  ]);
});

test("moveFeatures line beyond north limit", () => {
  const line = new LineStringFeat(mockFeatureContext, getGeoJSON("line"));
  line.setCoordinates([
    [10, 15],
    [-10, -30],
    [17, 33],
  ]);
  moveFeatures([line], { lng: 7, lat: 60 });
  assertEquals(
    line.getCoordinates(),
    [
      [17, 72],
      [-3, 27],
      [24, 90],
    ],
    "lat should only move 57",
  );
});

test("moveFeatures line beyond south pole", () => {
  const line = new LineStringFeat(mockFeatureContext, getGeoJSON("line"));
  line.setCoordinates([
    [10, 15],
    [-10, -30],
    [17, 33],
  ]);
  moveFeatures([line], { lng: -7, lat: -100 });
  assertEquals(
    line.getCoordinates(),
    [
      [3, -45],
      [-17, -90],
      [10, -27],
    ],
    "lat should only move -45",
  );
});

test("moveFeatures polygon", () => {
  const polygon = new PolygonFeat(mockFeatureContext, getGeoJSON("polygon"));
  polygon.setCoordinates([
    [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
    ],
  ]);
  moveFeatures([polygon], { lng: -23, lat: 31.33 });
  assertEquals(polygon.getCoordinates(), [
    [
      [-23, 31.33],
      [-23, 41.33],
      [-13, 41.33],
      [-13, 31.33],
      [-23, 31.33],
    ],
  ]);
});

test("moveFeatures polygon beyond north limit", () => {
  const polygon = new PolygonFeat(mockFeatureContext, getGeoJSON("polygon"));
  polygon.setCoordinates([
    [
      [0, 0],
      [0, 20],
      [10, 10],
      [10, 0],
    ],
  ]);
  moveFeatures([polygon], { lng: -0.5, lat: 100 });
  assertEquals(
    polygon.getCoordinates(),
    [
      [
        [-0.5, 70],
        [-0.5, 90],
        [9.5, 80],
        [9.5, 70],
        [-0.5, 70],
      ],
    ],
    "lat should only move 70",
  );
});

test("moveFeatures polygon beyond south pole", () => {
  const polygon = new PolygonFeat(mockFeatureContext, getGeoJSON("polygon"));
  polygon.setCoordinates([
    [
      [0, 0],
      [0, -10.5],
      [10, -40],
      [10, 0],
    ],
  ]);
  moveFeatures([polygon], { lng: 1, lat: -80.44 });
  assertEquals(
    polygon.getCoordinates(),
    [
      [
        [1, -50],
        [1, -60.5],
        [11, -90],
        [11, -50],
        [1, -50],
      ],
    ],
    "lat should only move -50",
  );
});

test("moveFeatures multiple features", () => {
  const point = new PointFeat(mockFeatureContext, getGeoJSON("point"));
  point.setCoordinates([10, 20]);
  const line = new LineStringFeat(mockFeatureContext, getGeoJSON("line"));
  line.setCoordinates([
    [10, 15],
    [-10, -30],
    [17, 33],
  ]);
  const polygon = new PolygonFeat(mockFeatureContext, getGeoJSON("polygon"));
  polygon.setCoordinates([
    [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
    ],
  ]);
  moveFeatures([point, line, polygon], { lng: 5, lat: -7 });
  assertEquals(point.getCoordinates(), [15, 13], "point moved");
  assertEquals(
    line.getCoordinates(),
    [
      [15, 8],
      [-5, -37],
      [22, 26],
    ],
    "line moved",
  );
  assertEquals(
    polygon.getCoordinates(),
    [
      [
        [5, -7],
        [5, 3],
        [15, 3],
        [15, -7],
        [5, -7],
      ],
    ],
    "polygon moved",
  );
});

test("moveFeatures multiple features beyond north limit", () => {
  const point = new PointFeat(mockFeatureContext, getGeoJSON("point"));
  point.setCoordinates([10, 45]);
  const line = new LineStringFeat(mockFeatureContext, getGeoJSON("line"));
  line.setCoordinates([
    [10, 15],
    [-10, -30],
    [17, 33],
  ]);
  const polygon = new PolygonFeat(mockFeatureContext, getGeoJSON("polygon"));
  polygon.setCoordinates([
    [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
    ],
  ]);
  moveFeatures([point, line, polygon], { lng: 5, lat: 200 });
  assertEquals(point.getCoordinates(), [15, 85], "point lat only moved 40");
  assertEquals(
    line.getCoordinates(),
    [
      [15, 55],
      [-5, 10],
      [22, 73],
    ],
    "line lat only moved 40",
  );
  assertEquals(
    polygon.getCoordinates(),
    [
      [
        [5, 40],
        [5, 50],
        [15, 50],
        [15, 40],
        [5, 40],
      ],
    ],
    "polygon lat only moved 40",
  );
});

test("moveFeatures multiple features beyond south limit", () => {
  const point = new PointFeat(mockFeatureContext, getGeoJSON("point"));
  point.setCoordinates([10, 20]);
  const line = new LineStringFeat(mockFeatureContext, getGeoJSON("line"));
  line.setCoordinates([
    [10, 15],
    [-10, -30],
    [17, 33],
  ]);
  const polygon = new PolygonFeat(mockFeatureContext, getGeoJSON("polygon"));
  polygon.setCoordinates([
    [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
    ],
  ]);
  moveFeatures([point, line, polygon], { lng: 5, lat: -120 });
  assertEquals(
    point.getCoordinates(),
    [15, -40],
    "point lat only moved -60",
  );
  assertEquals(
    line.getCoordinates(),
    [
      [15, -45],
      [-5, -90],
      [22, -27],
    ],
    "line lat only moved -60",
  );
  assertEquals(
    polygon.getCoordinates(),
    [
      [
        [5, -60],
        [5, -50],
        [15, -50],
        [15, -60],
        [5, -60],
      ],
    ],
    "polygon moved",
  );
});
