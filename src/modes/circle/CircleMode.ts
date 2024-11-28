import DrawPolygon from '../draw_polygon.ts';
import * as Constants from '../../constants.ts';
import {circle} from '@turf/turf'
import {doubleClickZoom} from '../../lib/double_click_zoom.ts';
import { ModeStrings } from '../../constants/modes.ts';

const DEFAULT_RADIUS_IN_KM = 2;

export class CircleMode extends DrawPolygon {

  onSetup(opts) {
    const polygon = this.newFeature({
      type: Constants.geojsonTypes.FEATURE,
      properties: {
        isCircle: true,
        center: []
      },
      geometry: {
        type: Constants.geojsonTypes.POLYGON,
        coordinates: [[]]
      }
    });


    this.addFeature(polygon);

    this.clearSelectedFeatures();
    doubleClickZoom.disable(this);
    this.updateUIClasses({ mouse: Constants.cursors.ADD });
    this.activateUIButton(Constants.types.POLYGON);
    this.setActionableState({
      trash: true
    });

    return {
      initialRadiusInKm: opts.initialRadiusInKm || DEFAULT_RADIUS_IN_KM,
      polygon,
      currentVertexPosition: 0
    };
  };

  public clickAnywhere(state, e) {
    if (state.currentVertexPosition === 0) {
      state.currentVertexPosition++;
      const center = [e.lngLat.lng, e.lngLat.lat];
      const circleFeature = circle(center, state.initialRadiusInKm);
      state.polygon.incomingCoords(circleFeature.geometry.coordinates);
      state.polygon.properties.center = center;
      state.polygon.properties.radiusInKm = state.initialRadiusInKm;
    }
    return this.changeMode(ModeStrings.simple_select, { featureIds: [state.polygon.id] });
  };
}

