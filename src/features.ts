
import { PolygonFeat } from "./feature_types/polygon.ts";
import { LineStringFeat } from "./feature_types/line_string.ts";
import { PointFeat } from "./feature_types/point.ts";
import { MultiFeature } from "./feature_types/multi_feature.ts";

export const featureTypes = {
  Polygon: PolygonFeat,
  LineString: LineStringFeat,
  Point: PointFeat,
  MultiPolygon: MultiFeature,
  MultiLineString: MultiFeature,
  MultiPoint: MultiFeature,
};