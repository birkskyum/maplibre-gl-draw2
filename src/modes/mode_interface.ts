/**
 * Triggered while a mode is being transitioned into.
 * @param opts {Object} - this is the object passed via `draw.changeMode('mode', opts)`;
 * @name MODE.onSetup
 * @returns {Object} - this object will be passed to all other life cycle functions
 */
export interface ModeInterface {
  state?: object;

  onSetup?(opts?: object): object;

  /**
   * Triggered when a drag event is detected on the map
   * @name MODE.onDrag
   * @param state {Object} - a mutable state object created by onSetup
   * @param e {Object} - the captured event that is triggering this life cycle event
   */
  onDrag?(state: object, e: object): void;

  /**
   * Triggered when the mouse is clicked
   * @name MODE.onClick
   * @param state {Object} - a mutable state object created by onSetup
   * @param e {Object} - the captured event that is triggering this life cycle event
   */
  onClick?(state: object, e: object): void;

  /**
   * Triggered with the mouse is moved
   * @name MODE.onMouseMove
   * @param state {Object} - a mutable state object created by onSetup
   * @param e {Object} - the captured event that is triggering this life cycle event
   */
  onMouseMove?(state: object, e: object): void;

  /**
   * Triggered when the mouse button is pressed down
   * @name MODE.onMouseDown
   * @param state {Object} - a mutable state object created by onSetup
   * @param e {Object} - the captured event that is triggering this life cycle event
   */
  onMouseDown?(state: object, e: object): void;

  /**
   * Triggered when the mouse button is released
   * @name MODE.onMouseUp
   * @param state {Object} - a mutable state object created by onSetup
   * @param e {Object} - the captured event that is triggering this life cycle event
   */
  onMouseUp?(state: object, e: object): void;

  /**
   * Triggered when the mouse leaves the map's container
   * @name MODE.onMouseOut
   * @param state {Object} - a mutable state object created by onSetup
   * @param e {Object} - the captured event that is triggering this life cycle event
   */
  onMouseOut?(state: object, e: object): void;

  /**
   * Triggered when a key up event is detected
   * @name MODE.onKeyUp
   * @param state {Object} - a mutable state object created by onSetup
   * @param e {Object} - the captured event that is triggering this life cycle event
   */
  onKeyUp?(state: object, e: object): void;

  /**
   * Triggered when a key down event is detected
   * @name MODE.onKeyDown
   * @param state {Object} - a mutable state object created by onSetup
   * @param e {Object} - the captured event that is triggering this life cycle event
   */
  onKeyDown?(state: object, e: object): void;

  /**
   * Triggered when a touch event is started
   * @name MODE.onTouchStart
   * @param state {Object} - a mutable state object created by onSetup
   * @param e {Object} - the captured event that is triggering this life cycle event
   */
  onTouchStart?(state: object, e: object): void;

  /**
   * Triggered when one drags their finger on a mobile device
   * @name MODE.onTouchMove
   * @param state {Object} - a mutable state object created by onSetup
   * @param e {Object} - the captured event that is triggering this life cycle event
   */
  onTouchMove?(state: object, e: object): void;

  /**
   * Triggered when one removes their finger from the map
   * @name MODE.onTouchEnd
   * @param state {Object} - a mutable state object created by onSetup
   * @param e {Object} - the captured event that is triggering this life cycle event
   */
  onTouchEnd?(state: object, e: object): void;

  /**
   * Triggered when one quickly taps the map
   * @name MODE.onTap
   * @param state {Object} - a mutable state object created by onSetup
   * @param e {Object} - the captured event that is triggering this life cycle event
   */
  onTap?(state: object, e: object): void;

  /**
   * Triggered when the mode is being exited, to be used for cleaning up artifacts such as invalid features
   * @name MODE.onStop
   * @param state {Object} - a mutable state object created by onSetup
   */
  onStop?(state: object): void;

  /**
   * Triggered when [draw.trash()](https://github.com/birkskyum/maplibre-gl-draw/blob/main/API.md#trash-draw) is called.
   * @name MODE.onTrash
   * @param state {Object} - a mutable state object created by onSetup
   */
  onTrash?(state: object): void;

  /**
   * Triggered when [draw.combineFeatures()](https://github.com/birkskyum/maplibre-gl-draw/blob/main/API.md#combinefeatures-draw) is called.
   * @name MODE.onCombineFeature
   * @param state {Object} - a mutable state object created by onSetup
   */
  onCombineFeature?(state: object): void;

  /**
   * Triggered when [draw.uncombineFeatures()](https://github.com/birkskyum/maplibre-gl-draw/blob/main/API.md#uncombinefeatures-draw) is called.
   * @name MODE.onUncombineFeature
   * @param state {Object} - a mutable state object created by onSetup
   */
  onUncombineFeature?(state: object): void;

  /**
   * Triggered per feature on render to convert raw features into set of features for display on the map
   * See [styling draw](https://github.com/birkskyum/maplibre-gl-draw/blob/main/API.md#styling-draw) for information about what geojson properties Draw uses as part of rendering.
   * @name MODE.toDisplayFeatures
   * @param state {Object} - a mutable state object created by onSetup
   * @param geojson {Object} - a geojson being evaluated. To render, pass to `display`.
   * @param display {Function} - all geojson objects passed to this be rendered onto the map
   */
  toDisplayFeatures?(state: object, geojson: object, display: Function): void;
}
