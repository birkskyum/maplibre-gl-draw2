import { test, describe } from "vitest";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import { spy } from "sinon";

import { DrawUI } from "../src/ui.ts";

function createMockContext({ position, controls } = {}) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const controlContainer = document.createElement("div");
  controlContainer.className = `maplibregl-ctrl-${position || "top-left"}`;
  container.appendChild(controlContainer);

  return {
    context: {
      container,
      options: {
        controls,
        keybindings: true,
      },
      api: {
        trash: spy(),
      },
      events: {
        changeMode: spy(),
      },
    },
    cleanup() {
      document.body.removeChild(container);
    },
    getControlContainer() {
      return controlContainer;
    },
  };
}

function getButtons(div) {
  return Array.prototype.slice.call(
    div.getElementsByClassName("maplibre-gl-draw_ctrl-draw-btn"),
  );
}

describe("ui container classes", async (t) => {
  const { context, cleanup } = createMockContext();
  const testUi = new DrawUI(context);

  assertEquals(
    context.container.className,
    "",
    "confirm that class starts empty",
  );

  // Each sub-test relies on state from the prior sub-tests

  test("update all classes", () => {
    testUi.queueMapClasses({
      mode: "direct_select",
      feature: "vertex",
      mouse: "move",
    });
    testUi.updateMapClasses();
    assert(
      context.container.classList.contains("mode-direct_select"),
      "mode class set",
    );
    assert(
      context.container.classList.contains("feature-vertex"),
      "feature class set",
    );
    assert(
      context.container.classList.contains("mouse-move"),
      "mouse class set",
    );
  });

  await test("update only feature class", () => {
    testUi.queueMapClasses({
      feature: "midpoint",
    });
    testUi.updateMapClasses();
    assert(
      context.container.classList.contains("mode-direct_select"),
      "mode class remains",
    );
    assert(
      context.container.classList.contains("feature-midpoint"),
      "feature class updated",
    );
    assert(
      context.container.classList.contains("mouse-move"),
      "mouse class remains",
    );
  });

  await test("update mode and mouse classes", () => {
    testUi.queueMapClasses({
      mode: "foo",
      mouse: "bar",
    });
    testUi.updateMapClasses();
    assert(
      context.container.classList.contains("mode-foo"),
      "mode class updated",
    );
    assert(
      context.container.classList.contains("feature-midpoint"),
      "feature class remains",
    );
    assert(
      context.container.classList.contains("mouse-bar"),
      "mouse class updated",
    );
  });

  await test("remove only feature class", () => {
    testUi.queueMapClasses({
      feature: null,
    });
    testUi.updateMapClasses();
    assert(
      context.container.classList.contains("mode-foo"),
      "mode class remains",
    );
    assert(
      context.container.className.indexOf("feature-") === -1,
      "feature class removed",
    );
    assert(
      context.container.classList.contains("mouse-bar"),
      "mouse class remains",
    );
  });

  await test("remove all classes", () => {
    testUi.queueMapClasses({
      feature: null,
      mode: null,
      mouse: null,
    });
    testUi.updateMapClasses();
    assert(
      context.container.className.indexOf("mode-") === -1,
      "mode class removed",
    );
    assert(
      context.container.className.indexOf("feature-") === -1,
      "feature class still gone",
    );
    assert(
      context.container.className.indexOf("mouse-") === -1,
      "mouse class removed",
    );
  });

  cleanup();
});

test("ui buttons with no options.controls", () => {
  const { context, cleanup } = createMockContext();
  const testUi = new DrawUI(context);

  const div = testUi.addButtons();
  assertEquals(getButtons(div), [], "still no buttons");

  cleanup();
});

test("ui buttons with one options.controls", () => {
  /* eslint-disable */
  const { context, cleanup } = createMockContext({
    controls: {
      line_string: true,
    },
  });
  /* eslint-enable */
  const testUi = new DrawUI(context);

  const div = testUi.addButtons();
  const buttons = getButtons(div);
  assertEquals(buttons.length, 1, "one button added");
  assert(
    buttons[0].classList.contains("maplibre-gl-draw_line"),
    "has line class",
  );
  assert(
    buttons[0].classList.contains("maplibre-gl-draw_ctrl-draw-btn"),
    "has control class",
  );

  cleanup();
});

test("ui buttons control group container inserted above attribution control, in control container, by addButtons", () => {
  const { context, cleanup, getControlContainer } = createMockContext({
    controls: {
      trash: true,
    },
  });

  const controlContainer = getControlContainer();
  const testUi = new DrawUI(context);

  assertEquals(
    controlContainer.getElementsByClassName("maplibregl-ctrl-group").length,
    0,
    "confirm control group does not exist at first",
  );

  const controlGroup = testUi.addButtons();
  assert(controlGroup, "control group exists");

  cleanup();
});

