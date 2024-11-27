import test from "node:test";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";

import * as commonSelectors from "../src/lib/common_selectors.ts";

test("commonSelectors.isOfMetaType", () => {
  const isFoo = commonSelectors.isOfMetaType("foo");
  assertEquals(typeof isFoo, "function");
  assert(
    isFoo({
      featureTarget: {
        properties: {
          meta: "foo",
        },
      },
    }),
  );
  assertEquals(isFoo({}), false);
  assertEquals(
    isFoo({
      featureTarget: {
        properties: {
          meta: "bar",
        },
      },
    }),
    false,
  );
});

test("commonSelectors.isShiftMousedown", () => {
  assert(
    commonSelectors.isShiftMousedown({
      originalEvent: {
        shiftKey: true,
        button: 0,
      },
    }),
  );

  assertEquals(
    commonSelectors.isShiftMousedown({
      originalEvent: {
        shiftKey: false,
        button: 0,
      },
    }),
    false,
  );

  assertEquals(
    commonSelectors.isShiftMousedown({
      originalEvent: {
        shiftKey: true,
        button: 1,
      },
    }),
    false,
  );

  assertEquals(
    commonSelectors.isShiftMousedown({
      nothing: false,
    }),
    false,
  );
});

test("commonSelectors.isActiveFeature", () => {
  assert(
    commonSelectors.isActiveFeature({
      featureTarget: {
        properties: {
          active: "true",
          meta: "feature",
        },
      },
    }),
  );

  assertEquals(
    commonSelectors.isActiveFeature({
      foo: "bar",
    }),
    false,
  );

  assertEquals(
    commonSelectors.isActiveFeature({
      featureTarget: {
        properties: {
          active: "false",
          meta: "feature",
        },
      },
    }),
    false,
  );

  assertEquals(
    commonSelectors.isActiveFeature({
      featureTarget: {
        properties: {
          active: "true",
          meta: "something",
        },
      },
    }),
    false,
  );

  assertEquals(
    commonSelectors.isActiveFeature({
      featureTarget: {
        properties: {
          active: true,
          meta: "Feature",
        },
      },
    }),
    false,
  );

  assertEquals(
    commonSelectors.isActiveFeature({
      nothing: false,
    }),
    false,
  );

  assertEquals(
    commonSelectors.isActiveFeature({
      featureTarget: {},
    }),
    false,
  );
});

test("commonSelectors.isInactiveFeature", () => {
  assert(
    commonSelectors.isInactiveFeature({
      featureTarget: {
        properties: {
          active: "false",
          meta: "feature",
        },
      },
    }),
  );

  assertEquals(
    commonSelectors.isInactiveFeature({
      foo: "bar",
    }),
    false,
  );

  assertEquals(
    commonSelectors.isInactiveFeature({
      featureTarget: {
        properties: {
          active: "true",
          meta: "feature",
        },
      },
    }),
    false,
  );

  assertEquals(
    commonSelectors.isInactiveFeature({
      featureTarget: {
        properties: {
          active: "false",
          meta: "something",
        },
      },
    }),
    false,
  );

  assertEquals(
    commonSelectors.isInactiveFeature({
      featureTarget: {
        properties: {
          active: false,
          meta: "Feature",
        },
      },
    }),
    false,
  );

  assertEquals(
    commonSelectors.isInactiveFeature({
      nothing: false,
    }),
    false,
  );

  assertEquals(
    commonSelectors.isInactiveFeature({
      featureTarget: {},
    }),
    false,
  );
});

test("commonSelectors.noTarget", () => {
  assert(
    commonSelectors.noTarget({
      something: 1,
    }),
  );

  assert(
    commonSelectors.noTarget({
      FeatureTarget: 1,
    }),
  );

  assertEquals(
    commonSelectors.noTarget({
      featureTarget: {},
    }),
    false,
  );

  assertEquals(
    commonSelectors.noTarget({
      featureTarget: null,
    }),
    false,
  );
});

test("commonSelectors.isFeature", () => {
  assert(
    commonSelectors.isFeature({
      featureTarget: {
        properties: {
          meta: "feature",
        },
      },
    }),
  );

  assertEquals(
    commonSelectors.isFeature({
      feee: 2,
    }),
    false,
  );

  assertEquals(
    commonSelectors.isFeature({
      featureTarget: {
        properties: {
          meta: "nonfeature",
        },
      },
    }),
    false,
  );

  assertEquals(
    commonSelectors.isFeature({
      nothing: false,
    }),
    false,
  );

  assertEquals(
    commonSelectors.isFeature({
      featureTarget: {},
    }),
    false,
  );
});

test("commonSelectors.isShiftDown", () => {
  assert(
    commonSelectors.isShiftDown({
      originalEvent: {
        shiftKey: true,
      },
    }),
  );

  assertEquals(
    commonSelectors.isShiftDown({
      originalEvent: {
        shiftKey: false,
      },
    }),
    false,
  );

  assertEquals(
    commonSelectors.isShiftDown({
      originalEvent: {},
    }),
    false,
  );

  assertEquals(
    commonSelectors.isShiftDown({
      nothing: true,
    }),
    false,
  );
});

test("commonSelectors.isEscapeKey", () => {
  assert(
    commonSelectors.isEscapeKey({
      keyCode: 27,
    }),
  );

  assertEquals(
    commonSelectors.isEscapeKey({
      keyCode: 13,
    }),
    false,
  );

  assertEquals(
    commonSelectors.isEscapeKey({
      originalEvent: {},
    }),
    false,
  );
});

test("commonSelectors.isEnterKey", () => {
  assert(
    commonSelectors.isEnterKey({
      keyCode: 13,
    }),
  );

  assertEquals(
    commonSelectors.isEnterKey({
      keyCode: 27,
    }),
    false,
  );

  assertEquals(
    commonSelectors.isEnterKey({
      originalEvent: {},
    }),
    false,
  );
});

test("commonSelectors.true", () => {
  assert(commonSelectors.isTrue());
  assert(commonSelectors.isTrue(false));
});
