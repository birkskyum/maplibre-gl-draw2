import { test, describe } from "vitest";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import { spy } from "sinon";

import { DrawStore } from "../src/store.ts";
import { createFeature } from "./utils/create_feature.ts";
import { getPublicMemberKeys } from "./utils/get_public_member_keys.ts";
import { createMap } from "./utils/create_map.ts";

function createStore() {
  const ctx = {
    map: createMap(),
    events: {
      fire: spy(),
    },
  };

  return new DrawStore(ctx);
}

test("Store has correct properties", () => {
  assert(DrawStore, "store exists");
  assert(typeof DrawStore === "function", "store is a function");
});

test("Store constructor and public API", () => {
  const map = createMap();
  const ctx = { map };
  const store = new DrawStore(ctx);

  // instance members
  assertEquals(
    store.sources,
    {
      hot: [],
      cold: [],
    },
    "exposes store.sources",
  );
  assertEquals(store.ctx, ctx, "exposes store.ctx");
  assertEquals(store.ctx.map, map, "exposes store.ctx.map");
  assertEquals(store.isDirty, false, "exposes store.isDirty");
  assertEquals(typeof store.render, "function", "exposes store.render");

  assertEquals(
    getPublicMemberKeys(store).length,
    4,
    "no unexpected instance members",
  );

  // prototype members
  assertEquals(
    typeof DrawStore.prototype.setDirty,
    "function",
    "exposes store.setDirty",
  );
  assertEquals(
    typeof DrawStore.prototype.createRenderBatch,
    "function",
    "exposes store.createRenderBatch",
  );
  assertEquals(
    typeof DrawStore.prototype.featureChanged,
    "function",
    "exposes store.featureChanged",
  );
  assertEquals(
    typeof DrawStore.prototype.getChangedIds,
    "function",
    "exposes store.getChangedIds",
  );
  assertEquals(
    typeof DrawStore.prototype.clearChangedIds,
    "function",
    "exposes store.clearChangedIds",
  );
  assertEquals(
    typeof DrawStore.prototype.getAllIds,
    "function",
    "exposes store.getAllIds",
  );
  assertEquals(typeof DrawStore.prototype.add, "function", "exposes store.add");
  assertEquals(typeof DrawStore.prototype.get, "function", "exposes store.get");
  assertEquals(
    typeof DrawStore.prototype.getAll,
    "function",
    "exposes store.getAll",
  );
  assertEquals(
    typeof DrawStore.prototype.select,
    "function",
    "exposes store.select",
  );
  assertEquals(
    typeof DrawStore.prototype.deselect,
    "function",
    "exposes store.deselect",
  );
  assertEquals(
    typeof DrawStore.prototype.clearSelected,
    "function",
    "exposes store.clearSelected",
  );
  assertEquals(
    typeof DrawStore.prototype.getSelectedIds,
    "function",
    "exposes store.getSelectedIds",
  );
  assertEquals(
    typeof DrawStore.prototype.getSelected,
    "function",
    "exposes store.getSelected",
  );
  assertEquals(
    typeof DrawStore.prototype.isSelected,
    "function",
    "exposes store.isSelected",
  );
  assertEquals(
    typeof DrawStore.prototype.delete,
    "function",
    "exposes store.delete",
  );
  assertEquals(
    typeof DrawStore.prototype.setSelected,
    "function",
    "exposes store.setSelected",
  );
  assertEquals(
    typeof DrawStore.prototype.setSelectedCoordinates,
    "function",
    "exposes store.setSelectedCoordinates",
  );
  assertEquals(
    typeof DrawStore.prototype.getSelectedCoordinates,
    "function",
    "exposes store.getSelectedCoordinates",
  );
  assertEquals(
    typeof DrawStore.prototype.clearSelectedCoordinates,
    "function",
    "exposes store.clearSelectedCoordinates",
  );
  assertEquals(
    typeof DrawStore.prototype.setFeatureProperty,
    "function",
    "exposes store.setFeatureProperty",
  );
  assertEquals(
    typeof DrawStore.prototype.storeMapConfig,
    "function",
    "exposes store.storeMapConfig",
  );
  assertEquals(
    typeof DrawStore.prototype.restoreMapConfig,
    "function",
    "exposes store.restoreMapConfig",
  );
  assertEquals(
    typeof DrawStore.prototype.getInitialConfigValue,
    "function",
    "exposes store.getInitialConfigValue",
  );

  assertEquals(
    Object.getOwnPropertyNames(DrawStore.prototype).length,
    26,
    "no untested prototype members",
  );
});

