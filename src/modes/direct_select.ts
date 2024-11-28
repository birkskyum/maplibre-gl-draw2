import {
  isActiveFeature,
  isInactiveFeature,
  isOfMetaType,
  isShiftDown,
  noTarget,
} from "../lib/common_selectors.ts";
import { createSupplementaryPoints } from "../lib/create_supplementary_points.ts";
import { constrainFeatureMovement } from "../lib/constrain_feature_movement.ts";
import { doubleClickZoom } from "../lib/double_click_zoom.ts";
import * as Constants from "../constants.ts";
import { moveFeatures } from "../lib/move_features.ts";
import { ModeInterface } from "./mode_interface.ts";
import { modes } from "../constants.ts";
import { ModeInterfaceAccessors } from "./mode_interface_accessors.ts";

const isVertex = isOfMetaType(Constants.meta.VERTEX);
const isMidpoint = isOfMetaType(Constants.meta.MIDPOINT);

export class DirectSelect extends ModeInterfaceAccessors implements ModeInterface {
  // Internal methods
  fireUpdate() {
    this.fire(Constants.events.UPDATE, {
      action: Constants.updateActions.CHANGE_COORDINATES,
      features: this.getSelected().map((f) => f.toGeoJSON()),
    });
  }

  fireActionable(state) {
    this.setActionableState({
      combineFeatures: false,
      uncombineFeatures: false,
      trash: state.selectedCoordPaths.length > 0,
    });
  }

  startDragging(state, e) {
    state.initialDragPanState = this.map.dragPan.isEnabled();
    this.map.dragPan.disable();
    state.canDragMove = true;
    state.dragMoveLocation = e.lngLat;
  }

  stopDragging(state) {
    if (state.canDragMove && state.initialDragPanState === true) {
      this.map.dragPan.enable();
    }
    state.dragMoving = false;
    state.canDragMove = false;
    state.dragMoveLocation = null;
  }

  pathsToCoordinates(featureId, paths) {
    return paths.map((coord_path) => ({ feature_id: featureId, coord_path }));
  }

  // Event handlers
  onSetup(opts) {
    const featureId = opts.featureId;
    const feature = this.getFeature(featureId);

    if (!feature) {
      throw new Error(
        "You must provide a featureId to enter direct_select mode",
      );
    }

    if (feature.type === Constants.geojsonTypes.POINT) {
      throw new TypeError("direct_select mode doesn't handle point features");
    }

    const state = {
      featureId,
      feature,
      dragMoveLocation: opts.startPos || null,
      dragMoving: false,
      canDragMove: false,
      selectedCoordPaths: opts.coordPath ? [opts.coordPath] : [],
    };

    this.setSelectedCoordinates(
      this.pathsToCoordinates(featureId, state.selectedCoordPaths),
    );
    this.setSelected(featureId);
    doubleClickZoom.disable(this);

    this.setActionableState({
      trash: true,
    });

    return state;
  }

  // Handle dragging
  dragFeature(state, e, delta) {
    moveFeatures(this.getSelected(), delta);
    state.dragMoveLocation = e.lngLat;
  }

  dragVertex(state, delta) {
    const selectedCoords = state.selectedCoordPaths.map((coord_path) =>
      state.feature.getCoordinate(coord_path)
    );
    const selectedCoordPoints = selectedCoords.map((coords) => ({
      type: Constants.geojsonTypes.FEATURE,
      properties: {},
      geometry: {
        type: Constants.geojsonTypes.POINT,
        coordinates: coords,
      },
    }));

    const constrainedDelta = constrainFeatureMovement(
      selectedCoordPoints,
      delta,
    );
    for (let i = 0; i < selectedCoords.length; i++) {
      const coord = selectedCoords[i];
      state.feature.updateCoordinate(
        state.selectedCoordPaths[i],
        coord[0] + constrainedDelta.lng,
        coord[1] + constrainedDelta.lat,
      );
    }
  }

  // Feature interaction handlers
  onVertex(state, e) {
    this.startDragging(state, e);
    const about = e.featureTarget.properties;
    const selectedIndex = state.selectedCoordPaths.indexOf(about.coord_path);
    if (!isShiftDown(e) && selectedIndex === -1) {
      state.selectedCoordPaths = [about.coord_path];
    } else if (isShiftDown(e) && selectedIndex === -1) {
      state.selectedCoordPaths.push(about.coord_path);
    }

    const selectedCoordinates = this.pathsToCoordinates(
      state.featureId,
      state.selectedCoordPaths,
    );
    this.setSelectedCoordinates(selectedCoordinates);
  }

