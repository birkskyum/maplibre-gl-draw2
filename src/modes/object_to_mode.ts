import { ModeInterface } from "./mode_interface.ts";

const eventMapper = {
  drag: "onDrag",
  click: "onClick",
  mousemove: "onMouseMove",
  mousedown: "onMouseDown",
  mouseup: "onMouseUp",
  mouseout: "onMouseOut",
  keyup: "onKeyUp",
  keydown: "onKeyDown",
  touchstart: "onTouchStart",
  touchmove: "onTouchMove",
  touchend: "onTouchEnd",
  tap: "onTap",
};

const eventKeys = Object.keys(eventMapper);

export function objectToMode(modeObject) {  
  return function (ctx, startOpts = {}) {
  

    const mode = new modeObject(ctx);

    function wrapper(eh) {
      return (e) => mode[eh](mode.state, e);
    }

    return {
      start() {
        mode.state = mode.onSetup(startOpts);

        eventKeys.forEach((key) => {
          const modeHandler = eventMapper[key];
          let selector = () => false;
          if (typeof mode[modeHandler] === "function") {
            selector = () => true;
          }
          // @ts-ignore
          this.on(key, selector, wrapper(modeHandler));
        });
      },
      stop() {
        if (typeof mode.onStop === "function") {
          mode.onStop(mode.state);
        }
      },
      trash() {
        if (typeof mode.onTrash === "function") {
          mode.onTrash(mode.state);
        }
      },
      combineFeatures() {
        if (typeof mode.onCombineFeatures === "function") {
          mode.onCombineFeatures(mode.state);
        }
      },
      uncombineFeatures() {
        if (typeof mode.onUncombineFeatures === "function") {
          mode.onUncombineFeatures(mode.state);
        }
      },
      render(geojson, push) {
        if (typeof mode.toDisplayFeatures === "function") {
          mode.toDisplayFeatures(mode.state, geojson, push);
        }
      },
    };
  };
}
