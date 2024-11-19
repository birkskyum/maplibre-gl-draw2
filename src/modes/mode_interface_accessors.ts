import featuresAt from '../lib/features_at.ts';
import {PointFeat} from '../feature_types/point.ts';
import {LineStringFeat} from '../feature_types/line_string.ts';
import {PolygonFeat} from '../feature_types/polygon.ts';
import MultiFeature from '../feature_types/multi_feature.ts';
import type { DrawContext } from '../../index.ts';
import type { Map as MapLibre } from 'maplibre-gl';
import * as Constants from '../constants.ts';
import type { BBox, GeoJSON } from 'geojson';
import { DrawStore } from '../store.ts';
import type { MapLibreDrawOptions } from '../options.ts';
import {DrawFeature} from '../feature_types/feature.ts';


type DrawActionableState = {
	trash?: boolean;
	combineFeatures?: boolean;
	uncombineFeatures?: boolean;
}

export class ModeInterfaceAccessors {
	protected map: MapLibre;
	protected drawConfig: MapLibreDrawOptions;
	protected _ctx: DrawContext;

	constructor(ctx: DrawContext) {
		this.map = ctx.map!;
		this.drawConfig = JSON.parse(JSON.stringify(ctx.options || {}));
		this._ctx = ctx;
	}

	setSelected(features?: string | string[]): DrawStore | undefined {
		return this._ctx.store?.setSelected(features);
	}

	setSelectedCoordinates(coords: Array<{ coord_path: string; feature_id: string }>): void {
		this._ctx.store?.setSelectedCoordinates(coords);
		coords.reduce((m: Record<string, boolean>, c) => {
			if (m[c.feature_id] === undefined) {
				m[c.feature_id] = true;
				this._ctx.store?.get(c.feature_id).changed();
			}
			return m;
		}, {});
	}

	getSelected(): DrawFeature[] {
		return this._ctx.store?.getSelected() ?? [];
	}

	getSelectedIds(): string[] {
		return this._ctx.store?.getSelectedIds() ?? [];
	}

	isSelected(id: string): boolean {
		return this._ctx.store?.isSelected(id) ?? false;
	}

	getFeature(id: string): DrawFeature {
		return this._ctx.store?.get(id);
	}

	select(id: string): DrawStore | undefined {
		return this._ctx.store?.select(id);
	}

	deselect(id: string): DrawStore | undefined {
		return this._ctx.store?.deselect(id);
	}

	deleteFeature(id: string, opts: Record<string, any> = {}): DrawStore | undefined {
		return this._ctx.store?.delete(id, opts);
	}

	addFeature(feature: DrawFeature): DrawStore | undefined {
		return this._ctx.store?.add(feature);
	}

	clearSelectedFeatures(): DrawStore | undefined {
		return this._ctx.store?.clearSelected();
	}

	clearSelectedCoordinates(): DrawStore | undefined {
		return this._ctx.store?.clearSelectedCoordinates();
	}

	setActionableState(actions: DrawActionableState = {}): void {
		const newSet = {
			trash: actions.trash || false,
			combineFeatures: actions.combineFeatures || false,
			uncombineFeatures: actions.uncombineFeatures || false,
		};
		return this._ctx.events?.actionable(newSet);
	}

	changeMode(mode: string, opts: object = {}, eventOpts: object = {}): void {
		return this._ctx.events?.changeMode(mode, opts, eventOpts);
	}

	fire(eventName: string, eventData: any): void {
		return this._ctx.events?.fire(eventName, eventData);
	}

	updateUIClasses(opts: object): void {
		return this._ctx.ui?.queueMapClasses(opts);
	}

	activateUIButton(name: string): void {
		return this._ctx.ui?.setActiveButton(name);
	}

	featuresAt(event: Event, bbox: BBox, bufferType: 'click' | 'touch' = 'click'): DrawFeature[] {
		if (bufferType !== 'click' && bufferType !== 'touch')
			throw new Error('invalid buffer type');
		return featuresAt[bufferType](event, bbox, this._ctx);
	}

	newFeature(geojson: GeoJSON): DrawFeature {
		

		const type = geojson.geometry.type;
		if (type === Constants.geojsonTypes.POINT)
			return new PointFeat(this._ctx, geojson);
		if (type === Constants.geojsonTypes.LINE_STRING)
			return new LineStringFeat(this._ctx, geojson);
		if (type === Constants.geojsonTypes.POLYGON)
			return new PolygonFeat(this._ctx, geojson);
		return new MultiFeature(this._ctx, geojson);
	}

	isInstanceOf(type: string, feature: object): boolean {
		if (type === Constants.geojsonTypes.POINT) return feature instanceof PointFeat;
		if (type === Constants.geojsonTypes.LINE_STRING)
			return feature instanceof LineStringFeat;
		if (type === Constants.geojsonTypes.POLYGON)
			return feature instanceof PolygonFeat;
		if (type === 'MultiFeature') return feature instanceof MultiFeature;
		throw new Error(`Unknown feature class: ${type}`);
	}

	doRender(id: string): DrawStore | undefined {
		return this._ctx.store?.featureChanged(id);
	}
}
