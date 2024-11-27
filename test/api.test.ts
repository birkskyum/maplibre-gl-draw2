/* eslint no-shadow:[0] */
import { afterEach, beforeEach, test } from "vitest";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import { spy } from "sinon";

import { MapLibreDraw } from "../src/index.ts";
import { createMap } from "./utils/create_map.ts";
import { getGeoJSON } from "./utils/get_geojson.ts";
import { setupAfterNextRender } from "./utils/after_next_render.ts";
import { getPublicMemberKeys } from "./utils/get_public_member_keys.ts";
import { ModeStrings } from "../src/constants/modes.ts";

let map;
let afterNextRender;
let Draw;
let addSpy;
let deleteSpy;

beforeEach(() => {
  map = createMap();
  afterNextRender = setupAfterNextRender(map);
  Draw = new MapLibreDraw();
  map.addControl(Draw);
  addSpy = spy(Draw, "add");
  deleteSpy = spy(Draw, "delete");
});

afterEach(() => {
  map = null;
  afterNextRender = null;
  Draw = null;
  addSpy = null;
  deleteSpy = null;
});

test("Draw.getFeatureIdsAt", async () => {
  const feature = getGeoJSON("point");
  const [id] = Draw.add(feature);

  await afterNextRender();

  // These tests require the the pixel space
  // and lat/lng space are equal (1px = 1deg)
  const featureIds = Draw.getFeatureIdsAt({
    x: feature.geometry.coordinates[0],
    y: feature.geometry.coordinates[1],
  });

  assertEquals(featureIds.length, 1, "should return the added feature");
  assertEquals(
    featureIds[0],
    id,
    "selected feature should match desired feature",
  );
  Draw.deleteAll();
});

test("Draw.getSelectedIds", () => {
  const [lineId] = Draw.add(getGeoJSON("line"));
  const [pointId] = Draw.add(getGeoJSON("point"));
  const [polygonId] = Draw.add(getGeoJSON("polygon"));
  Draw.changeMode("simple_select", { featureIds: [lineId, pointId] });
  const selected = Draw.getSelectedIds();
  assertEquals(selected.length, 2, "returns correct number of ids");
  assertNotEquals(selected.indexOf(lineId), -1, "result contains line");
  assertNotEquals(selected.indexOf(pointId), -1, "result contains point");
  Draw.changeMode("simple_select", { featureIds: [polygonId] });
  const nextSelected = Draw.getSelectedIds();
  assertEquals(nextSelected.length, 1, "updates length");
  assertEquals(nextSelected[0], polygonId, "updates content");
});

test("Draw.getSelected", () => {
  const [lineId] = Draw.add(getGeoJSON("line"));
  const [pointId] = Draw.add(getGeoJSON("point"));
  const [polygonId] = Draw.add(getGeoJSON("polygon"));
  Draw.changeMode("simple_select", { featureIds: [lineId, pointId] });
  const fc = Draw.getSelected();

  assertEquals(typeof fc.features, "object", "we have a feature collection");

  const selected = fc.features.map((f) => f.id);
  assertEquals(selected.length, 2, "returns correct number of ids");
  assertNotEquals(selected.indexOf(lineId), -1, "result contains line");
  assertNotEquals(selected.indexOf(pointId), -1, "result contains point");
  Draw.changeMode("simple_select", { featureIds: [polygonId] });
  const nextSelected = Draw.getSelected().features.map((f) => f.id);
  assertEquals(nextSelected.length, 1, "updates length");
  assertEquals(nextSelected[0], polygonId, "updates content");
});

