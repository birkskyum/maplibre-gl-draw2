export const classes = {
  CANVAS: "maplibregl-canvas",
  CONTROL_BASE: "maplibregl-ctrl",
  CONTROL_PREFIX: "maplibregl-ctrl-",
  CONTROL_BUTTON: "maplibre-gl-draw_ctrl-draw-btn",
  CONTROL_BUTTON_LINE: "maplibre-gl-draw_line",
  CONTROL_BUTTON_POLYGON: "maplibre-gl-draw_polygon",
  CONTROL_BUTTON_POINT: "maplibre-gl-draw_point",
  CONTROL_BUTTON_TRASH: "maplibre-gl-draw_trash",
  CONTROL_BUTTON_COMBINE_FEATURES: "maplibre-gl-draw_combine",
  CONTROL_BUTTON_UNCOMBINE_FEATURES: "maplibre-gl-draw_uncombine",
  CONTROL_GROUP: "maplibregl-ctrl-group",
  ATTRIBUTION: "maplibregl-ctrl-attrib",
  ACTIVE_BUTTON: "active",
  BOX_SELECT: "maplibre-gl-draw_boxselect",
};

export const controls = {
  line_string: true,
  point: true,
  polygon: true,
  trash: true,
};

export const sources = {
  HOT: "maplibre-gl-draw-hot",
  COLD: "maplibre-gl-draw-cold",
};

export const cursors = {
  ADD: "add",
  MOVE: "move",
  DRAG: "drag",
  POINTER: "pointer",
  NONE: "none",
};

export const types = {
  POLYGON: "polygon",
  LINE: "line_string",
  POINT: "point",
};

export const geojsonTypes = {
  FEATURE: "Feature",
  POLYGON: "Polygon",
  LINE_STRING: "LineString",
  POINT: "Point",
  FEATURE_COLLECTION: "FeatureCollection",
  MULTI_PREFIX: "Multi",
  MULTI_POINT: "MultiPoint",
  MULTI_LINE_STRING: "MultiLineString",
  MULTI_POLYGON: "MultiPolygon",
};

export const events = {
  CREATE: "draw.create",
  DELETE: "draw.delete",
  UPDATE: "draw.update",
  SELECTION_CHANGE: "draw.selectionchange",
  MODE_CHANGE: "draw.modechange",
  ACTIONABLE: "draw.actionable",
  RENDER: "draw.render",
  COMBINE_FEATURES: "draw.combine",
  UNCOMBINE_FEATURES: "draw.uncombine",
};

export const updateActions = {
  MOVE: "move",
  CHANGE_COORDINATES: "change_coordinates",
};

export const meta = {
  FEATURE: "feature",
  MIDPOINT: "midpoint",
  VERTEX: "vertex",
};

export const activeStates = {
  ACTIVE: "true",
  INACTIVE: "false",
};

export const interactions = [
  "scrollZoom",
  "boxZoom",
  "dragRotate",
  "dragPan",
  "keyboard",
  "doubleClickZoom",
  "touchZoomRotate",
];

export const LAT_MIN = -90;
export const LAT_RENDERED_MIN = -85;
export const LAT_MAX = 90;
export const LAT_RENDERED_MAX = 85;
export const LNG_MIN = -270;
export const LNG_MAX = 270;

// export const modes = {
//   ...MapLibreDraw.constants.modes,
//   DRAW_CIRCLE: 'draw_circle'
// };

// export const properties = {
//   CIRCLE_RADIUS: 'circleRadius',
//   CIRCLE_HANDLE_BEARING: 'circleHandleBearing'
// };





 /**
   * By default MapLibreDraw ships with a few modes. These modes aim to cover the
   * basic needed functionally for MapLibreDraw to create the core GeoJSON feature
   * types. Along with these, MapLibreDraw also support custom modes.
   * [Click here for more details](https://github.com/birkskyum/maplibre-gl-draw/blob/main/docs/MODES.md).
   */
 interface modesI {
  /**
   * Lets you select, delete, and drag features.
   *
   * In this mode, features can have their selected state changed by the user.
   *
   * Draw is in `simple_select` mode by default, and will automatically transition
   * into `simple_select` mode again every time the user finishes drawing a feature
   * or exits `direct_select` mode.
   */
  simple_select: string,
  
  /**
   * Lets you draw a LineString feature.
   */
  draw_line_string: string,

  /**
   * Lets you draw a Polygon feature.
   */
  draw_polygon: string,

  /**
   * Lets you draw a Point feature.
   */
  draw_point: string,

  /**
   * Lets you select, delete, and drag vertices; and drag features.
   *
   * `direct_select` mode does not apply to point features, because they have no
   * vertices.
   *
   * Draw enters `direct_select` mode when the user clicks a vertex of a selected
   * line or polygon. So `direct_select` mode typically follows `simple_select` mode.
   */
  direct_select: string,

  /**
   * A static mode where no interactions are allowed.
   */
  static: string,


  /**
   * Lets you draw a Rectangle feature.
   */
  draw_rectangle: string,
  /**
   * Lets you draw a Rectangle feature.
   */
  draw_assisted_rectangle: string,
};

export const modes = {
  simple_select:"simple_select",
  draw_line_string:"draw_line_string",
  draw_polygon:"draw_polygon",
  draw_rectangle:"draw_rectangle",
  draw_assisted_rectangle:"draw_assisted_rectangle",
  draw_point:"draw_point",
  direct_select:"direct_select",
  static:"static",
};
