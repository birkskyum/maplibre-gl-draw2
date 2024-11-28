import DirectSelect from "../direct_select";

import {createSupplementaryPoints} from '../../lib/create_supplementary_points.ts';
import { moveFeatures } from "../../lib/move_features.ts";
import * as Constants from '../../constants';
import {constrainFeatureMovement} from '../../lib/constrain_feature_movement';
import {distance, circle, point} from '@turf/turf';

import {createSupplementaryPointsForCircle} from '../../lib/create_supplementary_points_circle.ts';



export class DirectModeOverride extends DirectSelect {

  dragFeature(state, e, delta) {
    moveFeatures(this.getSelected(), delta);
    this.getSelected()
      .filter(feature => feature.properties.isCircle)
      .map(circle => circle.properties.center)
      .forEach(center => {
        center[0] += delta.lng;
        center[1] += delta.lat;
      });
    state.dragMoveLocation = e.lngLat;
  };

  dragVertex(state, e, delta?) {
    if (state.feature.properties.isCircle) {
      const center = state.feature.properties.center;
      const movedVertex = [e.lngLat.lng, e.lngLat.lat];
      const radius = distance(point(center), point(movedVertex), {units: 'kilometers'});
      const circleFeature = circle(center, radius);
      state.feature.incomingCoords(circleFeature.geometry.coordinates);
      state.feature.properties.radiusInKm = radius;
    } else {
      const selectedCoords = state.selectedCoordPaths.map(coord_path => state.feature.getCoordinate(coord_path));
      const selectedCoordPoints = selectedCoords.map(coords => ({
        type: Constants.geojsonTypes.FEATURE,
        properties: {},
        geometry: {
          type: Constants.geojsonTypes.POINT,
          coordinates: coords
        }
      }));

      const constrainedDelta = constrainFeatureMovement(selectedCoordPoints, delta);
      for (let i = 0; i < selectedCoords.length; i++) {
        const coord = selectedCoords[i];
        state.feature.updateCoordinate(state.selectedCoordPaths[i], coord[0] + constrainedDelta.lng, coord[1] + constrainedDelta.lat);
      }
    }
  };

  toDisplayFeatures(state, geojson, push) {
    if (state.featureId === geojson.properties.id) {
      geojson.properties.active = Constants.activeStates.ACTIVE;
      push(geojson);
      const supplementaryPoints = geojson.properties.user_isCircle ? createSupplementaryPointsForCircle(geojson)
        : createSupplementaryPoints(geojson, {
          // map: this.map,
          midpoints: true,
          selectedPaths: state.selectedCoordPaths
        });
      supplementaryPoints?.forEach(push);
    } else {
      geojson.properties.active = Constants.activeStates.INACTIVE;
      push(geojson);
    }
    this.fireActionable(state);

  }
}