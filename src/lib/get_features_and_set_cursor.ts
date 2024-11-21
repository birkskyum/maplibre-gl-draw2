import { featuresAt } from "./features_at.ts";
import * as Constants from "../constants.ts";
import type { Feat } from "../feature_types/feature.ts";
import type { MapMouseEvent } from "../events.ts";
import type { DrawContext } from ".././index.ts";
import type { Feature } from "geojson";

export function getFeatureAtAndSetCursors(
  event: MapMouseEvent,
  ctx: DrawContext,
): Feature {
  const features: Feature[] = featuresAt.click(event, undefined, ctx);
  const classes: { mode?: string | null | undefined; feature?: string | null | undefined; mouse?: string | null | undefined; } = {
    mouse: Constants.cursors.NONE,
  };

  if (features[0]) {
    classes.mouse =
      features[0].properties?.active === Constants.activeStates.ACTIVE
        ? Constants.cursors.MOVE
        : Constants.cursors.POINTER;
    classes.feature = features[0].properties?.meta;
  }

  if (ctx.events?.currentModeName?.indexOf("draw") !== -1) {
    classes.mouse = Constants.cursors.ADD;
  }

  ctx.ui?.queueMapClasses(classes);
  ctx.ui?.updateMapClasses();

  return features[0];
}
