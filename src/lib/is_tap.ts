import {euclideanDistance} from './euclidean_distance.ts';

export const TAP_TOLERANCE = 25;
export const TAP_INTERVAL = 250;

export function isTap(start: { point?: { x: number; y: number }; time?: number },
	end: { point: { x: number; y: number }; time: number },
	options?: { tolerance?: number; interval?: number },
): boolean {
	const tolerance =
		options?.tolerance != null ? options?.tolerance : TAP_TOLERANCE;
	const interval = options?.interval != null ? options?.interval : TAP_INTERVAL;

	start.point = start.point || end.point;
	start.time = start.time || end.time;
	const moveDistance = euclideanDistance(start.point, end.point);

	return moveDistance < tolerance && end.time - start.time < interval;
}
