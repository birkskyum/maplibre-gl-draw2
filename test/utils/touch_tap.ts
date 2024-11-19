export function touchTap(map, payload) {
	map.fire('touchstart', payload);
	map.fire('touchend', payload);
}
