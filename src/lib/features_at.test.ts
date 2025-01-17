import { test } from "vitest";
import {assert, assertEquals, assertNotEquals, assertThrows} from "@std/assert";
import { featuresAt } from "./features_at.ts";
import { theme } from "./theme.ts";
import * as Constants from "../constants.ts";
import { setupOptions } from "../setup.ts";

/**
 * Mock of the addLayers function in setup
 */
function addLayers(ctx) {
  // drawn features style
  ctx.map.addSource(Constants.sources.COLD, {
    data: {
      type: Constants.geojsonTypes.FEATURE_COLLECTION,
      features: [],
    },
    type: "geojson",
  });

  // hot features style
  ctx.map.addSource(Constants.sources.HOT, {
    data: {
      type: Constants.geojsonTypes.FEATURE_COLLECTION,
      features: [
        {
          type: "Feature",
          properties: {
            meta: "feature",
            id: "foo",
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [0, 0],
              [1, 1],
              [2, 2],
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            meta: "nothing",
            id: "bar",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [1, 1],
                [2, 2],
                [3, 3],
                [4, 4],
                [1, 1],
              ],
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            meta: "vertex",
            id: "baz",
          },
          geometry: {
            type: "Point",
            coordinates: [10, 10],
          },
        },
        {
          type: "Feature",
          properties: {
            meta: "vertex",
            id: "baz",
          },
          geometry: {
            type: "Point",
            coordinates: [10, 10],
          },
        },
      ],
    },
    type: "geojson",
  });

  ctx.options.styles.forEach((style) => {
    ctx.map.addLayer(style);
  });
}

/**
 * Mock context with a simplified maplibre-gl map (including some source/style/layer interactions)
 */
function createMockContext() {
  const _layers = {};
  const sources = {};
  const addSource = (id, source) => {
    _layers[id] = source;
  };
  const style = {
    _layers,
    getLayer: (id) => _layers[id],
    addLayer: (layerObject) => {
      addSource(layerObject.id, layerObject);
    },
    addSource,
    removeSource: (id) => {
      delete _layers[id];
    },
    queryRenderedFeatures: (_bbox, params) => {
      const features: any[] = [];
      const includedSources = {};
      if (params && params.layers) {
        for (const layerId of params.layers) {
          const layer = _layers[layerId];
          if (!layer) {
            // this layer is not in the style.layers array
            throw new ErrorEvent(
              
                `The layer '${layerId}' does not exist in the map's style and cannot be queried for features.`,
              
            );
          }
          includedSources[layer.source] = true;
        }
      }
      Object.keys(includedSources)
        .filter((source) => includedSources[source] != null)
        .forEach((source) => {
          if (sources[source] && sources[source].data) {
            features.push(...sources[source].data.features);
          }
        });
      return features;
    },
  };

  const context = {
    options: {
      styles: theme,
    },
    map: {
      setStyle: (newStyle) => {
        Object.keys(_layers).forEach((key) => delete _layers[key]);
        Object.values(newStyle).forEach((s) => {
          style.addLayer(s);
        });
      },
      addSource: (id, source) => {
        sources[id] = source;
        style.addSource(id, source);
      },
      removeSource: (id) => {
        style.removeSource(id);
        delete sources[id];
      },
      getLayer: (id) => style.getLayer(id),
      addLayer: (layer) => {
        style.addLayer(layer);
      },
      style,
      queryRenderedFeatures: (bbox, params) =>
        style.queryRenderedFeatures(bbox, params),
    },
  };

  context.options = setupOptions(context.options);

  addLayers(context);

  return context;
}

test("featuresAt with click bounding box", () => {
  const mockContext = createMockContext();
  const result = featuresAt.click(
    null,
    [
      [10, 10],
      [20, 20],
    ],
    mockContext,
  );

  assertEquals(
    result,
    [
      {
        type: "Feature",
        properties: {
          meta: "vertex",
          id: "baz",
        },
        geometry: {
          type: "Point",
          coordinates: [10, 10],
        },
      },
      {
        type: "Feature",
        properties: {
          meta: "feature",
          id: "foo",
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [1, 1],
            [2, 2],
          ],
        },
      },
    ],
    "sorts, filters based on properties.meta, removes duplicates",
  );
});

test("featuresAt with touch bounding box", () => {
  const mockContext = createMockContext();
  const result = featuresAt.touch(
    null,
    [
      [10, 10],
      [20, 20],
    ],
    mockContext,
  );

  assertEquals(
    result,
    [
      {
        type: "Feature",
        properties: {
          meta: "vertex",
          id: "baz",
        },
        geometry: {
          type: "Point",
          coordinates: [10, 10],
        },
      },
      {
        type: "Feature",
        properties: {
          meta: "feature",
          id: "foo",
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [1, 1],
            [2, 2],
          ],
        },
      },
    ],
    "sorts, filters based on properties.meta, removes duplicates",
  );
});

test("featuresAt should not include missing style layers", () => {
  const mockContext = createMockContext();

  // mock of map's setStyle, which will remove all maplibre-gl-draw styles until the data event is fired, in which maplibre-gl-draw adds back in the styles.
  mockContext.map.setStyle({});

  // featuresAt should return no features if the styles have not finished adding back in
  let result = featuresAt.touch(
    null,
    [
      [10, 10],
      [20, 20],
    ],
    mockContext,
  );
  assertEquals(
    result,
    [],
    "sorts, filters based on properties.meta, removes duplicates",
  );

  // mock adding layers back, similar to data event that fires and maplibre-gl-draw subsequently checks for any missing layers and adds them back in.
  addLayers(mockContext);

  result = featuresAt.touch(
    null,
    [
      [10, 10],
      [20, 20],
    ],
    mockContext,
  );
  assertEquals(
    result,
    [
      {
        type: "Feature",
        properties: {
          meta: "vertex",
          id: "baz",
        },
        geometry: {
          type: "Point",
          coordinates: [10, 10],
        },
      },
      {
        type: "Feature",
        properties: {
          meta: "feature",
          id: "foo",
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [1, 1],
            [2, 2],
          ],
        },
      },
    ],
    "sorts, filters based on properties.meta, removes duplicates",
  );
});
