import { SimpleSelect } from "./modes/simple_select.ts";
import { DirectSelect } from "./modes/direct_select.ts";
import { DrawPoint } from "./modes/draw_point.ts";
import { DrawPolygon } from "./modes/draw_polygon.ts";
import { DrawLineString } from "./modes/draw_line_string.ts";
import { StaticMode } from "./modes/static_mode.ts";
import { ModeInterface } from "./modes/mode_interface.ts";
import { DrawRectangle } from "./modes/draw_rectangle.ts";
import { DrawAssistedRectangle } from "./modes/draw_assisted_rectangle.ts";
import { DragCircleMode } from "./modes/circle/DragCircleMode.ts";
import { DrawCircleMode } from "./modes/circle/CircleMode.ts";
import { DrawCircleRadiusMode } from "./modes/circle/RadiusMode.ts";

export const ModeClasses: Record<string, new (...args: any[]) => ModeInterface> = {
  simple_select: SimpleSelect,
  direct_select: DirectSelect,
  draw_point: DrawPoint,
  draw_polygon: DrawPolygon,
  draw_rectangle: DrawRectangle,
  draw_assisted_rectangle: DrawAssistedRectangle,
  draw_circle: DrawCircleMode,
  draw_circle_radius: DrawCircleRadiusMode,
  drag_circle: DragCircleMode,
  draw_line_string: DrawLineString,
  static: StaticMode,
};
