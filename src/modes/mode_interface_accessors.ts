import * as Constants from '../constants.ts';
import featuresAt from '../lib/features_at.ts';
import Point from '../feature_types/point.ts';
import LineString from '../feature_types/line_string.ts';
import Polygon from '../feature_types/polygon.ts';
import MultiFeature from '../feature_types/multi_feature.ts';
import type { DrawContext } from '../../index.ts';

export class ModeInterfaceAccessors {
	protected map: any;
	protected drawConfig: any;
	protected _ctx: DrawContext;

	constructor(ctx: DrawContext) {
		this.map = ctx.map;
		this.drawConfig = JSON.parse(JSON.stringify(ctx.options || {}));
		this._ctx = ctx;
	}

	setSelected(features: any) {
		return this._ctx.store?.setSelected(features);
	}

	setSelectedCoordinates(coords: any) {
		this._ctx.store?.setSelectedCoordinates(coords);
		coords.reduce((m: any, c: any) => {
			if (m[c.feature_id] === undefined) {
				m[c.feature_id] = true;
				this._ctx.store?.get(c.feature_id).changed();
			}
			return m;
		}, {});
	}

	getSelected() {
		return this._ctx.store?.getSelected();
	}

	getSelectedIds() {
		return this._ctx.store?.getSelectedIds();
	}

	isSelected(id: string) {
		return this._ctx.store?.isSelected(id);
	}

	getFeature(id: string) {
		return this._ctx.store?.get(id);
	}

	select(id: string) {
		return this._ctx.store?.select(id);
	}

	deselect(id: string) {
		return this._ctx.store?.deselect(id);
	}

	deleteFeature(id: string, opts: any = {}) {
		return this._ctx.store?.delete(id, opts);
	}

	addFeature(feature: any) {
		return this._ctx.store?.add(feature);
	}

	clearSelectedFeatures() {
		return this._ctx.store?.clearSelected();
	}

	clearSelectedCoordinates() {
		return this._ctx.store?.clearSelectedCoordinates();
	}

	setActionableState(actions: any = {}) {
		const newSet = {
			trash: actions.trash || false,
			combineFeatures: actions.combineFeatures || false,
			uncombineFeatures: actions.uncombineFeatures || false,
		};
		return this._ctx.events?.actionable(newSet);
	}

	changeMode(mode: string, opts: any = {}, eventOpts: any = {}) {
		return this._ctx.events?.changeMode(mode, opts, eventOpts);
	}

	fire(eventName: string, eventData: any) {
		return this._ctx.events?.fire(eventName, eventData);
	}

	updateUIClasses(opts: any) {
		return this._ctx.ui?.queueMapClasses(opts);
	}

	activateUIButton(name: string) {
		return this._ctx.ui?.setActiveButton(name);
	}

	featuresAt(event: any, bbox: any, bufferType: string = 'click') {
		if (bufferType !== 'click' && bufferType !== 'touch')
			throw new Error('invalid buffer type');
		return featuresAt[bufferType](event, bbox, this._ctx);
	}

	newFeature(geojson: any) {
		const type = geojson.geometry.type;
		if (type === Constants.geojsonTypes.POINT)
			return new Point(this._ctx, geojson);
		if (type === Constants.geojsonTypes.LINE_STRING)
			return new LineString(this._ctx, geojson);
		if (type === Constants.geojsonTypes.POLYGON)
			return new Polygon(this._ctx, geojson);
		return new MultiFeature(this._ctx, geojson);
	}

	isInstanceOf(type: string, feature: any) {
		if (type === Constants.geojsonTypes.POINT) return feature instanceof Point;
		if (type === Constants.geojsonTypes.LINE_STRING)
			return feature instanceof LineString;
		if (type === Constants.geojsonTypes.POLYGON)
			return feature instanceof Polygon;
		if (type === 'MultiFeature') return feature instanceof MultiFeature;
		throw new Error(`Unknown feature class: ${type}`);
	}

	doRender(id: string) {
		return this._ctx.store?.featureChanged(id);
	}
}
