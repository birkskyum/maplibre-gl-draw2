import { DrawContext } from ".././index.ts";

export function ModeHandler(mode: any, DrawContext: DrawContext): {
  render: any;
  stop: () => void;
  trash: () => void;
  combineFeatures: () => void;
  uncombineFeatures: () => void;
  drag: (event: any) => void;
  click: (event: any) => void;
  mousemove: (event: any) => void;
  mousedown: (event: any) => void;
  mouseup: (event: any) => void;
  mouseout: (event: any) => void;
  keydown: (event: any) => void;
  keyup: (event: any) => void;
  touchstart: (event: any) => void;
  touchmove: (event: any) => void;
  touchend: (event: any) => void;
  tap: (event: any) => void;
} {
  const handlers = {
    drag: [],
    click: [],
    mousemove: [],
    mousedown: [],
    mouseup: [],
    mouseout: [],
    keydown: [],
    keyup: [],
    touchstart: [],
    touchmove: [],
    touchend: [],
    tap: [],
  };

  const ctx = {
    on(event, selector, fn) {
      if (handlers[event] === undefined) {
        throw new Error(`Invalid event type: ${event}`);
      }
      handlers[event].push({
        selector,
        fn,
      });
    },
    render(id) {
      DrawContext.store.featureChanged(id);
    },
  };

  const delegate = function (eventName, event) {
    const handles = handlers[eventName];
    let iHandle = handles.length;
    while (iHandle--) {
      const handle = handles[iHandle];
      if (handle.selector(event)) {
        const skipRender = handle.fn.call(ctx, event);
        if (!skipRender) {
          DrawContext.store.render();
        }
        DrawContext.ui.updateMapClasses();

        // ensure an event is only handled once
        // we do this to let modes have multiple overlapping selectors
        // and relay on order of oppertations to filter
        break;
      }
    }
  };

  if (typeof mode.start === "function") {
    mode.start.call(ctx);
  }

  return {
    render: mode.render,
    stop() {
      if (typeof mode.stop === "function") {
        mode.stop();
      }
    },
    trash() {
      if (typeof mode.trash === "function") {
        mode.trash();
        DrawContext.store.render();
      }
    },
    combineFeatures() {
      if (typeof mode.combineFeatures === "function") {
        mode.combineFeatures();
      }
    },
    uncombineFeatures() {
      if (typeof mode.uncombineFeatures === "function") {
        mode.uncombineFeatures();
      }
    },
    drag(event) {
      delegate("drag", event);
    },
    click(event) {
      delegate("click", event);
    },
    mousemove(event) {
      delegate("mousemove", event);
    },
    mousedown(event) {
      delegate("mousedown", event);
    },
    mouseup(event) {
      delegate("mouseup", event);
    },
    mouseout(event) {
      delegate("mouseout", event);
    },
    keydown(event) {
      delegate("keydown", event);
    },
    keyup(event) {
      delegate("keyup", event);
    },
    touchstart(event) {
      delegate("touchstart", event);
    },
    touchmove(event) {
      delegate("touchmove", event);
    },
    touchend(event) {
      delegate("touchend", event);
    },
    tap(event) {
      delegate("tap", event);
    },
  };
}
