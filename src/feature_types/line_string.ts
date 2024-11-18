import Feature from './feature.ts';

class LineString extends Feature {
	constructor(ctx, geojson) {
		super(ctx, geojson);
	}

	isValid() {
		return this.coordinates.length > 1;
	}

	addCoordinate(path, lng, lat) {
		this.changed();
		const id = parseInt(path, 10);
		this.coordinates.splice(id, 0, [lng, lat]);
	}

	getCoordinate(path) {
		const id = parseInt(path, 10);
		return JSON.parse(JSON.stringify(this.coordinates[id]));
	}

	removeCoordinate(path) {
		this.changed();
		this.coordinates.splice(parseInt(path, 10), 1);
	}

	updateCoordinate(path, lng, lat) {
		const id = parseInt(path, 10);
		this.coordinates[id] = [lng, lat];
		this.changed();
	}
}

export default LineString;