test("Draw.set", () => {
  const point = getGeoJSON("point");
  const line = getGeoJSON("line");
  const polygon = getGeoJSON("polygon");

  // First set it to one collection
  const collection = {
    type: "FeatureCollection",
    features: [point, line, polygon],
  };
  const drawInstance = Draw.set(collection);
  assertEquals(drawInstance.length, 3, "return value is correct length");
  const pointId = drawInstance[0];
  const lineId = drawInstance[1];
  const polygonId = drawInstance[2];
  assertEquals(Draw.get(pointId).geometry.type, "Point", "point id returned");
  assertEquals(
    Draw.get(lineId).geometry.type,
    "LineString",
    "line id returned",
  );
  assertEquals(
    Draw.get(polygonId).geometry.type,
    "Polygon",
    "polygon id returned",
  );
  assertEquals(Draw.getAll().features.length, 3, "all features loaded");

  // Then set to another
  addSpy.resetHistory();
  deleteSpy.resetHistory();
  const nextCollection = {
    type: "FeatureCollection",
    features: [polygon],
  };
  const nextDrawInstance = Draw.set(nextCollection);
  assertEquals(nextDrawInstance.length, 1, "return value is correct length");
  const nextPolygonId = nextDrawInstance[0];
  assertEquals(
    Draw.get(nextPolygonId).geometry.type,
    "Polygon",
    "polygon id returned",
  );
  assertEquals(
    Draw.getAll().features.length,
    1,
    "all features replaced with new ones",
  );
  assert(
    addSpy.calledWith(nextCollection),
    "Draw.add called with new collection",
  );
  assertEquals(deleteSpy.callCount, 1, "Draw.delete called");
  assertEquals(
    deleteSpy.getCall(0).args,
    [[pointId, lineId, polygonId]],
    "Draw.delete called with old features",
  );

  // Then set to another that contains a feature
  // with an already-used id
  addSpy.resetHistory();
  deleteSpy.resetHistory();
  const newLine = getGeoJSON("line");
  const overlappingPolygon = getGeoJSON("polygon");
  overlappingPolygon.id = nextPolygonId;
  const overlappingCollection = {
    type: "FeatureCollection",
    features: [newLine, overlappingPolygon],
  };
  const overlappingDrawInstance = Draw.set(overlappingCollection);
  assertEquals(
    overlappingDrawInstance.length,
    2,
    "return value is correct length",
  );
  const newLineId = overlappingDrawInstance[0];
  const overlappingPolygonId = overlappingDrawInstance[1];
  assertEquals(
    Draw.get(newLineId).geometry.type,
    "LineString",
    "new line id returned",
  );
  assertEquals(
    Draw.get(overlappingPolygonId).geometry.type,
    "Polygon",
    "overlapping polygon id returned",
  );
  assertEquals(
    overlappingPolygonId,
    nextPolygonId,
    "overlapping polygon id did not change",
  );
  assert(
    addSpy.calledWith(overlappingCollection),
    "Draw.add called with overlapping collection",
  );
  assertEquals(deleteSpy.callCount, 0, "Draw.delete not called");
});

test("Draw.set errors", () => {
  assertThrows(() => {
    Draw.set(getGeoJSON("point"));
  }, "when you pass a feature");
  assertThrows(() => {
    Draw.set({
      type: "FeatureCollection",
    });
  }, "when you pass a collection without features");
});

test("Draw.add -- point", () => {
  const id = Draw.add(getGeoJSON("point"))[0];
  assertEquals(typeof id, "string", "valid string id returned on add");
  Draw.deleteAll();
});

test("Draw.add -- FeatureCollection", () => {
  const listOfIds = Draw.add(getGeoJSON("featureCollection"));
  assertEquals(
    listOfIds.length,
    getGeoJSON("featureCollection").features.length,
    "valid string id returned when adding a featureCollection",
  );
  Draw.deleteAll();
});

test("Draw.add -- MultiPolygon", () => {
  const multiId = Draw.add(getGeoJSON("multiPolygon"))[0];
  assertEquals("string", typeof multiId, "accepts multi features");
  Draw.deleteAll();
});

test("Draw.add -- null geometry", () => {
  assertThrows(() => {
    Draw.add(getGeoJSON("nullGeometry"));
  }, "null geometry is invalid");
});

test("Draw.add -- GeometryCollection", () => {
  assertThrows(() => {
    Draw.add(getGeoJSON("geometryCollection"));
  }, "geometry collections are not valid in Draw");
});

test("Draw.add - accept lots of decimal percision", () => {
  for (let i = 0; i < 30; i++) {
    const div = Math.pow(10, i);
    const pos = [1 / div, 1 / div];
    const id = Draw.add({
      type: "Point",
      coordinates: pos,
    });
    const point = Draw.get(id);
    assertEquals(point.geometry.coordinates[0], pos[0], `lng right at 10e${i}`);
    assertEquals(point.geometry.coordinates[1], pos[1], `lat right at 10e${i}`);
  }
  Draw.deleteAll();
});

test("Draw.add -- change geometry type", () => {
  const id = Draw.add(getGeoJSON("point"))[0];
  const polygon = getGeoJSON("polygon");
  polygon.id = id;
  Draw.add(polygon);
  assertEquals(polygon, Draw.get(id), "changed geometry type");
  Draw.deleteAll();
});

