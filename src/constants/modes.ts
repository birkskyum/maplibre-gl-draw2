

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


export enum ModeStrings {
  simple_select="simple_select",
  draw_line_string="draw_line_string",
  draw_polygon="draw_polygon",
  draw_rectangle="draw_rectangle",
  draw_assisted_rectangle="draw_assisted_rectangle",
  draw_point="draw_point",
  direct_select="direct_select",
  static="static",
};
