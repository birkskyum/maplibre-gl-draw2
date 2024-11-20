import type { Feature, GeoJsonProperties } from "geojson";
import * as Constants from "../constants.ts";
import type { Point } from "geojson";

export function createMidPoint(
  parent: string,
  startVertex: Feature<Point, GeoJsonProperties>,
  endVertex: Feature<Point, GeoJsonProperties>,
): Feature<Point> | null {
  const startCoord = startVertex.geometry.coordinates;
  const endCoord = endVertex.geometry.coordinates;

  // If a coordinate exceeds the projection, we can't calculate a midpoint,
  // so run away
  if (
    startCoord[1] > Constants.LAT_RENDERED_MAX ||
    startCoord[1] < Constants.LAT_RENDERED_MIN ||
    endCoord[1] > Constants.LAT_RENDERED_MAX ||
    endCoord[1] < Constants.LAT_RENDERED_MIN
  ) {
    return null;
  }

  const mid = {
    lng: (startCoord[0] + endCoord[0]) / 2,
    lat: (startCoord[1] + endCoord[1]) / 2,
  };

  return {
    type: Constants.geojsonTypes.FEATURE as "Feature",
    properties: {
      meta: Constants.meta.MIDPOINT,
      parent,
      lng: mid.lng,
      lat: mid.lat,
      coord_path: endVertex.properties?.coord_path,
    },
    geometry: {
      type: Constants.geojsonTypes.POINT as "Point",
      coordinates: [mid.lng, mid.lat],
    },
  };
}