test("Draw.add -- existing feature with changed properties", async () => {
  const id = Draw.add(getGeoJSON("point"));
  let point = Draw.get(id);

  await afterNextRender();

  point.properties = { testing: 123 };
  Draw.add(point);
  point = Draw.get(id);
  assertEquals("testing", Object.keys(point.properties)[0]);
  assertEquals(123, point.properties.testing);
  Draw.deleteAll();
});

test("Draw.get", () => {
  const id = Draw.add(getGeoJSON("point"));
  const f = Draw.get(id);
  assertEquals(
    getGeoJSON("point").geometry.coordinates,
    f.geometry.coordinates,
    "the geometry added is the same returned by Draw.get",
  );

  assertEquals(
    Draw.get("foo"),
    undefined,
    "returned undefined when no feature found",
  );

  Draw.deleteAll();
});

test("Draw.getAll", () => {
  Draw.add(getGeoJSON("point"));
  assertEquals(
    getGeoJSON("point").geometry,
    Draw.getAll().features[0].geometry,
    "the geometry added is the same returned by Draw.getAll",
  );
  Draw.deleteAll();
});

test("Draw.delete one feature", () => {
  const id = Draw.add(getGeoJSON("point"))[0];
  const drawInstance = Draw.delete(id);
  assertEquals(drawInstance, Draw, "returns Draw instance");
  assertEquals(
    Draw.getAll().features.length,
    0,
    "can remove a feature by its id",
  );
});

test("Draw.delete multiple features", () => {
  const [pointId] = Draw.add(getGeoJSON("point"));
  const [lineId] = Draw.add(getGeoJSON("line"));
  Draw.add(getGeoJSON("polygon"));
  const drawInstance = Draw.delete([pointId, lineId]);
  assertEquals(drawInstance, Draw, "returns Draw instance");
  assertEquals(
    Draw.getAll().features.length,
    1,
    "can remove multiple features by id",
  );
  assertEquals(
    Draw.getAll().features[0].geometry.type,
    "Polygon",
    "the right features were removed",
  );
  Draw.deleteAll();
});

test("Draw.delete a feature that is direct_selected", () => {
  const [id] = Draw.add(getGeoJSON("polygon"));
  Draw.changeMode("direct_select", { featureId: id });
  Draw.delete([id]);
  assertEquals(Draw.getAll().features.length, 0, "removed the feature");
  assertEquals(
    Draw.getMode(),
    "simple_select",
    "changed modes to simple_select",
  );
});

test("Draw.deleteAll", () => {
  Draw.add(getGeoJSON("point"));
  const drawInstance = Draw.deleteAll();
  assertEquals(drawInstance, Draw, "returns Draw instance");
  assertEquals(
    Draw.getAll().features.length,
    0,
    "Draw.deleteAll removes all geometries",
  );
});

test("Draw.deleteAll when in direct_select mode", async () => {
  Draw.add(getGeoJSON("point"));
  const id = Draw.add(getGeoJSON("line"));
  Draw.changeMode("direct_select", { featureId: id });
  Draw.deleteAll();

  await afterNextRender();

  assertEquals(
    Draw.getMode(),
    "simple_select",
    "switches to simple_select mode",
  );
  assertEquals(
    Draw.getAll().features.length,
    0,
    "removes selected feature along with others",
  );
});

