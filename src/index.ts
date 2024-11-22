import isEqual from "fast-deep-equal";
import * as Constants from "./constants.ts";
import * as lib from "./lib/index.ts";
import { DrawEvents } from "./events.ts";
import { DrawStore } from "./store.ts";
import { DrawUI } from "./ui.ts";
import { normalize } from "@birkskyum/geojson-normalize";
import { nanoid } from "nanoid";
import { featuresAt } from "./lib/features_at.ts";
import { stringSetsAreEqual } from "./lib/string_sets_are_equal.ts";
import { StringSet } from "./lib/string_set.ts";
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import { ModeStrings } from "./constants/modes.ts";
import { featureTypes } from "./features.ts";
import type { MapLibreDrawOptions, IDrawContext } from "./types.ts";
import { setupOptions } from "./setup.ts";
import type  {IControl, Map as MapLibreMap} from "maplibre-gl";
import type {MapMouseEvent} from './events.ts'


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



/**
 * The MapLibreDraw class implements the IControl interface and provides drawing functionalities on a MapLibre map.
 * It allows adding, removing, and manipulating features on the map, as well as handling various drawing modes.
 * 
 * @example
 * const draw = new MapLibreDraw({ boxSelect: true });
 * map.addControl(draw);
 * 
 * @remarks
 * This class depends on several internal components such as DrawContext, DrawEvents, DrawUI, and DrawStore.
 * 
 * @public
 */
export class MapLibreDraw implements IControl {
  static readonly modes = ModeStrings;
  static readonly constants = Constants;
  static readonly lib = lib;

  public ctx: DrawContext;

  private controlContainer: any = null;
  private mapLoadedInterval: any = null;
  private boxZoomInitial: boolean = false;
  public types = Constants.types;

  constructor(options: MapLibreDrawOptions = {}) {
    this.ctx = new DrawContext(options);
    this.ctx.parent = this;
    return this;
  }

  public onAdd(map: MapLibreMap): HTMLDivElement {
    this.ctx.map = map;
    this.ctx.events = new DrawEvents(this.ctx);
    this.ctx.ui = new DrawUI(this.ctx);
    this.ctx.container = map.getContainer();
    this.ctx.store = new DrawStore(this.ctx);

    this.controlContainer = this.ctx.ui?.addButtons();

    if (this.ctx.options.boxSelect) {
      this.boxZoomInitial = map.boxZoom.isEnabled();
      map.boxZoom.disable();
      const dragPanIsEnabled = map.dragPan.isEnabled();
      map.dragPan.disable();
      map.dragPan.enable();
      if (!dragPanIsEnabled) {
        map.dragPan.disable();
      }
    }

    if (map.loaded()) {
      this.connect();
    } else {
      map.on("load", this.connect.bind(this));
      this.mapLoadedInterval = setInterval(() => {
        if (map.loaded()) this.connect();
      }, 16);
    }

    this.ctx.events?.start();
    return this.controlContainer;
  }

  public onRemove(_map: MapLibreMap): MapLibreDraw {
    this.ctx.map?.off("load", this.connect.bind(this));
    clearInterval(this.mapLoadedInterval);

    this.removeLayers();
    this.ctx.store?.restoreMapConfig();
    this.ctx.ui?.removeButtons();
    this.ctx.events?.removeEventListeners();
    this.ctx.ui?.clearMapClasses();
    if (this.boxZoomInitial) this.ctx.map?.boxZoom.enable();
    this.ctx.map = undefined;
    this.ctx.container = undefined;
    this.ctx.store = undefined;

    if (this.controlContainer && this.controlContainer.parentNode) {
      this.controlContainer.parentNode.removeChild(this.controlContainer);
    }
    this.controlContainer = null;

    return this;
  }

  private connect() {
    this.ctx.map?.off("load", this.connect.bind(this));
    clearInterval(this.mapLoadedInterval);
    this.addLayers();
    this.ctx.store?.storeMapConfig();
    this.ctx.events?.addEventListeners();
  }