  onMidpoint(state, e) {
    this.startDragging(state, e);
    const about = e.featureTarget.properties;
    state.feature.addCoordinate(about.coord_path, about.lng, about.lat);
    this.fireUpdate();
    state.selectedCoordPaths = [about.coord_path];
  }

  onFeature(state, e) {
    if (state.selectedCoordPaths.length === 0) this.startDragging(state, e);
    else this.stopDragging(state);
  }

  // Click handlers
  clickNoTarget() {
    this.changeMode(modes.simple_select);
  }

  clickInactive() {
    this.changeMode(modes.simple_select);
  }

  clickActiveFeature(state) {
    state.selectedCoordPaths = [];
    this.clearSelectedCoordinates();
    state.feature.changed();
  }

  // Mouse/Touch event handlers
  onMouseMove(state, e) {
    // On mousemove that is not a drag, stop vertex movement.
    const isFeature = isActiveFeature(e);
    const onVertex = isVertex(e);
    const isMidPoint = isMidpoint(e);
    const noCoords = state.selectedCoordPaths.length === 0;
    if (isFeature && noCoords) {
      this.updateUIClasses({ mouse: Constants.cursors.MOVE });
    } else if (onVertex && !noCoords) {
      this.updateUIClasses({ mouse: Constants.cursors.MOVE });
    } else this.updateUIClasses({ mouse: Constants.cursors.NONE });

    const isDraggableItem = onVertex || isFeature || isMidPoint;
    if (isDraggableItem && state.dragMoving) this.fireUpdate();

    this.stopDragging(state);

    // Skip render
    return true;
  }

  onMouseOut(state) {
    // As soon as you mouse leaves the canvas, update the feature
    if (state.dragMoving) this.fireUpdate();

    // Skip render
    return true;
  }

  onDrag(state, e) {
    if (state.canDragMove !== true) return;
    state.dragMoving = true;
    e.originalEvent.stopPropagation();

    const delta = {
      lng: e.lngLat.lng - state.dragMoveLocation.lng,
      lat: e.lngLat.lat - state.dragMoveLocation.lat,
    };
    if (state.selectedCoordPaths.length > 0) this.dragVertex(state, delta);
    else this.dragFeature(state, e, delta);

    state.dragMoveLocation = e.lngLat;
  }

  onClick(state, e) {
    if (noTarget(e)) return this.clickNoTarget();
    if (isActiveFeature(e)) return this.clickActiveFeature(state);
    if (isInactiveFeature(e)) return this.clickInactive();
    this.stopDragging(state);
  }

  onTap(state, e) {
    if (noTarget(e)) return this.clickNoTarget();
    if (isActiveFeature(e)) return this.clickActiveFeature(state, );
    if (isInactiveFeature(e)) return this.clickInactive();
  }

  onTouchStart(state, e) {
    if (isVertex(e)) return this.onVertex(state, e);
    if (isActiveFeature(e)) return this.onFeature(state, e);
    if (isMidpoint(e)) return this.onMidpoint(state, e);
  }

  onMouseDown(state, e) {
    if (isVertex(e)) return this.onVertex(state, e);
    if (isActiveFeature(e)) return this.onFeature(state, e);
    if (isMidpoint(e)) return this.onMidpoint(state, e);
  }

  onTouchEnd(state) {
    if (state.dragMoving) {
      this.fireUpdate();
    }
    this.stopDragging(state);
  }

  onMouseUp(state) {
    if (state.dragMoving) {
      this.fireUpdate();
    }
    this.stopDragging(state);
  }

  onStop() {
    doubleClickZoom.enable(this);
    this.clearSelectedCoordinates();
  }

  onTrash(state) {
    // Uses number-aware sorting to make sure '9' < '10'. Comparison is reversed because we want them
    // in reverse order so that we can remove by index safely.
    state.selectedCoordPaths
      .sort((a, b) => b.localeCompare(a, "en", { numeric: true }))
      .forEach((id) => state.feature.removeCoordinate(id));
    this.fireUpdate();
    state.selectedCoordPaths = [];
    this.clearSelectedCoordinates();
    this.fireActionable(state);
    if (state.feature.isValid() === false) {
      this.deleteFeature([state.featureId]);
      this.changeMode(modes.simple_select, {});
    }
  }

  toDisplayFeatures(state, geojson, push) {
    if (state.featureId === geojson.properties.id) {
      geojson.properties.active = Constants.activeStates.ACTIVE;
      push(geojson);
      createSupplementaryPoints(geojson, {
        midpoints: true,
        selectedPaths: state.selectedCoordPaths,
      }).forEach(push);
    } else {
      geojson.properties.active = Constants.activeStates.INACTIVE;
      push(geojson);
    }
    this.fireActionable(state);
  }
}

// For backwards compatibility
export default DirectSelect;
