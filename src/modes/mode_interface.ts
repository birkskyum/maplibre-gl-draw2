import { ModeInterfaceAccessors } from './mode_interface_accessors.ts';

/**
 * Triggered while a mode is being transitioned into.
 * @param opts {Object} - this is the object passed via `draw.changeMode('mode', opts)`;
 * @name MODE.onSetup
 * @returns {Object} - this object will be passed to all other life cycle functions
 */
export default class ModeInterface extends ModeInterfaceAccessors {
	onSetup() {}

	/**
	 * Triggered when a drag event is detected on the map
	 * @name MODE.onDrag
	 * @param state {Object} - a mutible state object created by onSetup
	 * @param e {Object} - the captured event that is triggering this life cycle event
	 */
	onDrag() {}

	/**
	 * Triggered when the mouse is clicked
	 * @name MODE.onClick
	 * @param state {Object} - a mutible state object created by onSetup
	 * @param e {Object} - the captured event that is triggering this life cycle event
	 */
	onClick() {}

	/**
	 * Triggered with the mouse is moved
	 * @name MODE.onMouseMove
	 * @param state {Object} - a mutible state object created by onSetup
	 * @param e {Object} - the captured event that is triggering this life cycle event
	 */
	onMouseMove() {}

	/**
	 * Triggered when the mouse button is pressed down
	 * @name MODE.onMouseDown
	 * @param state {Object} - a mutible state object created by onSetup
	 * @param e {Object} - the captured event that is triggering this life cycle event
	 */
	onMouseDown() {}

	/**
	 * Triggered when the mouse button is released
	 * @name MODE.onMouseUp
	 * @param state {Object} - a mutible state object created by onSetup
	 * @param e {Object} - the captured event that is triggering this life cycle event
	 */
	onMouseUp() {}

	/**
	 * Triggered when the mouse leaves the map's container
	 * @name MODE.onMouseOut
	 * @param state {Object} - a mutible state object created by onSetup
	 * @param e {Object} - the captured event that is triggering this life cycle event
	 */
	onMouseOut() {}

	/**
	 * Triggered when a key up event is detected
	 * @name MODE.onKeyUp
	 * @param state {Object} - a mutible state object created by onSetup
	 * @param e {Object} - the captured event that is triggering this life cycle event
	 */
	onKeyUp() {}

	/**
	 * Triggered when a key down event is detected
	 * @name MODE.onKeyDown
	 * @param state {Object} - a mutible state object created by onSetup
	 * @param e {Object} - the captured event that is triggering this life cycle event
	 */
	onKeyDown() {}

	/**
	 * Triggered when a touch event is started
	 * @name MODE.onTouchStart
	 * @param state {Object} - a mutible state object created by onSetup
	 * @param e {Object} - the captured event that is triggering this life cycle event
	 */
	onTouchStart() {}

	/**
	 * Triggered when one drags thier finger on a mobile device
	 * @name MODE.onTouchMove
	 * @param state {Object} - a mutible state object created by onSetup
	 * @param e {Object} - the captured event that is triggering this life cycle event
	 */
	onTouchMove() {}

	/**
	 * Triggered when one removes their finger from the map
	 * @name MODE.onTouchEnd
	 * @param state {Object} - a mutible state object created by onSetup
	 * @param e {Object} - the captured event that is triggering this life cycle event
	 */
	onTouchEnd() {}

	/**
	 * Triggered when one quicly taps the map
	 * @name MODE.onTap
	 * @param state {Object} - a mutible state object created by onSetup
	 * @param e {Object} - the captured event that is triggering this life cycle event
	 */
	onTap() {}

	/**
	 * Triggered when the mode is being exited, to be used for cleaning up artifacts such as invalid features
	 * @name MODE.onStop
	 * @param state {Object} - a mutible state object created by onSetup
	 */
	onStop() {}

	/**
	 * Triggered when [draw.trash()](https://github.com/mapbox/maplibre-gl-draw/blob/main/API.md#trash-draw) is called.
	 * @name MODE.onTrash
	 * @param state {Object} - a mutible state object created by onSetup
	 */
	onTrash() {}

	/**
	 * Triggered when [draw.combineFeatures()](https://github.com/mapbox/maplibre-gl-draw/blob/main/API.md#combinefeatures-draw) is called.
	 * @name MODE.onCombineFeature
	 * @param state {Object} - a mutible state object created by onSetup
	 */
	onCombineFeature() {}

	/**
	 * Triggered when [draw.uncombineFeatures()](https://github.com/mapbox/maplibre-gl-draw/blob/main/API.md#uncombinefeatures-draw) is called.
	 * @name MODE.onUncombineFeature
	 * @param state {Object} - a mutible state object created by onSetup
	 */
	onUncombineFeature() {}

	/**
	 * Triggered per feature on render to convert raw features into set of features for display on the map
	 * See [styling draw](https://github.com/mapbox/maplibre-gl-draw/blob/main/API.md#styling-draw) for information about what geojson properties Draw uses as part of rendering.
	 * @name MODE.toDisplayFeatures
	 * @param state {Object} - a mutible state object created by onSetup
	 * @param geojson {Object} - a geojson being evaulated. To render, pass to `display`.
	 * @param display {Function} - all geojson objects passed to this be rendered onto the map
	 */
	toDisplayFeatures() {
		throw new Error('You must overwrite toDisplayFeatures');
	}
}
