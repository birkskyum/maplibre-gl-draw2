import { constrainFeatureMovement } from "./constrain_feature_movement.ts";
import * as Constants from "../constants.ts";
import type { Feat } from "../feature_types/feature.ts";
import type {Feature,Geometry, GeoJsonProperties} from"geojson";
export function moveFeatures(
  features: Feat[],
  delta: { lng: number; lat: number },
) {
  const constrainedDelta = constrainFeatureMovement(
    features.map((feature) => feature.toGeoJSON()) as Feature<Geometry, GeoJsonProperties>[],
    delta,
  );

  features.forEach((feature) => {
    const currentCoordinates = feature.getCoordinates();

    const moveCoordinate = (coord) => {
      const point = {
        lng: coord[0] + constrainedDelta.lng,
        lat: coord[1] + constrainedDelta.lat,
      };
      return [point.lng, point.lat];
    };
    const moveRing = (ring) => ring.map((coord) => moveCoordinate(coord));
    const moveMultiPolygon = (multi) => multi.map((ring) => moveRing(ring));

    let nextCoordinates;
    if (feature.type === Constants.geojsonTypes.POINT) {
      nextCoordinates = moveCoordinate(currentCoordinates);
    } else if (
      feature.type === Constants.geojsonTypes.LINE_STRING ||
      feature.type === Constants.geojsonTypes.MULTI_POINT
    ) {
      nextCoordinates = currentCoordinates.map(moveCoordinate);
    } else if (
      feature.type === Constants.geojsonTypes.POLYGON ||
      feature.type === Constants.geojsonTypes.MULTI_LINE_STRING
    ) {
      nextCoordinates = currentCoordinates.map(moveRing);
    } else if (feature.type === Constants.geojsonTypes.MULTI_POLYGON) {
      nextCoordinates = currentCoordinates.map(moveMultiPolygon);
    }

    feature.incomingCoords(nextCoordinates);
  });
}
