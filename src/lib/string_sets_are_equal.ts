import type { Feature } from 'geojson';

export function stringSetsAreEqual(
	a: Array<Pick<Feature, 'id'>>,
	b: Array<Pick<Feature, 'id'>>,
): boolean {
	if (a.length !== b.length) return false;
	return (
		JSON.stringify(a.map((id) => id).sort()) ===
		JSON.stringify(b.map((id) => id).sort())
	);
}
