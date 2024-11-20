import type { MapMouseEvent, MapTouchEvent } from "../events.ts";
import * as Constants from "../constants.ts";

export function isOfMetaType(type: string): boolean {
  return function (e: MapMouseEvent | MapTouchEvent): boolean {
    const featureTarget = e.featureTarget;
    if (!featureTarget) return false;
    if (!featureTarget.properties) return false;
    return featureTarget.properties.meta === type;
  };
}

export function isShiftMousedown(e: any): boolean {
  if (!e.originalEvent) return false;
  if (!e.originalEvent.shiftKey) return false;
  return e.originalEvent.button === 0;
}

export function isActiveFeature(e: MapMouseEvent | MapTouchEvent): boolean {
  if (!e.featureTarget) return false;
  if (!e.featureTarget.properties) return false;
  return (
    e.featureTarget.properties.active === Constants.activeStates.ACTIVE &&
    e.featureTarget.properties.meta === Constants.meta.FEATURE
  );
}

export function isInactiveFeature(e: MapMouseEvent | MapTouchEvent): boolean {
  if (!e.featureTarget) return false;
  if (!e.featureTarget.properties) return false;
  return (
    e.featureTarget.properties.active === Constants.activeStates.INACTIVE &&
    e.featureTarget.properties.meta === Constants.meta.FEATURE
  );
}

export function noTarget(e: MapMouseEvent | MapTouchEvent): boolean {
  return e.featureTarget === undefined;
}

export function isFeature(e: MapMouseEvent | MapTouchEvent): boolean {
  if (!e.featureTarget) return false;
  if (!e.featureTarget.properties) return false;
  return e.featureTarget.properties.meta === Constants.meta.FEATURE;
}

export function isVertex(e: MapMouseEvent | MapTouchEvent): boolean {
  const featureTarget = e.featureTarget;
  if (!featureTarget) return false;
  if (!featureTarget.properties) return false;
  return featureTarget.properties.meta === Constants.meta.VERTEX;
}

export function isShiftDown(e: any): boolean {
  if (!e.originalEvent) return false;
  return e.originalEvent.shiftKey === true;
}

export function isEscapeKey(e: KeyboardEvent): boolean {
  return e.keyCode === 27;
}

export function isEnterKey(e: KeyboardEvent): boolean {
  return e.keyCode === 13;
}

export function isTrue(): boolean {
  return true;
}
