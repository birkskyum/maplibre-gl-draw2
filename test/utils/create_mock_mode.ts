import { spy } from "sinon";

export function createMockMode() {
  return {
    start: spy(),
    stop: spy(),
    trash: spy(),
    render: spy(),
  };
}
