import isEqual from 'fast-deep-equal';
import normalize from '@mapbox/geojson-normalize';
import hat from 'hat';
import featuresAt from './lib/features_at.ts';
import {stringSetsAreEqual} from './lib/string_sets_are_equal.ts';
import * as Constants from './constants.ts';
import StringSet from './lib/string_set.ts';

import {PolygonFeat} from './feature_types/polygon.ts';
import {LineStringFeat} from './feature_types/line_string.ts';
import {PointFeat} from './feature_types/point.ts';
import MultiFeature from './feature_types/multi_feature.ts';
import type { DrawContext } from '../index.ts';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

const featureTypes = {
	Polygon: PolygonFeat,
	LineString: LineStringFeat,
	Point: PointFeat,
	MultiPolygon: MultiFeature,
	MultiLineString: MultiFeature,
	MultiPoint: MultiFeature,
};

export class DrawApi {
	public ctx: DrawContext;
	public modes: typeof Constants.modes;

	constructor(ctx: DrawContext) {
		this.ctx = ctx;
		this.modes = Constants.modes;
	}

	public getFeatureIdsAt(point: { x: number; y: number }): string[] {
		const features = featuresAt.click({ point }, null, this.ctx);
		return features.map((feature) => feature.properties.id);
	}

	public getSelectedIds(): string[] {
		return this.ctx.store?.getSelectedIds();
	}

	public getSelected(): FeatureCollection {
		return {
			type: Constants.geojsonTypes.FEATURE_COLLECTION,
			features: this.ctx.store
				.getSelectedIds()
				.map((id: string) => this.ctx.store?.get(id))
				.map((feature: any) => feature.toGeoJSON()),
		};
	}

	public getSelectedPoints(): FeatureCollection {
		return {
			type: Constants.geojsonTypes.FEATURE_COLLECTION,
			features: this.ctx.store
				.getSelectedCoordinates()
				.map((coordinate: any) => ({
					type: Constants.geojsonTypes.FEATURE,
					properties: {},
					geometry: {
						type: Constants.geojsonTypes.POINT,
						coordinates: coordinate.coordinates,
					},
				})),
		};
	}

	public set(featureCollection: FeatureCollection): string[] {
		if (
			featureCollection.type === undefined ||
			featureCollection.type !== Constants.geojsonTypes.FEATURE_COLLECTION ||
			!Array.isArray(featureCollection.features)
		) {
			throw new Error('Invalid FeatureCollection');
		}
		const renderBatch = this.ctx.store?.createRenderBatch();
		let toDelete = this.ctx.store?.getAllIds().slice();
		const newIds = this.add(featureCollection);
		const newIdsLookup = new StringSet(newIds);

		toDelete = toDelete.filter((id) => !newIdsLookup.has(id));
		if (toDelete.length) {
			this.delete(toDelete);
		}

		renderBatch();
		return newIds;
	}

	public add(geojson: Feature | FeatureCollection | Geometry): string[] {
		const featureCollection = JSON.parse(JSON.stringify(normalize(geojson)));

		const ids = featureCollection.features.map((feature: any) => {
			feature.id = feature.id || hat();

			if (feature.geometry === null) {
				throw new Error('Invalid geometry: null');
			}

			if (
				this.ctx.store?.get(feature.id) === undefined ||
				this.ctx.store?.get(feature.id).type !== feature.geometry.type
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
				const originalProperties = internalFeature.properties;
				internalFeature.properties = feature.properties;
				if (!isEqual(originalProperties, feature.properties)) {
					this.ctx.store?.featureChanged(internalFeature.id);
				}
				if (
					!isEqual(
						internalFeature.getCoordinates(),
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
			return feature.toGeoJSON();
		}
	}

	public getAll(): FeatureCollection {
		return {
			type: Constants.geojsonTypes.FEATURE_COLLECTION,
			features: this.ctx.store
				.getAll()
				.map((feature: any) => feature.toGeoJSON()),
		};
	}

	public delete(featureIds: string | string[]): this {
		this.ctx.store?.delete(featureIds, { silent: true });
		if (
			this.getMode() === Constants.modes.DIRECT_SELECT &&
			!this.ctx.store?.getSelectedIds().length
		) {
			this.ctx.events?.changeMode(Constants.modes.SIMPLE_SELECT, undefined, {
				silent: true,
			});
		} else {
			this.ctx.store?.render();
		}
		return this;
	}

	public deleteAll(): this {
		this.ctx.store?.delete(this.ctx.store?.getAllIds(), { silent: true });
		if (this.getMode() === Constants.modes.DIRECT_SELECT) {
			this.ctx.events?.changeMode(Constants.modes.SIMPLE_SELECT, undefined, {
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
			mode === Constants.modes.SIMPLE_SELECT &&
			this.getMode() === Constants.modes.SIMPLE_SELECT
		) {
			if (
				stringSetsAreEqual(
					modeOptions.featureIds || [],
					this.ctx.store?.getSelectedIds(),
				)
			)
				return this;
			this.ctx.store?.setSelected(modeOptions.featureIds, { silent: true });
			this.ctx.store?.render();
			return this;
		}

		if (
			mode === Constants.modes.DIRECT_SELECT &&
			this.getMode() === Constants.modes.DIRECT_SELECT &&
			modeOptions.featureId === this.ctx.store?.getSelectedIds()[0]
		) {
			return this;
		}

		this.ctx.events?.changeMode(mode, modeOptions, { silent: true });
		return this;
	}

	public getMode(): string {
		return this.ctx.events?.getMode();
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
