import runSetup from './src/setup.ts';
import setupOptions from './src/options.ts';
import setupAPI from './src/api.ts';
import modes from './src/modes/index.ts';
import * as Constants from './src/constants.ts';
import * as lib from './src/lib/index.ts';
class DrawContext {
	options: any;
	api?: any;

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
		this.setup = runSetup(this.ctx);
		this.initialize();
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
	static readonly modes = modes;
	static readonly constants = Constants;
	static readonly lib = lib;

	constructor(options: any = {}) {
		return setupDraw(options, this);
	}
}