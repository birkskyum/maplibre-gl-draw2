import {
	BBox,
	Feature,
	FeatureCollection,
	GeoJSON,
	GeoJsonTypes,
	Geometry,
	Point,
	Position,
} from 'geojson';
import {
	Map,
	MapEvent,
	MapMouseEvent as MapLibreMapMouseEvent,
	MapTouchEvent as MapLibreMapTouchEvent,
} from 'maplibre-gl';

export = MapLibreDraw;
export as namespace MapLibreDraw;

declare namespace MapLibreDraw {
	type DrawMode = DrawModes[keyof DrawModes];

	interface DrawEvents {
		'draw.create': MapLibreDraw.DrawCreateEvent;
		'draw.delete': MapLibreDraw.DrawDeleteEvent;
		'draw.update': MapLibreDraw.DrawUpdateEvent;
		'draw.selectionchange': MapLibreDraw.DrawSelectionChangeEvent;
		'draw.render': MapLibreDraw.DrawRenderEvent;
		'draw.combine': MapLibreDraw.DrawCombineEvent;
		'draw.uncombine': MapLibreDraw.DrawUncombineEvent;
		'draw.modechange': MapLibreDraw.DrawModeChangeEvent;
		'draw.actionable': MapLibreDraw.DrawActionableEvent;
	}
	type DrawEventType = keyof DrawEvents;



	interface DrawActionableState {
		trash: boolean;
		combineFeatures: boolean;
		uncombineFeatures: boolean;
	}

	interface DrawFeatureBase<Coordinates> {
		readonly properties: Readonly<Feature['properties']>;
		readonly coordinates: Coordinates;
		readonly id: NonNullable<Feature['id']>;
		readonly type: GeoJsonTypes;

		changed(): void;
		isValid(): boolean;
		incomingCoords: this['setCoordinates'];
		setCoordinates(coords: Coordinates): void;
		getCoordinates(): Coordinates;
		getCoordinate(path: string): Position;
		updateCoordinate(path: string, lng: number, lat: number): void;
		setProperty(property: string, value: any): void;
		toGeoJSON(): GeoJSON;
	}

	interface DrawPoint extends DrawFeatureBase<Position> {
		readonly type: 'Point';
		getCoordinate(): Position;
		updateCoordinate(lng: number, lat: number): void;
		updateCoordinate(path: string, lng: number, lat: number): void;
	}

	interface DrawLineString extends DrawFeatureBase<Position[]> {
		readonly type: 'LineString';
		addCoordinate(path: string | number, lng: number, lat: number): void;
		removeCoordinate(path: string | number): void;
	}

	interface DrawPolygon extends DrawFeatureBase<Position[][]> {
		readonly type: 'Polygon';
		addCoordinate(path: string, lng: number, lat: number): void;
		removeCoordinate(path: string): void;
	}

	interface DrawMultiFeature<
		Type extends 'MultiPoint' | 'MultiLineString' | 'MultiPolygon',
	> extends Omit<
			DrawFeatureBase<
				| (Type extends 'MultiPoint' ? Array<DrawPoint['coordinates']> : never)
				| (Type extends 'MultiLineString'
						? Array<DrawLineString['coordinates']>
						: never)
				| (Type extends 'MultiPolygon'
						? Array<DrawPolygon['coordinates']>
						: never)
			>,
			'coordinates'
		> {
		readonly type: Type;
		readonly features: Array<
			| (Type extends 'MultiPoint' ? DrawPoint : never)
			| (Type extends 'MultiLineString' ? DrawLineString : never)
			| (Type extends 'MultiPolygon' ? DrawPolygon : never)
		>;
		getFeatures(): this['features'];
	}

	type DrawFeature =
		| DrawPoint
		| DrawLineString
		| DrawPolygon
		| DrawMultiFeature<'MultiPoint'>
		| DrawMultiFeature<'MultiLineString'>
		| DrawMultiFeature<'MultiPolygon'>;

	interface MapMouseEvent extends MapLibreMapMouseEvent {
		featureTarget: DrawFeature;
	}

	interface MapTouchEvent extends MapLibreMapTouchEvent {
		featureTarget: DrawFeature;
	}

	interface DrawEvent {
		target: Map;
		type: DrawEventType;
	}

	interface DrawCreateEvent extends DrawEvent {
		// Array of GeoJSON objects representing the features that were created
		features: Feature[];
		type: 'draw.create';
	}

	interface DrawDeleteEvent extends DrawEvent {
		// Array of GeoJSON objects representing the features that were deleted
		features: Feature[];
		type: 'draw.delete';
	}

