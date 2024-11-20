import { sortFeatures } from "./sort_features.ts";
import { mapEventToBoundingBox } from "./map_event_to_bounding_box.ts";
import * as Constants from "../constants.ts";
import { StringSet } from "./string_set.ts";
import type { Feature } from "geojson";
import { DrawContext } from ".././index.ts";
import type { BBox } from "geojson";


const META_TYPES = [
  Constants.meta.FEATURE,
  Constants.meta.MIDPOINT,
  Constants.meta.VERTEX,
];

// Requires either event or bbox
export const featuresAt = {
  click: featuresAtClick,
  touch: featuresAtTouch,
};

function featuresAtClick(
  event: MapMouseEvent,
  bbox: BBox,
  ctx: DrawContext,
): Feature[] {
  return featuresAtHandler(event, bbox, ctx, ctx.options.clickBuffer);
}

function featuresAtTouch(
  event: MapTouchEvent,
  bbox: BBox,
  ctx: DrawContext,
): Feature[] {
  return featuresAtHandler(event, bbox, ctx, ctx.options.touchBuffer);
}

function featuresAtHandler(
  event,
  bbox: BBox,
  ctx: DrawContext,
  buffer: number,
) {
  if (ctx.map === null) return [];

  const box = event ? mapEventToBoundingBox(event, buffer) : bbox;

  const queryParams = {};

  if (ctx.options.styles) {
    queryParams.layers = ctx.options.styles
      .map((s) => s.id)
      .filter((id) => ctx.map.getLayer(id) != null);
  }

  const features = ctx.map
    .queryRenderedFeatures(box, queryParams)
    .filter((feature) => META_TYPES.indexOf(feature.properties.meta) !== -1);

  const featureIds = new StringSet();
  const uniqueFeatures = [];
  features.forEach((feature) => {
    const featureId = feature.properties.id;
    if (featureIds.has(featureId)) return;
    featureIds.add(featureId);
    uniqueFeatures.push(feature);
  });

  return sortFeatures(uniqueFeatures);
}
