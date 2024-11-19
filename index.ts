import setupOptions from './src/options.ts';
// Removed import of 'runSetup' from './src/setup.ts'
import setupAPI from './src/api.ts';
import { ALL_MODES } from './src/modes/index.ts';
import * as Constants from './src/constants.ts';
import * as lib from './src/lib/index.ts';

// Add necessary imports from setup.ts
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
	setup?: any;
	boxZoomInitial?: boolean;

	constructor(options: any) {
		this.options = setupOptions(options);
	}
}

class DrawManager {
	private ctx: DrawContext;
	private setupApi: any;
	private setup: any;

	constructor(options: any, api: any) {
		this.ctx = new DrawContext(options);
		this.setupApi = new setupAPI(this.ctx, api);
		this.ctx.api = this.setupApi;
		// Initialize setup directly without importing from setup.ts
		this.setup = this.initializeSetup();
		this.initialize();
	}

	private initializeSetup() {
		let controlContainer = null;
		let mapLoadedInterval = null;

		const ctx = this.ctx; // Reference to context

		const setup = {
			onRemove() {
				// Stop connect attempt in case control is removed before map is loaded
				ctx.map.off('load', setup.connect);
				clearInterval(mapLoadedInterval);

				setup.removeLayers();
				ctx.store.restoreMapConfig();
				ctx.ui.removeButtons();
				ctx.events.removeEventListeners();
				ctx.ui.clearMapClasses();
				if (ctx.boxZoomInitial) ctx.map.boxZoom.enable();
				ctx.map = null;
				ctx.container = null;
				ctx.store = null;

				if (controlContainer && controlContainer.parentNode)
					controlContainer.parentNode.removeChild(controlContainer);
				controlContainer = null;

				return this;
			},
			connect() {
				ctx.map.off('load', setup.connect);
				clearInterval(mapLoadedInterval);
				setup.addLayers();
				ctx.store.storeMapConfig();
				ctx.events.addEventListeners();
			},
			onAdd(map: any) {
				ctx.map = map;
				ctx.events = new DrawEvents(ctx);
				ctx.ui = new ui(ctx);
				ctx.container = map.getContainer();
				ctx.store = new Store(ctx);

				controlContainer = ctx.ui.addButtons();

				if (ctx.options.boxSelect) {
					ctx.boxZoomInitial = map.boxZoom.isEnabled();
					map.boxZoom.disable();
					const dragPanIsEnabled = map.dragPan.isEnabled();
					// Need to toggle dragPan on and off or else first
					// dragPan disable attempt in simple_select doesn't work
					map.dragPan.disable();
					map.dragPan.enable();
					if (!dragPanIsEnabled) {
						map.dragPan.disable();
					}
				}

				if (map.loaded()) {
					setup.connect();
				} else {
					map.on('load', setup.connect);
					mapLoadedInterval = setInterval(() => {
						if (map.loaded()) setup.connect();
					}, 16);
				}

				ctx.events.start();
				return controlContainer;
			},
			addLayers() {
				// Drawn features style
				ctx.map.addSource(Constants.sources.COLD, {
					data: {
						type: Constants.geojsonTypes.FEATURE_COLLECTION,
						features: [],
					},
					type: 'geojson',
				});

				// Hot features style
				ctx.map.addSource(Constants.sources.HOT, {
					data: {
						type: Constants.geojsonTypes.FEATURE_COLLECTION,
						features: [],
					},
					type: 'geojson',
				});

				ctx.options.styles.forEach((style: any) => {
					ctx.map.addLayer(style);
				});

				ctx.store.setDirty(true);
				ctx.store.render();
			},
			// Check for layers and sources before attempting to remove
			// If user adds draw control and removes it before the map is loaded, layers and sources will be missing
			removeLayers() {
				ctx.options.styles.forEach((style: any) => {
					if (ctx.map.getLayer(style.id)) {
						ctx.map.removeLayer(style.id);
					}
				});

				if (ctx.map.getSource(Constants.sources.COLD)) {
					ctx.map.removeSource(Constants.sources.COLD);
				}

				if (ctx.map.getSource(Constants.sources.HOT)) {
					ctx.map.removeSource(Constants.sources.HOT);
				}
			},
		};

		ctx.setup = setup;
		return setup;
	}

	private initialize(): void {
		this.setupApi.onAdd = this.setup.onAdd;
		this.setupApi.onRemove = this.setup.onRemove;
		this.setupApi.types = Constants.types;
		this.setupApi.options = this.ctx.options;
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