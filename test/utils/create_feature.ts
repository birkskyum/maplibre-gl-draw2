import { nanoid } from "nanoid";
import { getGeoJSON } from "./get_geojson.ts";

export function createFeature(featureType) {
  const feature = Object.assign(
    {
      id: nanoid(),
      properties: {},
    },
    getGeoJSON(featureType),
  );
  feature.toGeoJSON = () => feature;
  feature.setProperty = (property, name) => {
    feature.properties[property] = name;
  };
  return feature;
}
