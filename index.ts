import runSetup from './src/setup.ts';
import setupOptions from './src/options.ts';
import setupAPI from './src/api.ts';
import modes from './src/modes/index.ts';
import * as Constants from './src/constants.ts';
import * as lib from './src/lib/index.ts';

const setupDraw = function(options, api) {
  options = setupOptions(options);

  const ctx = {
    options
  };

  api = setupAPI(ctx, api);
  ctx.api = api;

  const setup = runSetup(ctx);

  api.onAdd = setup.onAdd;
  api.onRemove = setup.onRemove;
  api.types = Constants.types;
  api.options = options;

  return api;
};

function MapLibreDraw(options) {
  setupDraw(options, this);
}

MapLibreDraw.modes = modes;
MapLibreDraw.constants = Constants;
MapLibreDraw.lib = lib;

export default MapLibreDraw;