  public addLayers() {
    this.ctx.map?.addSource(Constants.sources.COLD, {
      data: {
        type: "FeatureCollection",
        features: [],
      },
      type: "geojson",
    });

    this.ctx.map?.addSource(Constants.sources.HOT, {
      data: {
        type: "FeatureCollection",
        features: [],
      },
      type: "geojson",
    });

    this.ctx.options.styles?.forEach((style: any) => {
      this.ctx.map?.addLayer(style);
    });

    this.ctx.store?.setDirty();
    this.ctx.store?.render();
  }

  private removeLayers() {
    this.ctx.options.styles?.forEach((style: any) => {
      if (this.ctx.map?.getLayer(style.id)) {
        this.ctx.map?.removeLayer(style.id);
      }
    });

    if (this.ctx.map?.getSource(Constants.sources.COLD)) {
      this.ctx.map?.removeSource(Constants.sources.COLD);
    }

    if (this.ctx.map?.getSource(Constants.sources.HOT)) {
      this.ctx.map?.removeSource(Constants.sources.HOT);
    }
  }

  public getApi(): MapLibreDraw {
    return this;
  }

  public getFeatureIdsAt(point: { x: number; y: number }): string[] {
    const features = featuresAt.click({ point } as MapMouseEvent, undefined, this.ctx);
    return features.map((feature) => feature.properties?.id);
  }

  public getSelectedIds(): string[] {
    return this.ctx.store?.getSelectedIds().map((id) => id.toString()) ?? [];
  }

  public getSelected(): FeatureCollection {
    return {
      type: Constants.geojsonTypes.FEATURE_COLLECTION as "FeatureCollection",
      features: this.ctx.store?.getSelectedIds()
        .map((id: number|string) => this.ctx.store?.get(id)).filter((f) => !!f)
        .map((feature) => feature.toGeoJSON()) as Feature<Geometry, GeoJsonProperties>[],
    };
  }

  public getSelectedPoints(): FeatureCollection {
    return {
      type: Constants.geojsonTypes.FEATURE_COLLECTION as "FeatureCollection",
      features: this.ctx.store?.getSelectedCoordinates()
        .map((coordinate: any) => ({
          type: Constants.geojsonTypes.FEATURE,
          properties: {},
          geometry: {
            type: Constants.geojsonTypes.POINT,
            coordinates: coordinate.coordinates,
          },
        })) as Feature<Geometry, GeoJsonProperties>[],
    };
  }

  public set(featureCollection: FeatureCollection): string[] {
    if (
      featureCollection.type === undefined ||
      featureCollection.type !== Constants.geojsonTypes.FEATURE_COLLECTION ||
      !Array.isArray(featureCollection.features)
    ) {
      throw new Error("Invalid FeatureCollection");
    }
    const renderBatch = this.ctx.store?.createRenderBatch();
    let toDelete = this.ctx.store?.getAllIds().slice();
    const newIds = this.add(featureCollection);
    const newIdsLookup = new StringSet(newIds);

    toDelete = toDelete?.filter((id) => !newIdsLookup.has(id));
    if (toDelete?.length) {
      this.delete(toDelete);
    }

    if (renderBatch) renderBatch();
    return newIds;
  }

  public add(geojson: Feature | FeatureCollection | Geometry): string[] {
    const featureCollection = JSON.parse(JSON.stringify(normalize(geojson)));

    const ids = featureCollection.features.map((feature: any) => {
      feature.id = feature.id || nanoid();

      if (feature.geometry === null) {
        throw new Error("Invalid geometry: null");
      }

      if (
        this.ctx.store?.get(feature.id)?.type !== feature.geometry.type
      ) {
        const Model =
          featureTypes[feature.geometry.type as keyof typeof featureTypes];
        if (Model === undefined) {
          throw new Error(`Invalid geometry type: ${feature.geometry.type}.`);
        }
        const internalFeature = new Model(this.ctx, feature);
        this.ctx.store?.add(internalFeature);
      } else {
        const internalFeature = this.ctx.store?.get(feature.id);

        if (!internalFeature) return;
        const originalProperties = internalFeature.properties;
        internalFeature.properties = feature.properties;
        if (!isEqual(originalProperties, feature.properties)) {
          this.ctx.store?.featureChanged(internalFeature.id);
        }
        if (
          !isEqual(
            internalFeature?.getCoordinates(),
            feature.geometry.coordinates,
          )
        ) {
          internalFeature.incomingCoords(feature.geometry.coordinates);
        }
      }
      return feature.id;
    });

    this.ctx.store?.render();
    return ids;
  }