test("Draw.changeMode and Draw.getMode with no pre-existing feature", () => {
  const drawInstance = Draw.changeMode("draw_polygon");
  assertEquals(drawInstance, Draw, "changeMode returns Draw instance");
  assertEquals(Draw.getMode(), "draw_polygon", "changed to draw_polygon");
  assertEquals(Draw.getAll().features.length, 1, "one feature added");
  assertEquals(
    Draw.getAll().features[0].geometry.type,
    "Polygon",
    "and it is a polygon",
  );
  assertEquals(
    Draw.getAll().features[0].geometry.coordinates,
    [[null]],
    "and it is empty",
  );

  Draw.changeMode("draw_line_string");
  assertEquals(
    Draw.getMode(),
    "draw_line_string",
    "changed to draw_line_string",
  );
  assertEquals(
    Draw.getAll().features.length,
    1,
    "still only one feature added",
  );
  assertEquals(
    Draw.getAll().features[0].geometry.type,
    "LineString",
    "and it is a line",
  );
  assertEquals(
    Draw.getAll().features[0].geometry.coordinates,
    [],
    "and it is empty",
  );

  Draw.changeMode("draw_point");
  assertEquals(Draw.getMode(), "draw_point", "changed to draw_point");
  assertEquals(
    Draw.getAll().features.length,
    1,
    "still only one feature added",
  );
  assertEquals(
    Draw.getAll().features[0].geometry.type,
    "Point",
    "and it is a point",
  );
  assertEquals(
    Draw.getAll().features[0].geometry.coordinates,
    [],
    "and it is empty",
  );

  Draw.changeMode("simple_select");
  assertEquals(Draw.getMode(), "simple_select", "changed to simple_select");
  assertEquals(Draw.getAll().features.length, 0, "no features added");

  assertThrows(() => {
    Draw.changeMode("direct_select");
  }, "cannot enter direct_select mode with a featureId");
});

test("Draw.changeMode to select and de-select pre-existing features", async () => {
  const [polygonId] = Draw.add(getGeoJSON("polygon"));
  const [lineId] = Draw.add(getGeoJSON("line"));
  const [pointId] = Draw.add(getGeoJSON("point"));

  const returnA = Draw.changeMode("simple_select", {
    featureIds: [polygonId, lineId],
  });
  assertEquals(returnA, Draw, "returns Draw instance");
  assertEquals(Draw.getMode(), "simple_select", "changed to simple_select");
  assertEquals(
    Draw.getSelectedIds(),
    [polygonId, lineId],
    "polygon and line are selected",
  );

  const returnB = Draw.changeMode("simple_select", {
    featureIds: [polygonId, lineId],
  });
  assertEquals(returnB, Draw, "returns Draw instance");
  assertEquals(
    Draw.getSelectedIds(),
    [polygonId, lineId],
    "polygon and line are still selected",
  );

  const returnC = Draw.changeMode("simple_select", { featureIds: [pointId] });
  assertEquals(returnC, Draw, "returns Draw instance");

  await afterNextRender();

  assert("a render occurred when selection changed");

  assertEquals(
    Draw.getSelectedIds(),
    [pointId],
    "change to simple_select with different featureIds to change selection",
  );

  const returnD = Draw.changeMode("direct_select", { featureId: polygonId });
  assertEquals(returnD, Draw, "returns Draw instance");
  assertEquals(
    Draw.getSelectedIds(),
    [polygonId],
    "change to direct_select changes selection",
  );

  const returnE = Draw.changeMode("direct_select", { featureId: polygonId });
  assertEquals(returnE, Draw, "returns Draw instance");
  assertEquals(
    Draw.getSelectedIds(),
    [polygonId],
    "changing to direct_select with same selection does nothing",
  );

  Draw.deleteAll();
});


test("Draw.combineFeatures -- polygon + polygon = multiploygon", () => {
  const [polygonId] = Draw.add(getGeoJSON("polygon"));
  const [polygon2Id] = Draw.add(getGeoJSON("polygon2"));
  Draw.changeMode("simple_select", { featureIds: [polygonId, polygon2Id] });

  Draw.combineFeatures();
  assertEquals(Draw.getAll().features.length, 1, "can combine two features");
  assertEquals(
    Draw.getAll().features[0].geometry.type,
    "MultiPolygon",
    "can combine two polygons into MultiPolygon",
  );
  assertEquals(
    Draw.getAll().features[0].geometry.coordinates[0],
    getGeoJSON("polygon").geometry.coordinates,
    "first set of coordinates in multipolygon matches with second polygon in selection",
  );
  assertEquals(
    Draw.getAll().features[0].geometry.coordinates[1],
    getGeoJSON("polygon2").geometry.coordinates,
    "second set of coordinates in multipolygon matches with first polygon in selection",
  );
  Draw.deleteAll();
});

