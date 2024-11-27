import test from "node:test";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";

import { spy } from "sinon";
import { Feat } from "../src/feature_types/feature.ts";
import { createFeature } from "./utils/create_feature.ts";
import { getPublicMemberKeys } from "./utils/get_public_member_keys.ts";
import { createMockFeatureContext } from "./utils/create_mock_feature_context.ts";

test("Feature contrusctor and API", () => {
  const featureGeoJson = createFeature("line");
  const ctx = createMockFeatureContext();
  const feature = new Feat(ctx, featureGeoJson);

  // Instance members
  assertEquals(feature.ctx, ctx, "feature.ctx");
  assertEquals(
    feature.coordinates,
    featureGeoJson.geometry.coordinates,
    "feature.coordinates",
  );
  assertEquals(
    feature.properties,
    featureGeoJson.properties,
    "feature.properties",
  );
  assertEquals(feature.id, featureGeoJson.id, "feature.id");
  assertEquals(feature.type, featureGeoJson.geometry.type, "feature.type");
  assertEquals(
    getPublicMemberKeys(feature).length,
    5,
    "no unexpected instance members",
  );

  // Prototype members
  assertEquals(
    typeof Feat.prototype.changed,
    "function",
    "feature.changed",
  );
  assertEquals(
    typeof Feat.prototype.incomingCoords,
    "function",
    "feature.incomingCoords",
  );
  assertEquals(
    typeof Feat.prototype.setCoordinates,
    "function",
    "feature.setCoordinates",
  );
  assertEquals(
    typeof Feat.prototype.getCoordinates,
    "function",
    "feature.getCoordinates",
  );
  assertEquals(
    typeof Feat.prototype.toGeoJSON,
    "function",
    "feature.toGeoJSON",
  );
  assertEquals(
    typeof Feat.prototype.internal,
    "function",
    "feature.internal",
  );
  assertEquals(
    typeof Feat.prototype.setProperty,
    "function",
    "feature.setProperty",
  );
  assertEquals(
    Object.getOwnPropertyNames(Feat.prototype).length,
    9,
    "no unexpected prototype members",
  );

  const simpleFeatureGeoJson = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [0, 0],
    },
  };
  const featureWithDefaultsOnly = new Feat(ctx, simpleFeatureGeoJson);
  assertEquals(
    featureWithDefaultsOnly.properties,
    {},
    "feature.properties defaults to {}",
  );
  assert(featureWithDefaultsOnly.id, "feature.id is provided");
});

test("Feature#changed", () => {
  const ctx = createMockFeatureContext();
  const featureGeoJson = createFeature("point");
  const feature = new Feat(ctx, featureGeoJson);

  ctx.store.featureChanged.resetHistory();
  feature.changed();
  assertEquals(
    ctx.store.featureChanged.callCount,
    1,
    "called function on store",
  );
  assertEquals(
    ctx.store.featureChanged.getCall(0).args,
    [featureGeoJson.id],
    "with correct args",
  );
});

test("Feature#incomingCoords", () => {
  const ctx = createMockFeatureContext();
  const featureGeoJson = createFeature("point");
  featureGeoJson.geometry.coordinates = [9, 10];
  const feature = new Feat(ctx, featureGeoJson);
  const changedSpy = spy(feature, "changed");

  feature.incomingCoords([1, 2]);
  assertEquals(feature.coordinates, [1, 2]);
  assertEquals(changedSpy.callCount, 1);
});

test("Feature#setCoordinates, Feature#setCoordinates", () => {
  const ctx = createMockFeatureContext();
  const featureGeoJson = createFeature("point");
  featureGeoJson.geometry.coordinates = [9, 10];
  const feature = new Feat(ctx, featureGeoJson);
  const changedSpy = spy(feature, "changed");

  assertEquals(feature.getCoordinates(), [9, 10]);

  feature.setCoordinates([1, 2]);
  assertEquals(feature.coordinates, [1, 2]);
  assertEquals(feature.getCoordinates(), [1, 2]);
  assertEquals(changedSpy.callCount, 1);
});

test("Feature#toGeoJSON", () => {
  const ctx = createMockFeatureContext();
  const polygon = createFeature("polygon");
  const feature = new Feat(ctx, polygon);
  assertEquals(feature.toGeoJSON(), {
    id: feature.id,
    type: "Feature",
    properties: feature.properties,
    geometry: {
      coordinates: feature.coordinates,
      type: feature.type,
    },
  });
});

test("Feature#internal - when userProperties is true", () => {
  const ctx = createMockFeatureContext({ userProperties: true });
  const polygon = createFeature("polygon");
  const feature = new Feat(ctx, polygon);
  assertEquals(feature.internal("foo"), {
    type: "Feature",
    properties: {
      user_a: "b",
      user_c: "d",
      id: feature.id,
      meta: "feature",
      "meta:type": feature.type,
      active: "false",
      mode: "foo",
    },
    geometry: {
      coordinates: feature.coordinates,
      type: feature.type,
    },
  });
});
test("Feature#internal - when userProperties is false", () => {
  const ctx = createMockFeatureContext({ userProperties: false });
  const polygon = createFeature("polygon");
  const feature = new Feat(ctx, polygon);
  assertEquals(feature.internal("foo"), {
    type: "Feature",
    properties: {
      id: feature.id,
      meta: "feature",
      "meta:type": feature.type,
      active: "false",
      mode: "foo",
    },
    geometry: {
      coordinates: feature.coordinates,
      type: feature.type,
    },
  });
});

test("Feature#setProperty", () => {
  const ctx = createMockFeatureContext();
  const polygon = createFeature("polygon");
  const feature = new Feat(ctx, polygon);
  feature.setProperty("size", 200);
  assertEquals(feature.properties.size, 200);
});
