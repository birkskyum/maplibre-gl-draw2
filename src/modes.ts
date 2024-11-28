import { SimpleSelect } from "./modes/simple_select.ts";
import { DirectSelect } from "./modes/direct_select.ts";
import { DrawPoint } from "./modes/draw_point.ts";
import { DrawPolygon } from "./modes/draw_polygon.ts";
import { DrawLineString } from "./modes/draw_line_string.ts";
import { StaticMode } from "./modes/static_mode.ts";
import { ModeInterface } from "./modes/mode_interface.ts";

export const ModeClasses: Record<string, new (...args: any[]) => ModeInterface> = {
  simple_select: SimpleSelect,
  direct_select: DirectSelect,
  draw_point: DrawPoint,
  draw_polygon: DrawPolygon,
  draw_line_string: DrawLineString,
  static: StaticMode,
};
