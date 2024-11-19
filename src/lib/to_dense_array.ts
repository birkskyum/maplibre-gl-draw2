/**
 * Derive a dense array (no `undefined`s) from a single value or array.
 *
 * @param {any} x
 * @return {Array<any>}
 */
export function toDenseArray(x: any): Array<NonNullable<any>> {
	return [].concat(x).filter((y) => y !== undefined);
}
