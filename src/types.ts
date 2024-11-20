
import type { Feature, FeatureCollection } from "geojson";
import type { IControl, Map as MapLibreMap } from "maplibre-gl";
import { DrawEvents } from "./events";
import { DrawUI } from "./ui";
import { DrawStore } from "./store";

export type MapLibreDrawControls = {
  point?: boolean;
  line_string?: boolean;
  polygon?: boolean;
  trash?: boolean;
  combine_features?: boolean;
  uncombine_features?: boolean;
};

export type MapLibreDrawOptions = {
  displayControlsDefault?: boolean;
  keybindings?: boolean;
  touchEnabled?: boolean;
  boxSelect?: boolean;
  clickBuffer?: number;
  touchBuffer?: number;
  controls?: MapLibreDrawControls;
  styles?: object[];
  modes?: { [modeKey: string]: any };
  defaultMode?: string;
  userProperties?: boolean;
};

export interface IDrawContext {
  options: MapLibreDrawOptions;
  map?: MapLibreMap;
  events?: DrawEvents;
  ui?: DrawUI;
  container?: HTMLElement;
  store?: DrawStore;
}