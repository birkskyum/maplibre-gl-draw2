import Feature from './feature.ts';

class Point extends Feature {

	isValid() {
		return (
			typeof this.coordinates[0] === 'number' &&
			typeof this.coordinates[1] === 'number'
		);
	}

	updateCoordinate(pathOrLng, lngOrLat, lat) {
		if (arguments.length === 3) {
			this.coordinates = [lngOrLat, lat];
		} else {
			this.coordinates = [pathOrLng, lngOrLat];
		}
		this.changed();
	}

	getCoordinate() {
		return this.getCoordinates();
	}
}

export default Point;