test("Draw.combineFeatures -- point + point = multipoint", () => {
  const [pointId] = Draw.add(getGeoJSON("point"));
  const [point2Id] = Draw.add(getGeoJSON("point2"));
  Draw.changeMode("simple_select", { featureIds: [pointId, point2Id] });

  Draw.combineFeatures();
  assertEquals(Draw.getAll().features.length, 1, "can combine two features");
  assertEquals(
    Draw.getAll().features[0].geometry.type,
    "MultiPoint",
    "can combine two points into MultiPoint",
  );
  assertEquals(
    Draw.getAll().features[0].geometry.coordinates[0],
    getGeoJSON("point").geometry.coordinates,
    "first set of coordinates in multipoint matches with first point in selection",
  );
  assertEquals(
    Draw.getAll().features[0].geometry.coordinates[1],
    getGeoJSON("point2").geometry.coordinates,
    "second set of coordinates in multipoint matches with second point in selection",
  );
  Draw.deleteAll();
});

test("Draw.combineFeatures -- linestring + linestring = multilinestring", () => {
  const [lineId] = Draw.add(getGeoJSON("line"));
  const [line2Id] = Draw.add(getGeoJSON("line2"));
  Draw.changeMode("simple_select", { featureIds: [lineId, line2Id] });

  Draw.combineFeatures();
  assertEquals(Draw.getAll().features.length, 1, "can combine two features");
  assertEquals(
    Draw.getAll().features[0].geometry.type,
    "MultiLineString",
    "can combine two linestrings into MultiLineString",
  );
  assertEquals(
    Draw.getAll().features[0].geometry.coordinates[0],
    getGeoJSON("line").geometry.coordinates,
    "first set of coordinates in multilinestring matches with first line in selection",
  );
  assertEquals(
    Draw.getAll().features[0].geometry.coordinates[1],
    getGeoJSON("line2").geometry.coordinates,
    "second set of coordinates in multilinestring matches with second line selection",
  );
  Draw.deleteAll();
});

test("Draw.combineFeatures -- point + multipoint = multipoint", () => {
  const [pointId] = Draw.add(getGeoJSON("point"));
  const [multipointId] = Draw.add(getGeoJSON("multiPoint"));
  Draw.changeMode("simple_select", { featureIds: [pointId, multipointId] });

  Draw.combineFeatures();
  assertEquals(Draw.getAll().features.length, 1, "can combine two features");
  assertEquals(
    Draw.getAll().features[0].geometry.type,
    "MultiPoint",
    "can combine two points into MultiPoint",
  );
  assertEquals(
    Draw.getAll().features[0].geometry.coordinates[0],
    getGeoJSON("point").geometry.coordinates,
    "first set of coordinates in multipoint matches with first point in selection",
  );
  assertEquals(
    Draw.getAll().features[0].geometry.coordinates[1],
    getGeoJSON("multiPoint").geometry.coordinates[0],
    "second set of coordinates in multipoint matches with first set of coordinates in multipoint in selection",
  );
  assertEquals(
    Draw.getAll().features[0].geometry.coordinates[2],
    getGeoJSON("multiPoint").geometry.coordinates[1],
    "third set of coordinates in multipoint matches with second set of coordinates in multipoint in selection",
  );
  Draw.deleteAll();
});

test("Draw.combineFeatures -- return on non-similar features", () => {
  const [lineId] = Draw.add(getGeoJSON("line"));
  const [polygonId] = Draw.add(getGeoJSON("polygon"));
  Draw.changeMode("simple_select", { featureIds: [lineId, polygonId] });

  Draw.combineFeatures();
  assertEquals(
    Draw.getAll().features.length,
    2,
    "should not combine non similar features",
  );
  Draw.deleteAll();
});

test("Draw.combineFeatures -- do nothing on non-similar features", () => {
  const [lineId] = Draw.add(getGeoJSON("line"));
  const [polygonId] = Draw.add(getGeoJSON("polygon"));
  Draw.changeMode("simple_select", { featureIds: [lineId, polygonId] });

  Draw.combineFeatures();
  assertEquals(
    Draw.getAll().features.length,
    2,
    "should not combine non similar features",
  );
  Draw.deleteAll();
});

test("Draw.combineFeatures -- work for multifeature + feature", () => {
  const [multipolygonId] = Draw.add(getGeoJSON("multiPolygon"));
  const [polygonId] = Draw.add(getGeoJSON("polygon"));
  Draw.changeMode("simple_select", { featureIds: [polygonId, multipolygonId] });

  Draw.combineFeatures();
  assertEquals(
    Draw.getAll().features.length,
    1,
    "should work for multifeature + feature",
  );
  Draw.deleteAll();
});

