import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/double_click_zoom", async (importOriginal) => {
  const {doubleClickZoom} = await import("../../lib/double_click_zoom")

  return {
    ...doubleClickZoom,
    enable: vi.fn(),
    disable: vi.fn(),
  }});


import { CircleMode } from "./CircleMode";
import * as Constants from "../../constants.ts";
// import circle from "@turf/circle";
import { ModeStrings } from "../../constants/modes.ts";

// vi.mock("@turf/circle", () => ({
//   default: vi.fn(),
// }));

const circle = {
  default: vi.fn(),
}


vi.mock("./CircleMode");

const mockFeature = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [],
  },
};

describe("CircleMode tests", () => {
  const mockCircleMode = {
    onSetup: vi.fn(),
    newFeature: vi.fn(),
    addFeature: vi.fn(),
    clearSelectedFeatures: vi.fn(),
    updateUIClasses: vi.fn(),
    activateUIButton: vi.fn(),
    setActionableState: vi.fn(),
    clickAnywhere: vi.fn(),
    changeMode: vi.fn(),
  };

  beforeEach(() => {});
  afterEach(() => {
    mockCircleMode.changeMode.mockClear();
  });

  it("should setup state with a polygon and initialRadius", () => {
    mockCircleMode.newFeature.mockReturnValue(mockFeature);
    expect(mockCircleMode.onSetup({})).toEqual({
      initialRadiusInKm: 2,
      polygon: mockFeature,
      currentVertexPosition: 0,
    });
    expect(mockCircleMode.newFeature).toHaveBeenCalled();
  });

  it("should setup state with initialRadius as given in options", () => {
    mockCircleMode.newFeature.mockReturnValue(mockFeature);
    expect(mockCircleMode.onSetup({ initialRadiusInKm: 1 })).toEqual({
      initialRadiusInKm: 1,
      polygon: mockFeature,
      currentVertexPosition: 0,
    });
    expect(mockCircleMode.newFeature).toHaveBeenCalled();
  });

  it("should add feature onSetup", () => {
    mockCircleMode.newFeature.mockReturnValue(mockFeature);
    mockCircleMode.onSetup({});
    expect(mockCircleMode.addFeature).toHaveBeenCalledWith(mockFeature);
  });

  it("should clear selected features on setup", () => {
    mockCircleMode.onSetup({});
    expect(mockCircleMode.clearSelectedFeatures).toHaveBeenCalled();
  });

  it("should disable double click zoom on setup", () => {
    mockCircleMode.onSetup({});
    expect(doubleClickZoom.disable).toHaveBeenCalled();
  });

  it('should set the cursor to "add" button', () => {
    mockCircleMode.onSetup({});
    expect(mockCircleMode.updateUIClasses).toHaveBeenCalledWith({
      mouse: Constants.cursors.ADD,
    });
  });

  it("should activate the polygon button on ui", () => {
    mockCircleMode.onSetup({});
    expect(mockCircleMode.activateUIButton).toHaveBeenCalledWith(
      Constants.types.POLYGON
    );
  });

  it("should set actionable state by enabling trash", () => {
    mockCircleMode.onSetup({});
    expect(mockCircleMode.setActionableState).toHaveBeenCalledWith({
      trash: true,
    });
  });

  it("should generate a circle feature and change mode to simple select when clickAnywhere is invoked", () => {
    circle.default.mockReturnValue({
      geometry: {
        coordinates: [],
      },
    });
    const mockState = {
      currentVertexPosition: 0,
      initialRadiusInKm: 1,
      polygon: {
        id: "random_id",
        incomingCoords: vi.fn(),
        properties: {},
      },
    };
    const mockEvent = {
      lngLat: { lat: 0, lng: 0 },
    };

    mockCircleMode.clickAnywhere(mockState, mockEvent);
    expect(mockState.currentVertexPosition).toBe(1);
    expect(circle.default).toHaveBeenCalledWith([0, 0], 1);
    expect(mockCircleMode.changeMode).toHaveBeenCalledWith(
      ModeStrings.simple_select,
      { featureIds: [mockState.polygon.id] }
    );
  });

  it("should change mode to simple_select without adding a polygon to state if currentVertexPosition is not 0", () => {
    const mockState = {
      currentVertexPosition: 1,
      polygon: {},
    };
    const mockEvent = {
      lngLat: { lat: 0, lng: 0 },
    };

    mockCircleMode.clickAnywhere(mockState, mockEvent);
    expect(mockState.currentVertexPosition).toBe(1);
    expect(mockCircleMode.changeMode).toHaveBeenCalledWith(
      ModeStrings.simple_select,
      { featureIds: [mockState.polygon.id] }
    );
  });
});
