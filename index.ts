import setupOptions from './src/options.ts';
import setupAPI from './src/api.ts';
import { ALL_MODES } from './src/modes/index.ts';
import * as Constants from './src/constants.ts';
import * as lib from './src/lib/index.ts';
import { DrawEvents } from './src/events.ts';
import Store from './src/store.ts';
import ui from './src/ui.ts';

class DrawContext {
	options: any;
	api?: any;
	map?: any;
	events?: any;
	ui?: any;
	container?: any;
	store?: any;

	constructor(options: any) {
		this.options = setupOptions(options);
	}
}

class DrawManager {
	private ctx: DrawContext;
	private setupApi: any;
	private controlContainer: any = null;
	private mapLoadedInterval: any = null;
	private boxZoomInitial: boolean = false;

	constructor(options: any, api: any) {
		this.ctx = new DrawContext(options);
		this.setupApi = new setupAPI(this.ctx, api);
		this.ctx.api = this.setupApi;
		this.initialize();
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
		this.ctx.ui = new ui(this.ctx);
		this.ctx.container = map.getContainer();
		this.ctx.store = new Store(this.ctx);

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

const setupDraw = (options: any, api: any): any => {
	const drawManager = new DrawManager(options, api);
	return drawManager.getApi();
};

export default class MapLibreDraw {
	static readonly modes = ALL_MODES;
	static readonly constants = Constants;
	static readonly lib = lib;

	constructor(options: any = {}) {
		return setupDraw(options, this);
	}
}
