import { setupOptions } from "./setup.ts";
import type { DrawEvents } from "./events.ts";
import type { DrawStore } from "./store.ts";
import type { DrawUI } from "./ui.ts";
import type { MapLibreDrawOptions, IDrawContext } from "./types.ts";
import type { Map as MapLibreMap} from "maplibre-gl";
import type { MapLibreDraw } from "./index.ts";



/**
 * Represents the drawing context for MapLibre GL Draw.
 * This class is responsible for managing the options and state
 * required for drawing on a MapLibre map.
 */
export class DrawContext implements IDrawContext {
    options: MapLibreDrawOptions;
    map?: MapLibreMap;
    events?: DrawEvents;
    ui?: DrawUI;
    container?: HTMLElement;
    store?: DrawStore;
    parent?: MapLibreDraw;
  
    constructor(options: MapLibreDrawOptions) {
      this.options = setupOptions(options);
    }
  }
  