  public get(id: string): Feature | undefined {
    const feature = this.ctx.store?.get(id);
    if (feature) {
      return feature.toGeoJSON() as Feature<Geometry, GeoJsonProperties> | undefined;
    }
  }

  public getAll(): FeatureCollection {
    return {
      type: Constants.geojsonTypes.FEATURE_COLLECTION as "FeatureCollection",
      features: this.ctx.store?.getAll()
        .map((feature: any) => feature.toGeoJSON()) as Feature<Geometry, GeoJsonProperties>[],
    };
  }

  public delete(featureIds: number|string | (string|number)[]): this {
    this.ctx.store?.delete(featureIds, { silent: true });
    if (
      this.getMode() === ModeStrings.DIRECT_SELECT &&
      !this.ctx.store?.getSelectedIds().length
    ) {
      this.ctx.events?.changeMode(ModeStrings.SIMPLE_SELECT, undefined, {
        silent: true,
      });
    } else {
      this.ctx.store?.render();
    }
    return this;
  }

  public deleteAll(): this {
    this.ctx.store?.delete(this.ctx.store?.getAllIds(), { silent: true });
    if (this.getMode() === ModeStrings.DIRECT_SELECT) {
      this.ctx.events?.changeMode(ModeStrings.SIMPLE_SELECT, undefined, {
        silent: true,
      });
    } else {
      this.ctx.store?.render();
    }
    return this;
  }

  // TYPINGS
  //
  // changeMode(mode: 'simple_select', options?: { featureIds: string[] }): this;
  // changeMode(mode: 'direct_select', options: { featureId: string }): this;
  // changeMode(
  // 	mode: 'draw_line_string',
  // 	options?: { featureId: string; from: Feature<Point> | Point | number[] },
  // ): this;
  // changeMode(
  // 	mode: Exclude<
  // 		MapLibreDraw.DrawMode,
  // 		'direct_select' | 'simple_select' | 'draw_line_string'
  // 	>,
  // ): this;
  // changeMode<T extends string>(
  // 	mode: T & (T extends MapLibreDraw.DrawMode ? never : T),
  // 	options?: object,
  // ): this;

  public changeMode(mode: string, modeOptions: any = {}): this {
    if (
      mode === ModeStrings.SIMPLE_SELECT &&
      this.getMode() === ModeStrings.SIMPLE_SELECT
    ) {
      if (
        stringSetsAreEqual(
          modeOptions.featureIds || [],
          this.ctx.store?.getSelectedIds() as any,
        )
      ) {
        return this;
      }
      this.ctx.store?.setSelected(modeOptions.featureIds, { silent: true });
      this.ctx.store?.render();
      return this;
    }

    if (
      mode === ModeStrings.DIRECT_SELECT &&
      this.getMode() === ModeStrings.DIRECT_SELECT &&
      modeOptions.featureId === this.ctx.store?.getSelectedIds()[0]
    ) {
      return this;
    }

    this.ctx.events?.changeMode(mode, modeOptions, { silent: true });
    return this;
  }

  public getMode(): string {
    return this.ctx.events?.getMode() ?? "";
  }

  public trash(): this {
    this.ctx.events?.trash({ silent: true });
    return this;
  }

  public combineFeatures(): this {
    this.ctx.events?.combineFeatures({ silent: true });
    return this;
  }

  public uncombineFeatures(): this {
    this.ctx.events?.uncombineFeatures({ silent: true });
    return this;
  }

  public setFeatureProperty(
    featureId: string,
    property: string,
    value: any,
  ): this {
    this.ctx.store?.setFeatureProperty(featureId, property, value);
    return this;
  }
}
