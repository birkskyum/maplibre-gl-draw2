import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
	input: ['bench/index.js'],
	output: {
		file: 'dist/bench.js',
		format: 'iife',
		sourcemap: true,
		indent: false,
	},
	treeshake: true,
	plugins: [
		json(),
		replace({
			preventAssignment: true,
		}),
		resolve({
			browser: true,
			preferBuiltins: false,
		}),
		commonjs({
			// global keyword handling causes Webpack compatibility issues, so we disabled it:
			// https://github.com/mapbox/mapbox-gl-js/pull/6956
			ignoreGlobal: true,
		}),
		typescript({
			tsconfig: './tsconfig.json',
		}),
	],
};
