import { createSupplementaryPoints } from "../../lib/create_supplementary_points.ts";
import { moveFeatures } from "../../lib/move_features.ts";
import * as Constants from "../../constants.ts";
import { createSupplementaryPointsForCircle } from "../../lib/create_supplementary_points_circle.ts";
import SimpleSelect from "../simple_select.ts";

export class SimpleSelectMode extends SimpleSelect {
  dragMove(state, e) {
    // Dragging when drag move is enabled
    state.dragMoving = true;
    e.originalEvent.stopPropagation();

    const delta = {
      lng: e.lngLat.lng - state.dragMoveLocation.lng,
      lat: e.lngLat.lat - state.dragMoveLocation.lat,
    };

    moveFeatures(this.getSelected(), delta);

    this.getSelected()
      .filter((feature) => feature.properties.isCircle)
      .map((circle) => circle.properties.center)
      .forEach((center) => {
        center[0] += delta.lng;
        center[1] += delta.lat;
      });

    state.dragMoveLocation = e.lngLat;
  }

  toDisplayFeatures(state, geojson, display) {
    geojson.properties.active = this.isSelected(geojson.properties.id)
      ? Constants.activeStates.ACTIVE
      : Constants.activeStates.INACTIVE;
    display(geojson);
    this.fireActionable();
    if (
      geojson.properties.active !== Constants.activeStates.ACTIVE ||
      geojson.geometry.type === Constants.geojsonTypes.POINT
    )
      return;
    const supplementaryPoints = geojson.properties.user_isCircle
      ? createSupplementaryPointsForCircle(geojson)
      : createSupplementaryPoints(geojson);
    supplementaryPoints?.forEach(display);
  }
}
