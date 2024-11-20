import * as CommonSelectors from "../lib/common_selectors.ts";
import { isEventAtCoordinates } from "../lib/is_event_at_coordinates.ts";
import { doubleClickZoom } from "../lib/double_click_zoom.ts";
import * as Constants from "../constants.ts";
import { createVertex } from "../lib/create_vertex.ts";
import { ModeInterface } from "./mode_interface.ts";
import { ModeStrings } from "../constants/modes.ts";

export class DrawLineString extends ModeInterface {
  onSetup(opts) {
    opts = opts || {};
    const featureId = opts.featureId;
    let line, currentVertexPosition;
    let direction = "forward";

    if (featureId) {
      line = this.getFeature(featureId);
      if (!line) {
        throw new Error("Could not find a feature with the provided featureId");
      }
      let from = opts.from;
      if (
        from &&
        from.type === "Feature" &&
        from.geometry &&
        from.geometry.type === "Point"
      ) {
        from = from.geometry;
      }
      if (
        from &&
        from.type === "Point" &&
        from.coordinates &&
        from.coordinates.length === 2
      ) {
        from = from.coordinates;
      }
      if (!from || !Array.isArray(from)) {
        throw new Error(
          "Please use the `from` property to indicate which point to continue the line from",
        );
      }
      const lastCoord = line.coordinates.length - 1;
      if (
        line.coordinates[lastCoord][0] === from[0] &&
        line.coordinates[lastCoord][1] === from[1]
      ) {
        currentVertexPosition = lastCoord + 1;
        // add one new coordinate to continue from
        line.addCoordinate(
          currentVertexPosition,
          ...line.coordinates[lastCoord],
        );
      } else if (
        line.coordinates[0][0] === from[0] &&
        line.coordinates[0][1] === from[1]
      ) {
        direction = "backwards";
        currentVertexPosition = 0;
        // add one new coordinate to continue from
        line.addCoordinate(currentVertexPosition, ...line.coordinates[0]);
      } else {
        throw new Error(
          "`from` should match the point at either the start or the end of the provided LineString",
        );
      }
    } else {
      line = this.newFeature({
        type: Constants.geojsonTypes.FEATURE,
        properties: {},
        geometry: {
          type: Constants.geojsonTypes.LINE_STRING,
          coordinates: [],
        },
      });
      currentVertexPosition = 0;
      this.addFeature(line);
    }

    this.clearSelectedFeatures();
    doubleClickZoom.disable(this);
    this.updateUIClasses({ mouse: Constants.cursors.ADD });
    this.activateUIButton(Constants.types.LINE);
    this.setActionableState({
      trash: true,
    });

    return {
      line,
      currentVertexPosition,
      direction,
    };
  }

  clickAnywhere(state, e) {
    if (
      (state.currentVertexPosition > 0 &&
        isEventAtCoordinates(
          e,
          state.line.coordinates[state.currentVertexPosition - 1],
        )) ||
      (state.direction === "backwards" &&
        isEventAtCoordinates(
          e,
          state.line.coordinates[state.currentVertexPosition + 1],
        ))
    ) {
      return this.changeMode(ModeStrings.SIMPLE_SELECT, {
        featureIds: [state.line.id],
      });
    }
    this.updateUIClasses({ mouse: Constants.cursors.ADD });
    state.line.updateCoordinate(
      state.currentVertexPosition,
      e.lngLat.lng,
      e.lngLat.lat,
    );
    if (state.direction === "forward") {
      state.currentVertexPosition++;
      state.line.updateCoordinate(
        state.currentVertexPosition,
        e.lngLat.lng,
        e.lngLat.lat,
      );
    } else {
      state.line.addCoordinate(0, e.lngLat.lng, e.lngLat.lat);
    }
  }

  clickOnVertex(state) {
    return this.changeMode(ModeStrings.SIMPLE_SELECT, {
      featureIds: [state.line.id],
    });
  }

  onMouseMove(state, e) {
    state.line.updateCoordinate(
      state.currentVertexPosition,
      e.lngLat.lng,
      e.lngLat.lat,
    );
    if (CommonSelectors.isVertex(e)) {
      this.updateUIClasses({ mouse: Constants.cursors.POINTER });
    }
  }

  onClick(state, e) {
    if (CommonSelectors.isVertex(e)) return this.clickOnVertex(state, e);
    this.clickAnywhere(state, e);
  }

  onTap(state, e) {
    // Handle tap same as click
    this.onClick(state, e);
  }

  onKeyUp(state, e) {
    if (CommonSelectors.isEnterKey(e)) {
      this.changeMode(ModeStrings.SIMPLE_SELECT, {
        featureIds: [state.line.id],
      });
    } else if (CommonSelectors.isEscapeKey(e)) {
      this.deleteFeature([state.line.id], { silent: true });
      this.changeMode(ModeStrings.SIMPLE_SELECT);
    }
  }

  onStop(state) {
    doubleClickZoom.enable(this);
    this.activateUIButton();

    // check to see if we've deleted this feature
    if (this.getFeature(state.line.id) === undefined) return;

    //remove last added coordinate
    state.line.removeCoordinate(`${state.currentVertexPosition}`);
    if (state.line.isValid()) {
      this.fire(Constants.events.CREATE, {
        features: [state.line.toGeoJSON()],
      });
    } else {
      this.deleteFeature([state.line.id], { silent: true });
      this.changeMode(ModeStrings.SIMPLE_SELECT, {}, { silent: true });
    }
  }

  onTrash(state) {
    this.deleteFeature([state.line.id], { silent: true });
    this.changeMode(ModeStrings.SIMPLE_SELECT);
  }

  toDisplayFeatures(state, geojson, display) {
    const isActiveLine = geojson.properties.id === state.line.id;
    geojson.properties.active = isActiveLine
      ? Constants.activeStates.ACTIVE
      : Constants.activeStates.INACTIVE;
    if (!isActiveLine) return display(geojson);
    // Only render the line if it has at least one real coordinate
    if (geojson.geometry.coordinates.length < 2) return;
    geojson.properties.meta = Constants.meta.FEATURE;
    display(
      createVertex(
        state.line.id,
        geojson.geometry.coordinates[
          state.direction === "forward"
            ? geojson.geometry.coordinates.length - 2
            : 1
        ],
        `${
          state.direction === "forward"
            ? geojson.geometry.coordinates.length - 2
            : 1
        }`,
        false,
      ),
    );

    display(geojson);
  }
}

export default DrawLineString;
