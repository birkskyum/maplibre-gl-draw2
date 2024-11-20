import { spy } from "sinon";

export function createMockLifecycleContext() {
  return {
    on: spy(),
  };
}
