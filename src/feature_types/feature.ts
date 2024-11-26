import { nanoid } from "nanoid";
import * as Constants from "../constants.ts";
import type { DrawContext } from "../context.ts";
import type {GeoJSON, Position} from "geojson";
export class Feat {
  ctx: DrawContext;
  properties: Record<string, any>;
  coordinates?: any[];
  id: string;
  type: string;

  constructor(ctx: DrawContext, geojson: any) {
    this.ctx = ctx;
    this.properties = geojson.properties || {};
    this.coordinates = geojson.geometry.coordinates;
    this.id = geojson.id || nanoid();
    this.type = geojson.geometry.type;
  }

  isValid(): boolean {
    return true;
  }

  changed(): void {
    this.ctx.store?.featureChanged(this.id);
  }

  incomingCoords(coords: any[]): void {
    this.setCoordinates(coords);
  }

  setCoordinates(coords: any[]): void {
    this.coordinates = coords;
    this.changed();
  }

  getCoordinate?(path: string): Position;



  


  getCoordinates(): any[] {
    return JSON.parse(JSON.stringify(this.coordinates));
  }

  setProperty(property: string, value: any): void {
    this.properties[property] = value;
  }

  toGeoJSON(): GeoJSON {
    return JSON.parse(
      JSON.stringify({
        id: this.id,
        type: Constants.geojsonTypes.FEATURE,
        properties: this.properties,
        geometry: {
          coordinates: this.getCoordinates(),
          type: this.type,
        },
      }),
    );
  }

  internal(mode: string): any {
    const properties: Record<string, any> = {
      id: this.id,
      meta: Constants.meta.FEATURE,
      "meta:type": this.type,
      active: Constants.activeStates.INACTIVE,
      mode,
    };

    if (this.ctx.options.userProperties) {
      for (const name in this.properties) {
        properties[`user_${name}`] = this.properties[name];
      }
    }

    return {
      type: Constants.geojsonTypes.FEATURE,
      properties,
      geometry: {
        coordinates: this.getCoordinates(),
        type: this.type,
      },
    };
  }
}
