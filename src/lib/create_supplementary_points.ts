import { createVertex } from "./create_vertex.ts";
import { createMidPoint } from "./create_midpoint.ts";
import * as Constants from "../constants.ts";
import type { Feature, GeoJsonProperties,Polygon, Geometry, Point } from "geojson";

export function createSupplementaryPoints(
  geojson: Feature,
  options: { midpoints?: boolean; selectedPaths?: string[] } = {},
  basePath: string | null = null,
): Array<Feature<Point>> {
  const { type, coordinates } = geojson.geometry as any;
  const featureId = geojson.properties && geojson.properties.id;

  let supplementaryPoints: any[] = [];

  if (type === Constants.geojsonTypes.POINT) {
    // For points, just create a vertex
    supplementaryPoints.push(
      createVertex(
        featureId,
        coordinates,
        basePath!,
        isSelectedPath(basePath!),
      ),
    );
  } else if (type === Constants.geojsonTypes.POLYGON) {
    // Cycle through a Polygon's rings and
    // process each line
    coordinates.forEach((line, lineIndex) => {
      processLine(
        line,
        basePath !== null ? `${basePath}.${lineIndex}` : String(lineIndex),
      );
    });
  } else if (type === Constants.geojsonTypes.LINE_STRING) {
    processLine(coordinates, basePath);
  } else if (type.indexOf(Constants.geojsonTypes.MULTI_PREFIX) === 0) {
    processMultiGeometry();
  }

  function processLine(line, lineBasePath) {
    let firstPointString = "";
    let lastVertex: Feature<Point, GeoJsonProperties>;
    line.forEach((point, pointIndex) => {
      const pointPath = lineBasePath !== undefined && lineBasePath !== null
        ? `${lineBasePath}.${pointIndex}`
        : String(pointIndex);
      const vertex: Feature<Point, GeoJsonProperties> = createVertex(
        featureId,
        point,
        pointPath,
        isSelectedPath(pointPath),
      );

      // If we're creating midpoints, check if there was a
      // vertex before this one. If so, add a midpoint
      // between that vertex and this one.
      if (options.midpoints && lastVertex) {
        const midpoint = createMidPoint(featureId, lastVertex, vertex);
        if (midpoint) {
          supplementaryPoints.push(midpoint);
        }
      }
      lastVertex = vertex;

      // A Polygon line's last point is the same as the first point. If we're on the last
      // point, we want to draw a midpoint before it but not another vertex on it
      // (since we already a vertex there, from the first point).
      const stringifiedPoint = JSON.stringify(point);
      if (firstPointString !== stringifiedPoint) {
        supplementaryPoints.push(vertex);
      }
      if (pointIndex === 0) {
        firstPointString = stringifiedPoint;
      }
    });
  }

  function isSelectedPath(path: string) {
    if (!options.selectedPaths) return false;
    return options.selectedPaths.indexOf(path) !== -1;
  }

  // Split a multi-geometry into constituent
  // geometries, and accumulate the supplementary points
  // for each of those constituents
  function processMultiGeometry() {
    const subType = type.replace(Constants.geojsonTypes.MULTI_PREFIX, "");
    coordinates.forEach((subCoordinates, index) => {
      const subFeature: Feature<Geometry, GeoJsonProperties> = {
        type: Constants.geojsonTypes.FEATURE as "Feature",
        properties: geojson.properties,
        geometry: {
          type: subType as "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon" ,
          coordinates: subCoordinates,
        },
      };
      supplementaryPoints = supplementaryPoints.concat(
        createSupplementaryPoints(subFeature, options, index),
      );
    });
  }

  return supplementaryPoints;
}