	interface DrawCombineEvent extends DrawEvent {
		deletedFeatures: Feature[]; // Array of deleted features (those incorporated into new multifeatures)
		createdFeatures: Feature[]; // Array of created multifeatures
		type: 'draw.combine';
	}

	interface DrawUncombineEvent extends DrawEvent {
		deletedFeatures: Feature[]; // Array of deleted multifeatures (split into features)
		createdFeatures: Feature[]; // Array of created features
		type: 'draw.uncombine';
	}

	interface DrawUpdateEvent extends DrawEvent {
		features: Feature[]; // Array of features that were updated
		action: string; // Name of the action that triggered the update
		type: 'draw.update';
	}

	interface DrawSelectionChangeEvent extends DrawEvent {
		features: Feature[]; // Array of features that are selected after the change
		points: Array<Feature<Point>>;
		type: 'draw.selectionchange';
	}

	interface DrawModeChangeEvent extends DrawEvent {
		mode: DrawMode; // The next mode, i.e. the mode that Draw is changing to
		type: 'draw.modechange';
	}

	interface DrawRenderEvent extends DrawEvent {
		type: 'draw.render';
	}

	interface DrawActionableEvent extends DrawEvent {
		actions: DrawActionableState;
		type: 'draw.actionable';
	}

	interface DrawCustomModeThis {
		map: Map;

		drawConfig: MapLibreDrawOptions;

		setSelected(features?: string | string[]): void;

		setSelectedCoordinates(
			coords: Array<{ coord_path: string; feature_id: string }>,
		): void;

		getSelected(): DrawFeature[];

		getSelectedIds(): string[];

		isSelected(id: string): boolean;

		getFeature(id: string): DrawFeature;

		select(id: string): void;

		delete(id: string): void;

		deleteFeature(id: string, opts?: any): void;

		addFeature(feature: DrawFeature): void;

		clearSelectedFeatures(): void;

		clearSelectedCoordinates(): void;

		setActionableState(actionableState: DrawActionableState): void;

		changeMode(mode: DrawMode, opts?: object, eventOpts?: object): void;

		updateUIClasses(opts: object): void;

		activateUIButton(name?: string): void;

		featuresAt(
			event: Event,
			bbox: BBox,
			bufferType: 'click' | 'tap',
		): DrawFeature[];

		newFeature(geojson: GeoJSON): DrawFeature;

		isInstanceOf(type: string, feature: object): boolean;

		doRender(id: string): void;
	}

	interface DrawCustomMode<CustomModeState = any, CustomModeOptions = any> {
		onSetup?(
			this: DrawCustomModeThis & this,
			options: CustomModeOptions,
		): CustomModeState;

		onDrag?(
			this: DrawCustomModeThis & this,
			state: CustomModeState,
			e: MapMouseEvent,
		): void;

		onClick?(
			this: DrawCustomModeThis & this,
			state: CustomModeState,
			e: MapMouseEvent,
		): void;

		onMouseMove?(
			this: DrawCustomModeThis & this,
			state: CustomModeState,
			e: MapMouseEvent,
		): void;

		onMouseDown?(
			this: DrawCustomModeThis & this,
			state: CustomModeState,
			e: MapMouseEvent,
		): void;

		onMouseUp?(
			this: DrawCustomModeThis & this,
			state: CustomModeState,
			e: MapMouseEvent,
		): void;

		onMouseOut?(
			this: DrawCustomModeThis & this,
			state: CustomModeState,
			e: MapMouseEvent,
		): void;

		onKeyUp?(
			this: DrawCustomModeThis & this,
			state: CustomModeState,
			e: KeyboardEvent,
		): void;

		onKeyDown?(
			this: DrawCustomModeThis & this,
			state: CustomModeState,
			e: KeyboardEvent,
		): void;

		onTouchStart?(
			this: DrawCustomModeThis & this,
			state: CustomModeState,
			e: MapTouchEvent,
		): void;

		onTouchMove?(
			this: DrawCustomModeThis & this,
			state: CustomModeState,
			e: MapTouchEvent,
		): void;

		onTouchEnd?(
			this: DrawCustomModeThis & this,
			state: CustomModeState,
			e: MapTouchEvent,
		): void;

		onTap?(
			this: DrawCustomModeThis & this,
			state: CustomModeState,
			e: MapTouchEvent,
		): void;

		onStop?(this: DrawCustomModeThis & this, state: CustomModeState): void;

		onTrash?(this: DrawCustomModeThis & this, state: CustomModeState): void;

		onCombineFeature?(
			this: DrawCustomModeThis & this,
			state: CustomModeState,
		): void;

		onUncombineFeature?(
			this: DrawCustomModeThis & this,
			state: CustomModeState,
		): void;

