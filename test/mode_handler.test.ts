import { test } from "vitest";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import { spy } from "sinon";
import { ModeHandler } from "../src/lib/mode_handler.ts";
import { createMockModeHandlerContext } from "./utils/create_mock_mode_handler_context.ts";
import { createMockMode } from "./utils/create_mock_mode.ts";

test("returned API", () => {
  const mh = ModeHandler(createMockMode(), createMockModeHandlerContext());
  assertEquals(typeof mh.render, "function", "exposes render");
  assertEquals(typeof mh.stop, "function", "exposes stop");
  assertEquals(typeof mh.trash, "function", "exposes trash");
  assertEquals(typeof mh.drag, "function", "exposes drag");
  assertEquals(typeof mh.click, "function", "exposes click");
  assertEquals(typeof mh.mousemove, "function", "exposes mousemove");
  assertEquals(typeof mh.mousedown, "function", "exposes mousedown");
  assertEquals(typeof mh.mouseup, "function", "exposes mouseup");
  assertEquals(typeof mh.mouseout, "function", "exposes mouseout");
  assertEquals(typeof mh.keydown, "function", "exposes keydown");
  assertEquals(typeof mh.keyup, "function", "exposes keyup");
  assertEquals(typeof mh.touchstart, "function", "exposes touchstart");
  assertEquals(typeof mh.touchmove, "function", "exposes touchmove");
  assertEquals(typeof mh.touchend, "function", "exposes touchend");
  assertEquals(typeof mh.tap, "function", "exposes tap");
  assertEquals(
    typeof mh.combineFeatures,
    "function",
    "exposes combineFeatures",
  );
  assertEquals(
    typeof mh.uncombineFeatures,
    "function",
    "exposes uncombineFeatures",
  );
  assertEquals(Object.keys(mh).length, 17, "no unexpected properties");
});

