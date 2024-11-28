import * as Constants from '../../constants.ts'
import {doubleClickZoom} from '../../lib/double_click_zoom.ts'
import {circle, distance, point} from '@turf/turf'

import DrawPolygon from '../draw_polygon.ts'
import { modes } from '../../constants.ts'


export class DragCircleMode extends DrawPolygon{
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
  dragPan.disable(this);
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.activateUIButton(Constants.types.POLYGON);
  this.setActionableState({
    trash: true
  });

  return {
    polygon,
    currentVertexPosition: 0
  };
};

onTouchStart(state, e) {
  const currentCenter = state.polygon.properties.center;
  if (currentCenter.length === 0) {
    state.polygon.properties.center = [e.lngLat.lng, e.lngLat.lat];
  }
};
onMouseDown(state, e) {
  const currentCenter = state.polygon.properties.center;
  if (currentCenter.length === 0) {
    state.polygon.properties.center = [e.lngLat.lng, e.lngLat.lat];
  }
};

onMouseMove(state, e) {
  const center = state.polygon.properties.center;
  if (center.length > 0) {
    const distanceInKm = distance(
      point(center),
      point([e.lngLat.lng, e.lngLat.lat]),
      { units : 'kilometers'});
    const circleFeature = circle(center, distanceInKm);
    state.polygon.incomingCoords(circleFeature.geometry.coordinates);
    state.polygon.properties.radiusInKm = distanceInKm;
  }
};

onDrag(state, e) {
  const center = state.polygon.properties.center;
  if (center.length > 0) {
    const distanceInKm = distance(
      point(center),
      point([e.lngLat.lng, e.lngLat.lat]),
      { units : 'kilometers'});
    const circleFeature = circle(center, distanceInKm);
    state.polygon.incomingCoords(circleFeature.geometry.coordinates);
    state.polygon.properties.radiusInKm = distanceInKm;
  }
};

onTouchEnd(state, e) {
  dragPan.enable(this);
  return this.changeMode(modes.simple_select, { featureIds: [state.polygon.id] });
};
onMouseUp(state, e) {
  dragPan.enable(this);
  return this.changeMode(modes.simple_select, { featureIds: [state.polygon.id] });
};

onTap(state, e) {
  // don't draw the circle if its a tap or click event
  state.polygon.properties.center = [];
};
onClick(state, e) {
  // don't draw the circle if its a tap or click event
  state.polygon.properties.center = [];
};

toDisplayFeatures(state, geojson, display) {
  const isActivePolygon = geojson.properties.id === state.polygon.id;
  geojson.properties.active = (isActivePolygon) ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
  return display(geojson);
};
}

const dragPan = {
  enable(ctx) {
      setTimeout(() => {
          // First check we've got a map and some context.
          if (!ctx.map || !ctx.map.dragPan || !ctx._ctx || !ctx._ctx.store || !ctx._ctx.store.getInitialConfigValue) return;
          // Now check initial state wasn't false (we leave it disabled if so)
          if (!ctx._ctx.store.getInitialConfigValue('dragPan')) return;
          ctx.map.dragPan.enable();
      }, 0);
  },
  disable(ctx) {
      setTimeout(() => {
          if (!ctx.map || !ctx.map.doubleClickZoom) return;
          // Always disable here, as it's necessary in some cases.
          ctx.map.dragPan.disable();
      }, 0);
  }
};