test("Store#setDirty", () => {
  const store = createStore();
  assertEquals(store.isDirty, false);
  store.setDirty();
  assertEquals(store.isDirty, true);
});

test("Store#createRenderBatch", () => {
  const store = createStore();
  let numRenders = 0;
  store.render = function () {
    numRenders++;
  };
  store.render();
  assertEquals(numRenders, 1, "render incrementes number of renders");
  let renderBatch = store.createRenderBatch();
  store.render();
  store.render();
  store.render();
  assertEquals(numRenders, 1, "when batching render doesn't get incremented");
  renderBatch();
  assertEquals(numRenders, 2, "when releasing batch, render only happens once");

  renderBatch = store.createRenderBatch();
  renderBatch();
  assertEquals(
    numRenders,
    2,
    "when releasing batch, render doesn't happen if render wasn't called",
  );
});

test("Store#featureChanged, Store#getChangedIds, Store#clearChangedIds", () => {
  const store = createStore();
  assertEquals(store.getChangedIds(), []);
  store.featureChanged("x");
  assertEquals(store.getChangedIds(), ["x"]);
  store.featureChanged("y");
  assertEquals(store.getChangedIds(), ["x", "y"]);
  store.featureChanged("x");
  assertEquals(store.getChangedIds(), ["x", "y"], "ids do not duplicate");
  store.clearChangedIds();
  assertEquals(store.getChangedIds(), []);
});

test("Store#add, Store#get, Store#getAll", () => {
  const store = createStore();
  assertEquals(store.get(1), undefined);
  assertEquals(store.getAll(), []);
  const point = createFeature("point");
  const line = createFeature("line");
  store.add(point);
  assertEquals(store.get(point.id), point);
  assertEquals(store.getAll(), [point]);
  store.add(line);
  assertEquals(store.get(point.id), point);
  assertEquals(store.get(line.id), line);
  assertEquals(store.getAll(), [point, line]);
  store.add(point);
  assertEquals(store.get(point.id), point);
  assertEquals(store.get(line.id), line);
  assertEquals(store.getAll(), [point, line]);
});