		toDisplayFeatures(
			this: DrawCustomModeThis & this,
			state: CustomModeState,
			geojson: GeoJSON,
			display: (geojson: GeoJSON) => void,
		): void;
	}


	interface Lib {
		CommonSelectors: {
			isOfMetaType: (
				type: Constants['meta'][keyof Constants['meta']],
			) => (e: MapMouseEvent | MapTouchEvent) => boolean;
			isShiftMousedown: (e: MapEvent) => boolean;
			isActiveFeature: (e: MapMouseEvent | MapTouchEvent) => boolean;
			isInactiveFeature: (e: MapMouseEvent | MapTouchEvent) => boolean;
			noTarget: (e: MapMouseEvent | MapTouchEvent) => boolean;
			isFeature: (e: MapMouseEvent | MapTouchEvent) => boolean;
			isVertex: (e: MapMouseEvent | MapTouchEvent) => boolean;
			isShiftDown: (e: MapEvent) => boolean;
			isEscapeKey: (e: KeyboardEvent) => boolean;
			isEnterKey: (e: KeyboardEvent) => boolean;
			isTrue: () => boolean;
		};

		constrainFeatureMovement(
			geojsonFeatures: DrawFeature[],
			delta: { lng: number; lat: number },
		): { lng: number; lat: number };

		createMidPoint(
			parent: string,
			startVertex: Feature,
			endVertex: Feature,
		): Feature<Point> | null;

		createSupplementaryPoints(
			geojson: Feature,
			options?: { midpoints?: boolean; selectedPaths?: string[] },
			basePath?: string,
		): Array<Feature<Point>>;

		/**
		 * Returns GeoJSON for a Point representing the
		 * vertex of another feature.
		 *
		 * @param parentId
		 * @param coordinates
		 * @param path Dot-separated numbers indicating exactly
		 *   where the point exists within its parent feature's coordinates.
		 * @param selected
		 * @return GeoJSON Point
		 */
		createVertex(
			parentId: string,
			coordinates: Position,
			path: string,
			selected: boolean,
		): Feature<Point>;

		// TODO: define a proper type for ctx since is not exposed correctly
		// https://github.com/mapbox/mapbox-gl-draw/issues/1156

		doubleClickZoom: {
			enable: (ctx: DrawCustomModeThis) => void; // ?? ctx
			disable: (ctx: DrawCustomModeThis) => void; // ?? ctx
		};

		featuresAt: {
			click: (
				event: MapMouseEvent,
				bbox: BBox,
				ctx: DrawCustomModeThis,
			) => Feature[]; // ?? ctx
			touch: (
				event: MapTouchEvent,
				bbox: BBox,
				ctx: DrawCustomModeThis,
			) => Feature[]; // ?? ctx
		};

		getFeatureAtAndSetCursors(
			event: MapMouseEvent,
			ctx: DrawCustomModeThis,
		): Feature;

		euclideanDistance(
			a: { x: number; y: number },
			b: { x: number; y: number },
		): number;

		isClick(
			start: { point?: { x: number; y: number }; time?: number },
			end: { point: { x: number; y: number }; time: number },
			options?: {
				fineTolerance?: number;
				grossTolerance?: number;
				interval?: number;
			},
		): boolean;

		isEventAtCoordinates(
			event: MapMouseEvent,
			coordinates: Position[],
		): boolean;

		isTap(
			start: { point?: { x: number; y: number }; time?: number },
			end: { point: { x: number; y: number }; time: number },
			options?: { tolerance?: number; interval?: number },
		): boolean;

		/**
		 * Returns a bounding box representing the event's location.
		 *
		 * @param mapEvent - MapLibre GL JS map event, with a point properties.
		 * @param [buffer=0]
		 * @return Bounding box.
		 */
		mapEventToBoundingBox(
			mapEvent: MapMouseEvent | MapTouchEvent,
			buffer?: number,
		): Position[];

		ModeHandler: (
			mode: any,
			DrawContext: any,
		) => {
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
		};

		moveFeatures(
			features: DrawFeature[],
			delta: { lng: number; lat: number },
		): void;

		/**
		 * Sort features in the following order Point: 0, LineString: 1, MultiLineString: 1,
		 * Polygon: 2, then sort polygons by area ascending.
		 * @param features
		 */
		sortFeatures(features: DrawFeature[]): DrawFeature[];

		stringSetsAreEqual(
			a: Array<Pick<Feature, 'id'>>,
			b: Array<Pick<Feature, 'id'>>,
		): boolean;

		StringSet(items?: Array<string | number>): StringSet;

		/**
		 * Derive a dense array (no `undefined`s) from a single value or array.
		 */
		toDenseArray(x: any): Array<NonNullable<any>>;
	}

}

