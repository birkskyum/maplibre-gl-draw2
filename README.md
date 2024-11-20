# @birkskyum/maplibre-gl-draw

[![JSR](https://jsr.io/badges/@birkskyum/maplibre-gl-draw)](https://jsr.io/@birkskyum/maplibre-gl-draw)

Adds support for drawing and editing features on [maplibre-gl.js](https://maplibre.org/maplibre-gl-js/docs/) maps. 

**Requires [maplibre-gl-js](https://github.com/birkskyum/maplibre-gl-js).**

**If you are developing with `maplibre-gl-draw`, see [API.md](https://github.com/mapbox/maplibre-gl-draw/blob/main/docs/API.md) for documentation.**

### Installing

```
npm install @birkskyum/maplibre-gl-draw
```

Draw ships with CSS, make sure you include it in your build.

### Usage in your application

#### JavaScript

**When using modules**

```js
import maplibregl from 'maplibre-gl';
import {MapLibreDraw} from "@birkskyum/maplibre-gl-draw";
```

**When using a CDN**


#### CSS

**When using modules**
 ```js
import '@birkskyum/maplibre-gl-draw/dist/maplibre-gl-draw.css'
 ```

**When using CDN**


### Typescript

Typescript definition files are available as part of the [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/mapbox__maplibre-gl-draw) package.

```
npm install @types/mapbox__maplibre-gl-draw
```

### Example usage

```js

var map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [40, -74.50],
  zoom: 9
});

var Draw = new MapLibreDraw();

// Map#addControl takes an optional second argument to set the position of the control.
// If no position is specified the control defaults to `top-right`. See the docs
// for more details: https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/#addcontrol

map.addControl(Draw, 'top-left');

map.on('load', function() {
  // ALL YOUR APPLICATION CODE
});
```

### See [API.md](https://github.com/birkskyum/maplibre-gl-draw/blob/main/docs/API.md) for complete reference.

### Enhancements and New Interactions

For additional functionality [check out our list of custom modes](https://github.com/mapbox/maplibre-gl-draw/blob/main/docs/MODES.md#available-custom-modes).

MapLibre Draw accepts functionality changes after the functionality has been proven out via a [custom mode](https://github.com/maplibre/maplibre-gl-draw/blob/main/docs/MODES.md#creating-modes-for-maplibre-draw). This lets users experiment and validate their mode before entering a review process, hopefully promoting innovation. When you write a custom mode, please open a PR adding it to our [list of custom modes](https://github.com/maplibre/maplibre-gl-draw/blob/main/docs/MODES.md#available-custom-modes).

### Developing and testing

Install dependencies, build the source files and crank up a server via:

```
git clone git@github.com:mapbox/maplibre-gl-draw.git
npm ci
npm start & open "http://localhost:9967/debug/?access_token=<token>"
```

### Testing

```
npm run test
```

### Publishing

To GitHub and NPM:

```
npm version (major|minor|patch)
git push --tags
git push
npm publish
```

To CDN:

```
# make sure you are authenticated for AWS
git checkout v{x.y.z}
npm ci
npm run prepublish
aws s3 cp --recursive --acl public-read dist s3://mapbox-gl-js/plugins/maplibre-gl-draw/v{x.y.z}
```

Update the version number in [the GL JS example](https://github.com/birkskyum/maplibre-gl-js/blob/publisher-production/docs/pages/example/maplibre-gl-draw.html).

### Naming actions

We're trying to follow standards when naming things. Here is a collection of links where we look for inspiration.

- https://turfjs.org
- https://shapely.readthedocs.io/en/latest/manual.html