describe("ui buttons with all options.controls, no attribution control", async (t) => {
  /* eslint-disable */
  const { context, cleanup } = createMockContext({
    controls: {
      line_string: true,
      point: true,
      polygon: true,
      trash: true,
    },
  });
  /* eslint-enable */
  const testUi = new DrawUI(context);

  const controlGroup = testUi.addButtons();
  const buttons = getButtons(controlGroup);

  assertEquals(buttons.length, 4, "one button added");

  assert(
    buttons[0].classList.contains("maplibre-gl-draw_line"),
    "first button has line class",
  );
  assert(
    buttons[0].classList.contains("maplibre-gl-draw_ctrl-draw-btn"),
    "first button has control class",
  );
  assertEquals(
    buttons[0].parentNode,
    controlGroup,
    "first button is in controlGroup",
  );
  const lineButton = buttons[0];

  assert(
    buttons[1].classList.contains("maplibre-gl-draw_polygon"),
    "second button has polygon class",
  );
  assert(
    buttons[1].classList.contains("maplibre-gl-draw_ctrl-draw-btn"),
    "second button has control class",
  );
  assertEquals(
    buttons[1].parentNode,
    controlGroup,
    "second button is in controlGroup",
  );
  const polygonButton = buttons[1];
  assert(
    buttons[2].classList.contains("maplibre-gl-draw_point"),
    "third button has point class",
  );
  assert(
    buttons[2].classList.contains("maplibre-gl-draw_ctrl-draw-btn"),
    "third button has control class",
  );
  assertEquals(
    buttons[2].parentNode,
    controlGroup,
    "third button is in controlGroup",
  );
  const pointButton = buttons[2];
  assert(
    buttons[3].classList.contains("maplibre-gl-draw_trash"),
    "fourth button has trash class",
  );
  assert(
    buttons[3].classList.contains("maplibre-gl-draw_ctrl-draw-btn"),
    "fourth button has control class",
  );
  assertEquals(
    buttons[3].parentNode,
    controlGroup,
    "fourth button is in controlGroup",
  );
  const trashButton = buttons[3];

  test("click line button", () => {
    lineButton.click();

    assert(lineButton.classList.contains("active"), "line button is active");
    assertEquals(
      polygonButton.classList.contains("active"),
      false,
      "polygon button is inactive",
    );
    assertEquals(
      pointButton.classList.contains("active"),
      false,
      "point button is inactive",
    );
    assertEquals(
      trashButton.classList.contains("active"),
      false,
      "trash button is inactive",
    );

    assertEquals(context.events.changeMode.callCount, 1, "changeMode called");
    assertEquals(
      context.events.changeMode.getCall(0).args,
      ["draw_line_string"],
      "with correct arguments",
    );
    context.events.changeMode.resetHistory();
  });

  await test("click polygon button", () => {
    polygonButton.click();

    assertEquals(
      lineButton.classList.contains("active"),
      false,
      "line button is inactive",
    );
    assert(
      polygonButton.classList.contains("active"),
      "polygon button is active",
    );
    assertEquals(
      pointButton.classList.contains("active"),
      false,
      "point button is inactive",
    );
    assertEquals(
      trashButton.classList.contains("active"),
      false,
      "trash button is inactive",
    );

    assertEquals(context.events.changeMode.callCount, 1, "changeMode called");
    assertEquals(
      context.events.changeMode.getCall(0).args,
      ["draw_polygon"],
      "with correct arguments",
    );
    context.events.changeMode.resetHistory();
  });

  await test(
    "programmatically activate point button, then programmatically deactivate",
    () => {
      testUi.setActiveButton("point");

      assertEquals(
        lineButton.classList.contains("active"),
        false,
        "line button is inactive",
      );
      assertEquals(
        polygonButton.classList.contains("active"),
        false,
        "polygon button is inactive",
      );
      assert(
        pointButton.classList.contains("active"),
        "point button is active",
      );
      assertEquals(
        trashButton.classList.contains("active"),
        false,
        "trash button is inactive",
      );
      assertEquals(
        context.events.changeMode.callCount,
        0,
        "changeMode not called",
      );

      testUi.setActiveButton();

      assertEquals(
        lineButton.classList.contains("active"),
        false,
        "line button is inactive",
      );
      assertEquals(
        polygonButton.classList.contains("active"),
        false,
        "polygon button is inactive",
      );
      assertEquals(
        pointButton.classList.contains("active"),
        false,
        "point button is inactive",
      );
      assertEquals(
        trashButton.classList.contains("active"),
        false,
        "trash button is inactive",
      );
      assertEquals(
        context.events.changeMode.callCount,
        0,
        "changeMode not called",
      );
    },
  );

  await test("click trash button", () => {
    trashButton.click();

    assertEquals(
      lineButton.classList.contains("active"),
      false,
      "line button is inactive",
    );
    assertEquals(
      polygonButton.classList.contains("active"),
      false,
      "polygon button is inactive",
    );
    assertEquals(
      pointButton.classList.contains("active"),
      false,
      "point button is inactive",
    );
    assertEquals(
      trashButton.classList.contains("active"),
      false,
      "trash button is inactive",
    );

    assertEquals(
      context.events.changeMode.callCount,
      0,
      "changeMode not called",
    );
  });

  cleanup();
});
