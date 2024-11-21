import type { Map as MapLibreMap } from "maplibre-gl";
import type { DrawEvents } from "./events.ts";
import type { DrawUI } from "./ui.ts";
import type { DrawStore } from "./store.ts";
import type { Theme } from "./lib/theme.ts";

export type MapLibreDrawControls = {
  point?: boolean;
  line_string?: boolean;
  polygon?: boolean;
  trash?: boolean;
  combine_features?: boolean;
  uncombine_features?: boolean;
};


/**
 * Options for configuring the MapLibre Draw plugin.
 */
export type MapLibreDrawOptions = {
  /** 
   * Whether to display the default controls.
   * @default true
   */
  displayControlsDefault?: boolean;

  /** 
   * Whether to enable keybindings for the draw controls.
   * @default true
   */
  keybindings?: boolean;

  /** 
   * Whether to enable touch support for the draw controls.
   * @default true
   */
  touchEnabled?: boolean;

  /** 
   * Whether to enable box selection.
   * @default true
   */
  boxSelect?: boolean;

  /** 
   * The buffer size in pixels for click events.
   * @default 2
   */
  clickBuffer?: number;

  /** 
   * The buffer size in pixels for touch events.
   * @default 25
   */
  touchBuffer?: number;

  /** 
   * Configuration for the draw controls.
   */
  controls?: MapLibreDrawControls;

  /** 
   * Custom styles for the draw controls.
   */
  styles?: Theme;

  /** 
   * Custom modes for the draw controls.
   */
  modes?: { [modeKey: string]: any };

  /** 
   * The default mode for the draw controls.
   * @default 'simple_select'
   */
  defaultMode?: string;

  /** 
   * Whether to include user properties in the drawn features.
   * @default false
   */
  userProperties?: boolean;
};

/**
 * Interface representing the context for drawing operations.
 */
export interface IDrawContext {
  options: MapLibreDrawOptions;
  map?: MapLibreMap;
  events?: DrawEvents;
  ui?: DrawUI;
  container?: HTMLElement;
  store?: DrawStore;
}