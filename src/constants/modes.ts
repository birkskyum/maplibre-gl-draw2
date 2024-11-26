

 /**
   * By default MapLibreDraw ships with a few modes. These modes aim to cover the
   * basic needed functionally for MapLibreDraw to create the core GeoJSON feature
   * types. Along with these, MapLibreDraw also support custom modes.
   * [Click here for more details](https://github.com/birkskyum/maplibre-gl-draw/blob/main/docs/MODES.md).
   */
 interface ModeStringsI {
  /**
   * Lets you select, delete, and drag features.
   *
   * In this mode, features can have their selected state changed by the user.
   *
   * Draw is in `simple_select` mode by default, and will automatically transition
   * into `simple_select` mode again every time the user finishes drawing a feature
   * or exits `direct_select` mode.
   */
  SIMPLE_SELECT: string,
  
  /**
   * Lets you draw a LineString feature.
   */
  DRAW_LINE_STRING: string,

  /**
   * Lets you draw a Polygon feature.
   */
  DRAW_POLYGON: string,

  /**
   * Lets you draw a Point feature.
   */
  DRAW_POINT: string,

  /**
   * Lets you select, delete, and drag vertices; and drag features.
   *
   * `direct_select` mode does not apply to point features, because they have no
   * vertices.
   *
   * Draw enters `direct_select` mode when the user clicks a vertex of a selected
   * line or polygon. So `direct_select` mode typically follows `simple_select` mode.
   */
  DIRECT_SELECT: string,

  /**
   * A static mode where no interactions are allowed.
   */
  STATIC: string,
};


export const ModeStrings:ModeStringsI = {
  SIMPLE_SELECT: "simple_select",
  DRAW_LINE_STRING: "draw_line_string",
  DRAW_POLYGON: "draw_polygon",
  DRAW_POINT: "draw_point",
  DIRECT_SELECT: "direct_select",
  STATIC: "static",
};