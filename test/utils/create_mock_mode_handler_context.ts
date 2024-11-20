import { spy } from "sinon";

export function createMockModeHandlerContext() {
  return {
    store: {
      featureChanged: spy(),
      render: spy(),
    },
    ui: {
      updateMapClasses: spy(),
    },
  };
}