test("Draw.combineFeatures -- should do nothing if nothing is selected", () => {
  Draw.add(getGeoJSON("multiPolygon"));
  Draw.add(getGeoJSON("polygon"));
  Draw.changeMode("simple_select", {});

  Draw.combineFeatures();
  assertEquals(
    Draw.getAll().features.length,
    2,
    "should do nothing if nothing is selected",
  );
  Draw.deleteAll();
});

test("Draw.uncombineFeatures -- multilinestring", () => {
  const [multiLineStringId] = Draw.add(getGeoJSON("multiLineString"));
  Draw.changeMode("simple_select", { featureIds: [multiLineStringId] });

  Draw.uncombineFeatures();
  const featuresInDraw = Draw.getAll().features;

  assertEquals(featuresInDraw.length, 2, "can uncombine multiLineString");

  assertEquals(
    featuresInDraw[0].geometry.coordinates,
    getGeoJSON("multiLineString").geometry.coordinates[0],
    "first set of coordinates in multilinestring matches with first lineString in selection",
  );

  assertEquals(
    featuresInDraw[1].geometry.coordinates,
    getGeoJSON("multiLineString").geometry.coordinates[1],
    "second set of coordinates in multilinestring matches with second lineString in selection",
  );

  Draw.deleteAll();
});

test("Draw.uncombineFeatures -- multipolygon", () => {
  const [multipolygon2Id] = Draw.add(getGeoJSON("multiPolygon2"));
  Draw.changeMode("simple_select", { featureIds: [multipolygon2Id] });

  Draw.uncombineFeatures();

  const featuresInDraw = Draw.getAll().features;

  assertEquals(featuresInDraw.length, 2, "can uncombine multipolygon");

  assertEquals(
    featuresInDraw[0].geometry.coordinates,
    getGeoJSON("multiPolygon2").geometry.coordinates[0],
    "first set of coordinates in multipolygon matches with first polygon in selection",
  );

  assertEquals(
    featuresInDraw[1].geometry.coordinates,
    getGeoJSON("multiPolygon2").geometry.coordinates[1],
    "second set of coordinates in multipolygon matches with second polygon in selection",
  );

  Draw.deleteAll();
});

test("Draw.uncombineFeatures -- multipoint", () => {
  const [multipointId] = Draw.add(getGeoJSON("multiPoint"));
  Draw.changeMode("simple_select", { featureIds: [multipointId] });

  Draw.uncombineFeatures();

  const featuresInDraw = Draw.getAll().features;

  assertEquals(featuresInDraw.length, 2, "can uncombine multipoint");

  assertEquals(
    featuresInDraw[0].geometry.coordinates,
    getGeoJSON("multiPoint").geometry.coordinates[0],
    "first set of coordinates in multipoint matches with first point in selection",
  );

  assertEquals(
    featuresInDraw[1].geometry.coordinates,
    getGeoJSON("multiPoint").geometry.coordinates[1],
    "second set of coordinates in multipoint matches with second point in selection",
  );

  Draw.deleteAll();
});

test("Draw.uncombineFeatures -- should do nothing if nothing is selected", () => {
  Draw.add(getGeoJSON("multiPolygon"));
  Draw.add(getGeoJSON("polygon"));
  Draw.changeMode("simple_select", {});

  Draw.uncombineFeatures();
  assertEquals(
    Draw.getAll().features.length,
    2,
    "should do nothing if nothing is selected",
  );
  Draw.deleteAll();
});

test("Draw.uncombineFeatures -- should do nothing if nothing if only non multifeature is selected", () => {
  const [polygonId] = Draw.add(getGeoJSON("polygon"));
  const [pointId] = Draw.add(getGeoJSON("point"));
  Draw.changeMode("simple_select", { featureIds: [polygonId, pointId] });

  Draw.uncombineFeatures();
  assertEquals(
    Draw.getAll().features.length,
    2,
    "should do nothing if nothing is selected",
  );
  Draw.deleteAll();
});

test("Draw.setFeatureProperty", () => {
  Draw.add(getGeoJSON("point"));
  const featureId = Draw.getAll().features[0].id;
  const drawInstance = Draw.setFeatureProperty(featureId, "price", 200);
  assertEquals(drawInstance, Draw, "returns Draw instance");
  assertEquals(
    Draw.get(featureId).properties.price,
    200,
    "Draw.setFeatureProperty adds a property",
  );
});

test("Cleanup", () => {
  Draw.deleteAll();
  Draw.onRemove();
});
