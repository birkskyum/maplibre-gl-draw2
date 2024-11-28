import * as Constants from '../constants';
import {doubleClickZoom} from '../lib/double_click_zoom';
import {createSupplementaryPoints} from '../lib/create_supplementary_points';
import * as CommonSelectors from '../lib/common_selectors';
import {moveFeatures} from '../lib/move_features';

import {bearing, center, midpoint, distance, destination, transformRotate, transformScale, lineString, point} from "@turf/turf"

import { ModeInterface } from './mode_interface';
import { modes } from '../constants.ts';
import { ModeInterfaceAccessors } from './mode_interface_accessors.ts';

const rotate = './img/rotate.png'
const  scale = './img/scale.png'

export const SRCenter = {
  Center: 0, // rotate or scale around center of polygon
  Opposite: 1, // rotate or scale around opposite side of polygon
};

export const SRStyle = [
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['!=', 'user_type', 'overlay'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'fill-color': '#3bb2d0',
      'fill-outline-color': '#3bb2d0',
      'fill-opacity': 0.2,
    },
  },
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: [
      'all',
      ['==', 'active', 'true'],
      ['==', '$type', 'Polygon'],
      ['!=', 'user_type', 'overlay'],
    ],
    paint: {
      'fill-color': '#fbb03b',
      'fill-outline-color': '#fbb03b',
      'fill-opacity': 0.2,
    },
  },

  {
    id: 'gl-draw-overlay-polygon-fill-inactive',
    type: 'fill',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['==', 'user_type', 'overlay'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'fill-color': '#3bb2d0',
      'fill-outline-color': '#3bb2d0',
      'fill-opacity': 0.01,
    },
  },
  {
    id: 'gl-draw-overlay-polygon-fill-active',
    type: 'fill',
    filter: [
      'all',
      ['==', 'active', 'true'],
      ['==', '$type', 'Polygon'],
      ['==', 'user_type', 'overlay'],
    ],
    paint: {
      'fill-color': '#fbb03b',
      'fill-outline-color': '#fbb03b',
      'fill-opacity': 0.01,
    },
  },

  {
    id: 'gl-draw-polygon-stroke-inactive',
    type: 'line',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['!=', 'user_type', 'overlay'],
      ['!=', 'mode', 'static'],
    ],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#3bb2d0',
      'line-width': 2,
    },
  },

  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#fbb03b',
      'line-dasharray': [0.2, 2],
      'line-width': 2,
    },
  },

  {
    id: 'gl-draw-polygon-midpoint',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 3,
      'circle-color': '#fbb03b',
    },
  },

  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'LineString'],
      ['!=', 'mode', 'static'],
    ],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#3bb2d0',
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#fbb03b',
      'line-dasharray': [0.2, 2],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    type: 'circle',
    filter: [
      'all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 4,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-inactive',
    type: 'circle',
    filter: [
      'all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 2,
      'circle-color': '#fbb03b',
    },
  },

  {
    id: 'gl-draw-polygon-and-line-vertex-scale-icon',
    type: 'symbol',
    filter: [
      'all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static'],
      ['has', 'heading'],
    ],
    layout: {
      'icon-image': 'scale',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-rotation-alignment': 'map',
      'icon-rotate': ['get', 'heading'],
    },
    paint: {
      'icon-opacity': 1.0,
      'icon-opacity-transition': {
        delay: 0,
        duration: 0,
      },
    },
  },

  {
    id: 'gl-draw-point-point-stroke-inactive',
    type: 'circle',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 5,
      'circle-opacity': 1,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-point-inactive',
    type: 'circle',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 3,
      'circle-color': '#3bb2d0',
    },
  },
  {
    id: 'gl-draw-point-stroke-active',
    type: 'circle',
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'active', 'true'],
      ['!=', 'meta', 'midpoint'],
    ],
    paint: {
      'circle-radius': 4,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-point-active',
    type: 'circle',
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['!=', 'meta', 'midpoint'],
      ['==', 'active', 'true'],
    ],
    paint: {
      'circle-radius': 2,
      'circle-color': '#fbb03b',
    },
  },
  {
    id: 'gl-draw-polygon-fill-static',
    type: 'fill',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#404040',
      'fill-outline-color': '#404040',
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-polygon-stroke-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-line-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-point-static',
    type: 'circle',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#404040',
    },
  },

  // {
  //     'id': 'gl-draw-polygon-rotate-point',
  //     'type': 'circle',
  //     'filter': ['all',
  //         ['==', '$type', 'Point'],
  //         ['==', 'meta', 'rotate_point']],
  //     'paint': {
  //         'circle-radius': 5,
  //         'circle-color': '#fbb03b'
  //     }
  // },

  {
    id: 'gl-draw-line-rotate-point',
    type: 'line',
    filter: [
      'all',
      ['==', 'meta', 'midpoint'],
      ['==', 'icon', 'rotate'],
      ['==', '$type', 'LineString'],
      ['!=', 'mode', 'static'],
      // ['==', 'active', 'true']
    ],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#fbb03b',
      'line-dasharray': [0.2, 2],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-polygon-rotate-point-stroke',
    type: 'circle',
    filter: [
      'all',
      ['==', 'meta', 'midpoint'],
      ['==', 'icon', 'rotate'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 4,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-polygon-rotate-point',
    type: 'circle',
    filter: [
      'all',
      ['==', 'meta', 'midpoint'],
      ['==', 'icon', 'rotate'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 2,
      'circle-color': '#fbb03b',
    },
  },
  {
    id: 'gl-draw-polygon-rotate-point-icon',
    type: 'symbol',
    filter: [
      'all',
      ['==', 'meta', 'midpoint'],
      ['==', 'icon', 'rotate'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static'],
    ],
    layout: {
      'icon-image': 'rotate',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-rotation-alignment': 'map',
      'icon-rotate': ['get', 'heading'],
    },
    paint: {
      'icon-opacity': 1.0,
      'icon-opacity-transition': {
        delay: 0,
        duration: 0,
      },
    },
  },
];

function parseSRCenter(value, defaultSRCenter = SRCenter.Center) {
  if (value == undefined || value == null) return defaultSRCenter;

  if (value === SRCenter.Center || value === SRCenter.Opposite) return value;

  if (value == 'center') return SRCenter.Center;

  if (value == 'opposite') return SRCenter.Opposite;

  throw Error('Invalid SRCenter: ' + value);
}

/*
    opts = {
        featureId: ...,

        canScale: default true,
        canRotate: default true,

        rotatePivot: default 'center' or 'opposite',
        scaleCenter: default 'center' or 'opposite',

        canSelectFeatures: default true,    // can exit to simple_select mode
    }
 */

export class SRMode extends ModeInterfaceAccessors implements ModeInterface {

  onSetup(opts) {
    const featureId = this.getSelected()[0].id;

    const feature = this.getFeature(featureId);

    if (!feature) {
      throw new Error('You must provide a valid featureId to enter SRMode');
    }

    if (
      feature.type === Constants.geojsonTypes.POINT ||
      feature.type === Constants.geojsonTypes.MULTI_POINT
    ) {
      throw new TypeError('SRMode can not handle points');
    }
    //   if (
    //     feature.coordinates === undefined ||
    //     feature.coordinates.length != 1 ||
    //     feature.coordinates[0].length <= 2
    //   ) {
    //     throw new TypeError('SRMode can only handle polygons');
    //   }

    const state = {
      featureId,
      feature,

      canTrash: opts.canTrash != undefined ? opts.canTrash : true,

      canScale: opts.canScale != undefined ? opts.canScale : true,
      canRotate: opts.canRotate != undefined ? opts.canRotate : true,

      singleRotationPoint:
        opts.singleRotationPoint != undefined ? opts.singleRotationPoint : false,
      rotationPointRadius:
        opts.rotationPointRadius != undefined ? opts.rotationPointRadius : 1.0,

      rotatePivot: parseSRCenter(opts.rotatePivot, SRCenter.Center),
      scaleCenter: parseSRCenter(opts.scaleCenter, SRCenter.Center),

      canSelectFeatures:
        opts.canSelectFeatures != undefined ? opts.canSelectFeatures : true,
      // selectedFeatureMode: opts.selectedFeatureMode != undefined ? opts.selectedFeatureMode : 'simple_select',

      dragMoveLocation: opts.startPos || null,
      dragMoving: false,
      canDragMove: false,
      selectedCoordPaths: opts.coordPath ? [opts.coordPath] : [],
    };

    if (!(state.canRotate || state.canScale)) {
      console.warn('Non of canScale or canRotate is true');
    }

    this.setSelectedCoordinates(
      this.pathsToCoordinates(featureId, state.selectedCoordPaths)
    );
    this.setSelected(featureId);
    doubleClickZoom.disable(this);

    this.setActionableState({
      combineFeatures: false,
      uncombineFeatures: false,
      trash: state.canTrash,
    });

    var _this = this;
    // this.map.loadImage(rotate, function (error, image) {
    //   console.log(image)
    //   if (error) throw error;
    //   _this.map.addImage('rotate', image);
    // });
    // this.map.loadImage(scale, function (error, image) {
    //   if (error) throw error;
    //   _this.map.addImage('scale', image);
    // });

    return state;
  };

  toDisplayFeatures(state, geojson, push) {
    if (state.featureId === geojson.properties.id) {
      geojson.properties.active = Constants.activeStates.ACTIVE;
      push(geojson);

      var suppPoints = createSupplementaryPoints(geojson, {
        map: this.map,
        midpoints: false,
        selectedPaths: state.selectedCoordPaths,
      });

      if (state.canScale) {
        this.computeBisectrix(suppPoints);
        suppPoints.forEach(push);
      }

      if (state.canRotate) {
        var rotPoints = this.createRotationPoints(state, geojson, suppPoints);
        rotPoints.forEach(push);
      }
    } else {
      geojson.properties.active = Constants.activeStates.INACTIVE;
      push(geojson);
    }

    // this.fireActionable(state);
    this.setActionableState({
      combineFeatures: false,
      uncombineFeatures: false,
      trash: state.canTrash,
    });

    // this.fireUpdate();
  };

  onStop() {
    doubleClickZoom.enable(this);
    this.clearSelectedCoordinates();
  };

  // TODO why I need this?
  pathsToCoordinates(featureId, paths) {
    return paths.map((coord_path) => {
      return { feature_id: featureId, coord_path };
    });
  };

  computeBisectrix(points) {
    for (var i1 = 0; i1 < points.length; i1++) {
      var i0 = (i1 - 1 + points.length) % points.length;
      var i2 = (i1 + 1) % points.length;

      var l1 = lineString([
        points[i0].geometry.coordinates,
        points[i1].geometry.coordinates,
      ]);
      var l2 = lineString([
        points[i1].geometry.coordinates,
        points[i2].geometry.coordinates,
      ]);
      var a1 = bearing(
        points[i0].geometry.coordinates,
        points[i1].geometry.coordinates
      );
      var a2 = bearing(
        points[i2].geometry.coordinates,
        points[i1].geometry.coordinates
      );

      var a = (a1 + a2) / 2.0;

      if (a < 0.0) a += 360;
      if (a > 360) a -= 360;

      points[i1].properties.heading = a;
    }
  };

  _createRotationPoint(
    rotationWidgets,
    featureId,
    v1,
    v2,
    rotCenter,
    radiusScale
  ) {
    var cR0 = midpoint(v1, v2).geometry.coordinates;
    var heading = bearing(rotCenter, cR0);
    var distance0 = distance(rotCenter, cR0);
    var distance1 = radiusScale * distance0; // TODO depends on map scale
    var cR1 = destination(rotCenter, distance1, heading, {}).geometry.coordinates;

    rotationWidgets.push({
      type: Constants.geojsonTypes.FEATURE,
      properties: {
        meta: Constants.meta.MIDPOINT,
        icon: 'rotate',
        parent: featureId,
        lng: cR1[0],
        lat: cR1[1],
        coord_path: v1.properties.coord_path,
        heading: heading,
      },
      geometry: {
        type: Constants.geojsonTypes.POINT,
        coordinates: cR1,
      },
    });
  };

  createRotationPoints(state, geojson, suppPoints) {
    const { type, coordinates } = geojson.geometry;
    const featureId = geojson.properties && geojson.properties.id;

    let rotationWidgets = [];
    if (
      type === Constants.geojsonTypes.POINT ||
      type === Constants.geojsonTypes.MULTI_POINT
    ) {
      return;
    }

    var corners = suppPoints.slice(0);
    corners[corners.length] = corners[0];

    var v1 = null;

    var rotCenter = this.computeRotationCenter(state, geojson);

    if (state.singleRotationPoint) {
      this._createRotationPoint(
        rotationWidgets,
        featureId,
        corners[0],
        corners[1],
        rotCenter,
        state.rotationPointRadius
      );
    } else {
      corners.forEach((v2) => {
        if (v1 != null) {
          this._createRotationPoint(
            rotationWidgets,
            featureId,
            v1,
            v2,
            rotCenter,
            state.rotationPointRadius
          );
        }

        v1 = v2;
      });
    }
    return rotationWidgets;
  };

  startDragging(state, e) {
    this.map.dragPan.disable();
    state.canDragMove = true;
    state.dragMoveLocation = e.lngLat;
  };

  stopDragging(state) {
    this.map.dragPan.enable();
    state.dragMoving = false;
    state.canDragMove = false;
    state.dragMoveLocation = null;
  };

  isRotatePoint = CommonSelectors.isOfMetaType(Constants.meta.MIDPOINT);
  isVertex = CommonSelectors.isOfMetaType(Constants.meta.VERTEX);

  onTouchStart(state, e) {
    if (this.isVertex(e)) return this.onVertex(state, e);
    if (this.isRotatePoint(e)) return this.onRotatePoint(state, e);
    if (CommonSelectors.isActiveFeature(e)) return this.onFeature(state, e);
    // if (isMidpoint(e)) return this.onMidpoint(state, e);
  };
  
  onMouseDown(state, e) {
    if (this.isVertex(e)) return this.onVertex(state, e);
    if (this.isRotatePoint(e)) return this.onRotatePoint(state, e);
    if (CommonSelectors.isActiveFeature(e)) return this.onFeature(state, e);
    // if (isMidpoint(e)) return this.onMidpoint(state, e);
  };

  TxMode = {
    Scale: 1,
    Rotate: 2,
  };

  onVertex(state, e) {
    // convert internal MapboxDraw feature to valid GeoJSON:
    this.computeAxes(state, state.feature.toGeoJSON());

    this.startDragging(state, e);
    const about = e.featureTarget.properties;
    state.selectedCoordPaths = [about.coord_path];
    state.txMode = this.TxMode.Scale;
  };

  onRotatePoint(state, e) {
    // convert internal MapboxDraw feature to valid GeoJSON:
    this.computeAxes(state, state.feature.toGeoJSON());

    this.startDragging(state, e);
    const about = e.featureTarget.properties;
    state.selectedCoordPaths = [about.coord_path];
    state.txMode = this.TxMode.Rotate;
  };

  onFeature(state, e) {
    state.selectedCoordPaths = [];
    this.startDragging(state, e);
  };

  coordinateIndex(coordPaths) {
    if (coordPaths.length >= 1) {
      var parts = coordPaths[0].split('.');
      return parseInt(parts[parts.length - 1]);
    } else {
      return 0;
    }
  }

  computeRotationCenter(state, polygon) {
    var center0 = center(polygon);
    return center0;
  };

  computeAxes(state, polygon) {
    // TODO check min 3 points
    const center0 = this.computeRotationCenter(state, polygon);
    let corners;
    if (polygon.geometry.type === Constants.geojsonTypes.POLYGON)
      corners = polygon.geometry.coordinates[0].slice(0);
    else if (polygon.geometry.type === Constants.geojsonTypes.MULTI_POLYGON) {
      let temp = [];
      polygon.geometry.coordinates.forEach((c) => {
        c.forEach((c2) => {
          c2.forEach((c3) => {
            temp.push(c3);
          });
        });
      });
      corners = temp;
    } else if (polygon.geometry.type === Constants.geojsonTypes.LINE_STRING)
      corners = polygon.geometry.coordinates;
    else if (polygon.geometry.type === Constants.geojsonTypes.MULTI_LINE_STRING) {
      let temp = [];
      polygon.geometry.coordinates.forEach((c) => {
        c.forEach((c2) => {
          temp.push(c2);
        });
      });
      corners = temp;
    }

    const n = corners.length - 1;
    const iHalf = Math.floor(n / 2);

    var rotateCenters: any[] = [];
    var headings:any[] = [];

    for (var i1 = 0; i1 < n; i1++) {
      var i0 = i1 - 1;
      if (i0 < 0) i0 += n;

      const c0 = corners[i0];
      const c1 = corners[i1];
      const rotPoint = midpoint(point(c0), point(c1));

      var rotCenter = center0;
      if (SRCenter.Opposite === state.rotatePivot) {
        var i3 = (i1 + iHalf) % n; // opposite corner
        var i2 = i3 - 1;
        if (i2 < 0) i2 += n;

        const c2 = corners[i2];
        const c3 = corners[i3];
        rotCenter = midpoint(point(c2), point(c3));
      }

      rotateCenters[i1] = rotCenter.geometry.coordinates;
      headings[i1] = bearing(rotCenter, rotPoint);
    }

    state.rotation = {
      feature0: polygon, // initial feature state
      centers: rotateCenters,
      headings: headings, // rotation start heading for each point
    };

    // compute current distances from centers for scaling

    var scaleCenters: any[] = [];
    var distances: any[] = [];
    for (var i = 0; i < n; i++) {
      var c1 = corners[i];
      var c0 = center0.geometry.coordinates;
      if (SRCenter.Opposite === state.scaleCenter) {
        var i2 = (i + iHalf) % n; // opposite corner
        c0 = corners[i2];
      }
      scaleCenters[i] = c0;
      distances[i] = distance(point(c0), point(c1), { units: 'meters' });
    }

    state.scaling = {
      feature0: polygon, // initial feature state
      centers: scaleCenters,
      distances: distances,
    };
  };

  onDrag(state, e) {
    if (state.canDragMove !== true) return;
    state.dragMoving = true;
    e.originalEvent.stopPropagation();

    const delta = {
      lng: e.lngLat.lng - state.dragMoveLocation.lng,
      lat: e.lngLat.lat - state.dragMoveLocation.lat,
    };
    if (state.selectedCoordPaths.length > 0 && state.txMode) {
      switch (state.txMode) {
        case this.TxMode.Rotate:
          this.dragRotatePoint(state, e, delta);
          break;
        case this.TxMode.Scale:
          this.dragScalePoint(state, e, delta);
          break;
      }
    } else {
      this.dragFeature(state, e, delta);
    }

    state.dragMoveLocation = e.lngLat;
  };

  dragRotatePoint(state, e, delta) {
    if (state.rotation === undefined || state.rotation == null) {
      throw new Error('state.rotation required');
    }

    var polygon = state.feature.toGeoJSON();
    var m1 = point([e.lngLat.lng, e.lngLat.lat]);

    const n = state.rotation.centers.length;
    var cIdx = (this.coordinateIndex(state.selectedCoordPaths) + 1) % n;
    // TODO validate cIdx
    var cCenter = state.rotation.centers[cIdx];
    var center = point(cCenter);

    var heading1 = bearing(center, m1);

    var heading0 = state.rotation.headings[cIdx];
    var rotateAngle = heading1 - heading0; // in degrees
    if (CommonSelectors.isShiftDown(e)) {
      rotateAngle = 5.0 * Math.round(rotateAngle / 5.0);
    }

    var rotatedFeature = transformRotate(state.rotation.feature0, rotateAngle, {
      pivot: center,
      mutate: false,
    });

    state.feature.incomingCoords(rotatedFeature.geometry.coordinates);
    // TODO add option for this:
    this.fireUpdate();
  };

  dragScalePoint(state, e, delta) {
    if (state.scaling === undefined || state.scaling == null) {
      throw new Error('state.scaling required');
    }

    var polygon = state.feature.toGeoJSON();

    var cIdx = this.coordinateIndex(state.selectedCoordPaths);
    // TODO validate cIdx

    var cCenter = state.scaling.centers[cIdx];
    var center = point(cCenter);
    var m1 = point([e.lngLat.lng, e.lngLat.lat]);

    var dist = distance(center, m1, { units: 'meters' });
    var scale = dist / state.scaling.distances[cIdx];

    if (CommonSelectors.isShiftDown(e)) {
      // TODO discrete scaling
      scale = 0.05 * Math.round(scale / 0.05);
    }

    var scaledFeature = transformScale(state.scaling.feature0, scale, {
      origin: cCenter,
      mutate: false,
    });

    state.feature.incomingCoords(scaledFeature.geometry.coordinates);
    // TODO add option for this:
    this.fireUpdate();
  };

  dragFeature(state, e, delta) {
    moveFeatures(this.getSelected(), delta);
    state.dragMoveLocation = e.lngLat;
    // TODO add option for this:
    this.fireUpdate();
  };

  fireUpdate() {
    this.map.fire(Constants.events.UPDATE, {
      action: Constants.updateActions.CHANGE_COORDINATES,
      features: this.getSelected().map((f) => f.toGeoJSON()),
    });
  };

  onMouseOut(state) {
    // As soon as you mouse leaves the canvas, update the feature
    if (state.dragMoving) {
      this.fireUpdate();
    }
  };

  onTouchEnd(state) {
    if (state.dragMoving) {
      this.fireUpdate();
    }
    this.stopDragging(state);
  };
  
  onMouseUp(state) {
    if (state.dragMoving) {
      this.fireUpdate();
    }
    this.stopDragging(state);
  };

  clickActiveFeature(state) {
    state.selectedCoordPaths = [];
    this.clearSelectedCoordinates();
    state.feature.changed();
  };

  onClick(state, e) {
    if (CommonSelectors.noTarget(e)) return this.clickNoTarget(state, e);
    if (CommonSelectors.isActiveFeature(e))
      return this.clickActiveFeature(state, e);
    if (CommonSelectors.isInactiveFeature(e)) return this.clickInactive(state, e);
    this.stopDragging(state);
  };

  clickNoTarget(state, e) {
    if (state.canSelectFeatures) this.changeMode(modes.simple_select);
  };

  clickInactive(state, e) {
    if (state.canSelectFeatures)
      this.changeMode(modes.simple_select, {
        featureIds: [e.featureTarget.properties.id],
      });
  };

  onTrash() {
    this.deleteFeature(this.getSelectedIds());
    // this.fireActionable();
  };

}