import {ModeInterface} from './mode_interface.ts';

const eventMapper = {
	drag: 'onDrag',
	click: 'onClick',
	mousemove: 'onMouseMove',
	mousedown: 'onMouseDown',
	mouseup: 'onMouseUp',
	mouseout: 'onMouseOut',
	keyup: 'onKeyUp',
	keydown: 'onKeyDown',
	touchstart: 'onTouchStart',
	touchmove: 'onTouchMove',
	touchend: 'onTouchEnd',
	tap: 'onTap',
};

const eventKeys = Object.keys(eventMapper);

export function objectToMode(modeObject) {
	return function (ctx, startOpts = {}) {
		let state = {};

		let mode;
		if (typeof modeObject === 'function') {
			// modeObject is a class constructor
			mode = new modeObject(ctx);
		}

		function wrapper(eh) {
			return (e) => mode[eh](state, e);
		}

		return {
			start() {
				state = mode.onSetup(startOpts);

				eventKeys.forEach((key) => {
					const modeHandler = eventMapper[key];
					let selector = () => false;
					if (typeof mode[modeHandler] === 'function') {
						selector = () => true;
					}
					this.on(key, selector, wrapper(modeHandler));
				});
			},
			stop() {
				if (typeof mode.onStop === 'function') {
					mode.onStop(state);
				}
			},
			trash() {
				if (typeof mode.onTrash === 'function') {
					mode.onTrash(state);
				}
			},
			combineFeatures() {
				if (typeof mode.onCombineFeatures === 'function') {
					mode.onCombineFeatures(state);
				}
			},
			uncombineFeatures() {
				if (typeof mode.onUncombineFeatures === 'function') {
					mode.onUncombineFeatures(state);
				}
			},
			render(geojson, push) {
				if (typeof mode.toDisplayFeatures === 'function') {
					mode.toDisplayFeatures(state, geojson, push);
				}
			},
		};
	};
}
