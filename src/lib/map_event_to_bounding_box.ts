import type { Position } from "geojson";
import type { MapMouseEvent, MapTouchEvent } from "../feature_types/feature.ts";

/**
 * Returns a bounding box representing the event's location.
 *
 * @param {Event} mapEvent - MapLibre GL JS map event, with a point properties.
 * @return {Array<Array<number>>} Bounding box.
 */
export function mapEventToBoundingBox(
  mapEvent: { point: { x: number; y: number } } | MapMouseEvent | MapTouchEvent,
  buffer: number = 0,
): Position[] {
  return [
    [mapEvent.point.x - buffer, mapEvent.point.y - buffer],
    [mapEvent.point.x + buffer, mapEvent.point.y + buffer],
  ];
}
