import { ModeInterface } from "./mode_interface.ts";
import { ModeInterfaceAccessors } from "./mode_interface_accessors.ts";

export class StaticMode extends ModeInterfaceAccessors implements ModeInterface {
  onSetup() {
    this.setActionableState(); // default actionable state is false for all actions
    return {};
  }

  toDisplayFeatures(state, geojson, display) {
    display(geojson);
  }
}