test("ModeHandler calling mode.start with context, and delegation functionality", () => {
  let startContext;
  function handleStart() {
    // eslint-disable-next-line
    startContext = this;
  }
  const handleStartSpy = spy(handleStart);
  const mode = Object.assign(createMockMode(), {
    start: handleStartSpy,
  });
  const drawContext = createMockModeHandlerContext();

  const mh = ModeHandler(mode, drawContext);
  assertEquals(
    handleStartSpy.callCount,
    1,
    "start was called on mode handler creation",
  );
  assertEquals(typeof startContext.on, "function", "start context has on()");
  assertEquals(
    typeof startContext.render,
    "function",
    "start context has render()",
  );
  assertEquals(
    Object.keys(startContext).length,
    2,
    "start context has no unexpected properties",
  );

  startContext.render("foo");
  assert(
    drawContext.store.featureChanged.calledWith("foo"),
    "start context render calls store.featureChanged",
  );

  assertThrows(() => {
    startContext.on(
      "bar",
      () => true,
      () => {},
    );
  }, "start context on throws on unknown event type");

  mh.mousedown({ one: 1 });
  assertEquals(
    drawContext.store.render.callCount,
    0,
    "render not called if no handler fires",
  );
  assertEquals(
    drawContext.ui.updateMapClasses.callCount,
    0,
    "updateMapClasses not called if no handler fires",
  );

  const mousedownSpy = spy();
  startContext.on("mousedown", () => true, mousedownSpy);
  mh.mousedown({ two: 2 });
  assertEquals(
    mousedownSpy.callCount,
    1,
    "mousedown callback called via delegation",
  );
  assertEquals(
    mousedownSpy.getCall(0).args,
    [{ two: 2 }],
    "with correct argument",
  );
  assertEquals(
    drawContext.store.render.callCount,
    1,
    "render called if handler fires",
  );
  assertEquals(
    drawContext.ui.updateMapClasses.callCount,
    1,
    "updateMapClasses called if handler fires",
  );

  const mousedownFailSpy = spy();
  mousedownSpy.resetHistory();
  startContext.on("mousedown", (e) => !e.three, mousedownFailSpy);
  mh.mousedown({ three: 3 });
  assertEquals(
    mousedownFailSpy.callCount,
    0,
    "delegation only calls callbacks with selectors returning true",
  );
  assertEquals(mousedownSpy.callCount, 1);
  assertEquals(mousedownSpy.getCall(0).args, [{ three: 3 }]);

  const dragSpy = spy();
  startContext.on("drag", () => true, dragSpy);
  mh.drag({ two: 2 });
  assertEquals(dragSpy.callCount, 1, "drag callback called via delegation");
  assertEquals(
    dragSpy.getCall(0).args,
    [{ two: 2 }],
    "with correct argument",
  );

  const clickSpy = spy();
  startContext.on("click", () => true, clickSpy);
  mh.click({ two: 2 });
  assertEquals(clickSpy.callCount, 1, "click callback called via delegation");
  assertEquals(
    clickSpy.getCall(0).args,
    [{ two: 2 }],
    "with correct argument",
  );

  const mousemoveSpy = spy();
  startContext.on("mousemove", () => true, mousemoveSpy);
  mh.mousemove({ two: 2 });
  assertEquals(
    mousemoveSpy.callCount,
    1,
    "mousemove callback called via delegation",
  );
  assertEquals(
    mousemoveSpy.getCall(0).args,
    [{ two: 2 }],
    "with correct argument",
  );

  const mouseupSpy = spy();
  startContext.on("mouseup", () => true, mouseupSpy);
  mh.mouseup({ two: 2 });
  assertEquals(
    mouseupSpy.callCount,
    1,
    "mouseup callback called via delegation",
  );
  assertEquals(
    mouseupSpy.getCall(0).args,
    [{ two: 2 }],
    "with correct argument",
  );

  const mouseoutSpy = spy();
  startContext.on("mouseout", () => true, mouseoutSpy);
  mh.mouseout({ two: 2 });
  assertEquals(
    mouseoutSpy.callCount,
    1,
    "mouseout callback called via delegation",
  );
  assertEquals(
    mouseoutSpy.getCall(0).args,
    [{ two: 2 }],
    "with correct argument",
  );

  const keydownSpy = spy();
  startContext.on("keydown", () => true, keydownSpy);
  mh.keydown({ two: 2 });
  assertEquals(
    keydownSpy.callCount,
    1,
    "keydown callback called via delegation",
  );
  assertEquals(
    keydownSpy.getCall(0).args,
    [{ two: 2 }],
    "with correct argument",
  );

  const keyupSpy = spy();
  startContext.on("keyup", () => true, keyupSpy);
  mh.keyup({ two: 2 });
  assertEquals(keyupSpy.callCount, 1, "keyup callback called via delegation");
  assertEquals(
    keyupSpy.getCall(0).args,
    [{ two: 2 }],
    "with correct argument",
  );

  const touchstartSpy = spy();
  startContext.on("touchstart", () => true, touchstartSpy);
  mh.touchstart({ two: 2 });
  assertEquals(
    touchstartSpy.callCount,
    1,
    "touchstart callback called via delegation",
  );
  assertEquals(
    touchstartSpy.getCall(0).args,
    [{ two: 2 }],
    "with correct argument",
  );

  const touchmoveSpy = spy();
  startContext.on("touchmove", () => true, touchmoveSpy);
  mh.touchmove({ two: 2 });
  assertEquals(
    touchmoveSpy.callCount,
    1,
    "touchmove callback called via delegation",
  );
  assertEquals(
    touchmoveSpy.getCall(0).args,
    [{ two: 2 }],
    "with correct argument",
  );

  const touchendSpy = spy();
  startContext.on("touchend", () => true, touchendSpy);
  mh.touchend({ two: 2 });
  assertEquals(
    touchendSpy.callCount,
    1,
    "touchend callback called via delegation",
  );
  assertEquals(
    touchendSpy.getCall(0).args,
    [{ two: 2 }],
    "with correct argument",
  );
});

test("ModeHandler#stop calling mode.stop", () => {
  const mode = createMockMode();
  const mh = ModeHandler(mode, createMockModeHandlerContext());

  mh.stop();
  assertEquals(mode.stop.callCount, 1, "mode.stop called");
});

test("ModeHandler#stop not calling nonexistent mode.stop", () => {
  const mode = createMockMode();
  delete mode.stop;
  const mh = ModeHandler(mode, createMockModeHandlerContext());

  try {
    mh.stop();
  } catch (e) {
    throw e
  }
});

test("Modehandler#trash", () => {
  const mode = createMockMode();
  const drawContext = createMockModeHandlerContext();
  const mh = ModeHandler(mode, drawContext);

  mh.trash();
  assertEquals(mode.trash.callCount, 1, "mode.trash called");
  assertEquals(drawContext.store.render.callCount, 1, "store.render called");
});

test("Modehandler#trash without a mode.trash", () => {
  const mode = createMockMode();
  delete mode.trash;
  const drawContext = createMockModeHandlerContext();
  const mh = ModeHandler(mode, drawContext);

  try{
    mh.trash();
  } catch (e) {
    throw e
  }
  assertEquals(
    drawContext.store.render.callCount,
    0,
    "store.render not called",
  );
});
