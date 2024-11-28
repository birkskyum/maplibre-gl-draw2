import { ModeInterface } from "./mode_interface.ts";
import { ModeBase } from "./mode_base.ts";

export class StaticMode extends ModeBase implements ModeInterface {
  onSetup() {
    this.setActionableState(); // default actionable state is false for all actions
    return {};
  }

  toDisplayFeatures(state, geojson, display) {
    display(geojson);
  }
}
