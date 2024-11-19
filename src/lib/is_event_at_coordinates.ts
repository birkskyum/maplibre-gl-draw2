import type { Position } from "geojson";
import type { MapMouseEvent } from "maplibre-gl";

export function isEventAtCoordinates(event: MapMouseEvent,
	coordinates: Position[],
): boolean {
	if (!event.lngLat) return false;
	return (
		event.lngLat.lng === coordinates[0] && event.lngLat.lat === coordinates[1]
	);
}
