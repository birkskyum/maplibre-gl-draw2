import { ModeInterface } from './mode_interface.ts';

export class StaticMode extends ModeInterface {
	onSetup() {
		this.setActionableState(); // default actionable state is false for all actions
		return {};
	}

	toDisplayFeatures(state, geojson, display) {
		display(geojson);
	}
}

// For backwards compatibility with the existing mode system
export default StaticMode;