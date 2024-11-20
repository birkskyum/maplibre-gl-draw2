import { SimpleSelect } from "./modes/simple_select.ts";
import { DirectSelect } from "./modes/direct_select.ts";
import { DrawPoint } from "./modes/draw_point.ts";
import { DrawPolygon } from "./modes/draw_polygon.ts";
import { DrawLineString } from "./modes/draw_line_string.ts";
import { StaticMode } from "./modes/static_mode.ts";
import { ModeStrings } from "./constants/modes.ts";

export const ModeClasses = {
  [ModeStrings.SIMPLE_SELECT]: SimpleSelect,
  [ModeStrings.DIRECT_SELECT]: DirectSelect,
  [ModeStrings.DRAW_POINT]: DrawPoint,
  [ModeStrings.DRAW_POLYGON]: DrawPolygon,
  [ModeStrings.DRAW_LINE_STRING]: DrawLineString,
  [ModeStrings.STATIC]: StaticMode,
};
