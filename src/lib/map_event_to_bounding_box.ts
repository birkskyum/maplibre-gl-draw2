/**
 * Returns a bounding box representing the event's location.
 *
 * @param {Event} mapEvent - MapLibre GL JS map event, with a point properties.
 * @return {Array<Array<number>>} Bounding box.
 */
export function mapEventToBoundingBox(mapEvent, buffer = 0) {
	return [
		[mapEvent.point.x - buffer, mapEvent.point.y - buffer],
		[mapEvent.point.x + buffer, mapEvent.point.y + buffer],
	];
}