describe("selection methods", async (t) => {
  const store = createStore();
  const f1 = createFeature("point");
  store.add(f1);
  const f2 = createFeature("point");
  store.add(f2);
  const f3 = createFeature("point");
  store.add(f3);
  const f4 = createFeature("point");
  store.add(f4);

  assertEquals(store.getSelectedIds(), []);

  test("select one feature", () => {
    store.select(f1.id);
    assertEquals(
      store.getSelectedIds(),
      [f1.id],
      "f1 returns in selected ids array",
    );
    assertEquals(
      store.getSelected(),
      [f1.toGeoJSON()],
      "f1 returns in selected array",
    );
    assertEquals(store.isSelected(f1.id), true, "isSelected affirms f1");
    assertEquals(store.isSelected(f2.id), false, "isSelected rejects f2");
  });

  await test("select a second feature", () => {
    store.select(f2.id);
    assertEquals(
      store.getSelectedIds(),
      [f1.id, f2.id],
      "f1 and f2 return in selected ids array",
    );
    assertEquals(
      store.getSelected(),
      [f1, f2],
      "f1 and f2 return in selected array",
    );
    assertEquals(store.isSelected(f1.id), true, "isSelected affirms f1");
    assertEquals(store.isSelected(f2.id), true, "isSelected affirms f2");
  });

  await test("try to re-select first feature", () => {
    store.select(f1.id);
  });

  await test("deselect a feature", () => {
    store.deselect(f1.id);
    assertEquals(
      store.getSelectedIds(),
      [f2.id],
      "deselection of f1 clears it from selected array",
    );
  });

  await test("serially select more features", () => {
    store.select(f3.id);
    store.select(f4.id);
    assertEquals(
      store.getSelectedIds(),
      [f2.id, f3.id, f4.id],
      "serial selection of f3 and f4 reflected in selected array",
    );
  });

  await test("clear selection", () => {
    store.clearSelected();
    assertEquals(store.getSelectedIds(), []);
  });

  test("select an array of features", () => {
    store.select([f1.id, f3.id, f4.id]);
    assertEquals(store.getSelectedIds(), [f1.id, f3.id, f4.id]);
  });

  await test("deselect an array of features", () => {
    store.deselect([f1.id, f4.id]);
    assertEquals(store.getSelectedIds(), [f3.id]);
  });
});

test("Store#delete", () => {
  const store = createStore();
  const point = createFeature("point");
  const line = createFeature("line");
  const polygon = createFeature("polygon");

  store.add(point);
  store.add(line);
  store.add(polygon);
  assertEquals(store.getAll(), [point, line, polygon]);
  assertEquals(store.getAllIds(), [point.id, line.id, polygon.id]);

  assertEquals(store.getSelectedIds(), []);
  store.select(line.id);
  assertEquals(store.getSelectedIds(), [line.id]);

  store.delete(line.id);
  assertEquals(store.getAll(), [point, polygon]);
  assertEquals(store.getAllIds(), [point.id, polygon.id]);
  assertEquals(store.getSelectedIds(), []);
  assertEquals(store.isDirty, true, "after deletion store is dirty");
});

test("Store#setSelected", () => {
  const store = createStore();
  const point = createFeature("point");
  const line = createFeature("line");
  const polygon = createFeature("polygon");

  store.setSelected(point.id, { silent: true });
  assertEquals(store.getSelectedIds(), [point.id]);

  store.setSelected([line.id, polygon.id], { silent: true });
  assertEquals(store.getSelectedIds(), [line.id, polygon.id]);

  store.setSelected(line.id, { silent: true });
  assertEquals(store.getSelectedIds(), [line.id]);

  store.setSelected(undefined, { silent: true });
  assertEquals(store.getSelectedIds(), []);
});

test("Store#setFeatureProperty", () => {
  const store = createStore();
  const point = createFeature("point");

  store.add(point);
  store.clearChangedIds();
  store.setFeatureProperty(point.id, "size", 200);
  assertEquals(store.getChangedIds(), [point.id]);
  assertEquals(
    store.get(point.id).properties.size,
    200,
    "sets the property on the feature",
  );
});

test("Store#storeAndRestoreMapConfig", () => {
  const map = createMap();
  // Disable doubleClickZoom
  map.doubleClickZoom.disable();
  // Check it's disabled
  assertEquals(
    map.doubleClickZoom.isEnabled(),
    false,
    "Disables doubleClickZoom on the map",
  );
  const ctx = { map };
  const store = new DrawStore(ctx);
  store.storeMapConfig();
  // Check we can get the initial state of it
  assertEquals(
    store.getInitialConfigValue("doubleClickZoom"),
    false,
    "Retrieves the initial value for the doubleClickZoom",
  );
  // Enable it again, byt then use restore to reset the initial state
  map.doubleClickZoom.enable();
  store.restoreMapConfig();
  assertEquals(
    map.doubleClickZoom.isEnabled(),
    false,
    "Restores doubleClickZoom on the map",
  );
});
