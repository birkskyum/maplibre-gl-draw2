import setupOptions from './src/options.ts';
import { ALL_MODES } from './src/modes/index.ts';
import * as Constants from './src/constants.ts';
import * as lib from './src/lib/index.ts';
import { DrawEvents } from './src/events.ts';
import {DrawStore} from './src/store.ts';
import {DrawUI} from './src/ui.ts';
import {DrawApi} from './src/api.ts';
import type {Map as MapLibreMap} from 'maplibre-gl';

export class DrawContext {
	options: any;
	api?: DrawApi;
	map?: MapLibreMap;
	events?: DrawEvents;
	ui?: DrawUI;
	container?: HTMLDivElement;
	store?: DrawStore;

	constructor(options) {
		this.options = setupOptions(options);
	}
}

class MapLibreDraw {
	static readonly modes = ALL_MODES;
	static readonly constants = Constants;
	static readonly lib = lib;

	private ctx: DrawContext;
	private setupApi: any;
	private controlContainer: any = null;
	private mapLoadedInterval: any = null;
	private boxZoomInitial: boolean = false;

	constructor(options: any = {}) {
		this.ctx = new DrawContext(options);
		this.setupApi = new DrawApi(this.ctx);
		this.ctx.api = this.setupApi;
		this.initialize();
		return this.setupApi;
	}

	private initialize(): void {
		this.setupApi.onAdd = this.onAdd.bind(this);
		this.setupApi.onRemove = this.onRemove.bind(this);
		this.setupApi.types = Constants.types;
		this.setupApi.options = this.ctx.options;
	}

	private onAdd(map: any) {
		this.ctx.map = map;
		this.ctx.events = new DrawEvents(this.ctx);
		this.ctx.ui = new DrawUI(this.ctx);
		this.ctx.container = map.getContainer();
		this.ctx.store = new DrawStore(this.ctx);

		this.controlContainer = this.ctx.ui.addButtons();

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
			map.on('load', this.connect.bind(this));
			this.mapLoadedInterval = setInterval(() => {
				if (map.loaded()) this.connect();
			}, 16);
		}

		this.ctx.events.start();
		return this.controlContainer;
	}

	private onRemove() {
		this.ctx.map.off('load', this.connect.bind(this));
		clearInterval(this.mapLoadedInterval);

		this.removeLayers();
		this.ctx.store.restoreMapConfig();
		this.ctx.ui.removeButtons();
		this.ctx.events.removeEventListeners();
		this.ctx.ui.clearMapClasses();
		if (this.boxZoomInitial) this.ctx.map.boxZoom.enable();
		this.ctx.map = null;
		this.ctx.container = null;
		this.ctx.store = null;

		if (this.controlContainer && this.controlContainer.parentNode)
			this.controlContainer.parentNode.removeChild(this.controlContainer);
		this.controlContainer = null;

		return this;
	}

	private connect() {
		this.ctx.map.off('load', this.connect.bind(this));
		clearInterval(this.mapLoadedInterval);
		this.addLayers();
		this.ctx.store.storeMapConfig();
		this.ctx.events.addEventListeners();
	}

	private addLayers() {
		this.ctx.map.addSource(Constants.sources.COLD, {
			data: {
				type: Constants.geojsonTypes.FEATURE_COLLECTION,
				features: [],
			},
			type: 'geojson',
		});

		this.ctx.map.addSource(Constants.sources.HOT, {
			data: {
				type: Constants.geojsonTypes.FEATURE_COLLECTION,
				features: [],
			},
			type: 'geojson',
		});

		this.ctx.options.styles.forEach((style: any) => {
			this.ctx.map.addLayer(style);
		});

		this.ctx.store.setDirty(true);
		this.ctx.store.render();
	}

	private removeLayers() {
		this.ctx.options.styles.forEach((style: any) => {
			if (this.ctx.map.getLayer(style.id)) {
				this.ctx.map.removeLayer(style.id);
			}
		});

		if (this.ctx.map.getSource(Constants.sources.COLD)) {
			this.ctx.map.removeSource(Constants.sources.COLD);
		}

		if (this.ctx.map.getSource(Constants.sources.HOT)) {
			this.ctx.map.removeSource(Constants.sources.HOT);
		}
	}

	public getApi(): any {
		return this.setupApi;
	}
}



export default MapLibreDraw;
