import { ModeHandler } from "./lib/mode_handler.ts";
import { getFeatureAtAndSetCursors } from "./lib/get_features_and_set_cursor.ts";
import { featuresAt } from "./lib/features_at.ts";
import { isClick } from "./lib/is_click.ts";
import { isTap } from "./lib/is_tap.ts";
import * as Constants from "./constants.ts";
import { objectToMode } from "./modes/object_to_mode.ts";
import type { DrawContext } from "./index.ts";
import { ModeStrings } from "./index.ts";

interface EventInfo {
  time: number;
  point: any;
}

interface ActionState {
  trash: boolean;
  combineFeatures: boolean;
  uncombineFeatures: boolean;
}

export class DrawEvents {
  public modes: any;
  public mouseDownInfo: any = {};
  public touchStartInfo: any = {};
  public events: any = {};
  public currentModeName: string | null = null;
  public currentMode: any = null;
  public ctx: DrawContext;
  public actionState: ActionState = {
    trash: false,
    combineFeatures: false,
    uncombineFeatures: false,
  };

  constructor(ctx: DrawContext) {
    this.ctx = ctx;
    this.modes = Object.keys(ctx.options.modes).reduce((m: any, k: string) => {
      m[k] = objectToMode(ctx.options.modes[k]);
      return m;
    }, {});
    this.bindEvents();
  }

  public bindEvents(): void {
    this.events.drag = this.handleDrag.bind(this);
    this.events.mousedrag = this.handleMouseDrag.bind(this);
    this.events.touchdrag = this.handleTouchDrag.bind(this);
    this.events.mousemove = this.handleMouseMove.bind(this);
    this.events.mousedown = this.handleMouseDown.bind(this);
    this.events.mouseup = this.handleMouseUp.bind(this);
    this.events.mouseout = this.handleMouseOut.bind(this);
    this.events.touchstart = this.handleTouchStart.bind(this);
    this.events.touchmove = this.handleTouchMove.bind(this);
    this.events.touchend = this.handleTouchEnd.bind(this);
    this.events.keydown = this.handleKeyDown.bind(this);
    this.events.keyup = this.handleKeyUp.bind(this);
    this.events.zoomend = this.handleZoomEnd.bind(this);
    this.events.data = this.handleData.bind(this);
  }

  public handleDrag(event: any, isDrag: Function): void {
    if (
      isDrag({
        point: event.point,
        time: new Date().getTime(),
      })
    ) {
      this.ctx.ui?.queueMapClasses({ mouse: Constants.cursors.DRAG });
      this.currentMode.drag(event);
    } else {
      event.originalEvent.stopPropagation();
    }
  }

  public handleMouseDrag(event: any): void {
    this.events.drag(
      event,
      (endInfo: EventInfo) => !isClick(this.mouseDownInfo, endInfo),
    );
  }

  public handleTouchDrag(event: any): void {
    this.events.drag(
      event,
      (endInfo: EventInfo) => !isTap(this.touchStartInfo, endInfo),
    );
  }

  public handleMouseMove(event: any): void {
    const button = event.originalEvent.buttons !== undefined
      ? event.originalEvent.buttons
      : event.originalEvent.which;
    if (button === 1) {
      return this.events.mousedrag(event);
    }
    const target = getFeatureAtAndSetCursors(event, this.ctx);
    event.featureTarget = target;
    this.currentMode.mousemove(event);
  }

  public handleMouseDown(event: any): void {
    this.mouseDownInfo = {
      time: new Date().getTime(),
      point: event.point,
    };
    const target = getFeatureAtAndSetCursors(event, this.ctx);
    event.featureTarget = target;
    this.currentMode.mousedown(event);
  }

  public handleMouseUp(event: any): void {
    const target = getFeatureAtAndSetCursors(event, this.ctx);
    event.featureTarget = target;

    if (
      isClick(this.mouseDownInfo, {
        point: event.point,
        time: new Date().getTime(),
      })
    ) {
      this.currentMode.click(event);
    } else {
      this.currentMode.mouseup(event);
    }
  }

  public handleMouseOut(event: any): void {
    this.currentMode.mouseout(event);
  }

  public handleTouchStart(event: any): void {
    if (!this.ctx.options.touchEnabled) return;

    this.touchStartInfo = {
      time: new Date().getTime(),
      point: event.point,
    };
    const target = featuresAt.touch(event, null, this.ctx)[0];
    event.featureTarget = target;
    this.currentMode.touchstart(event);
  }

  public handleTouchMove(event: any): void {
    if (!this.ctx.options.touchEnabled) return;
    this.currentMode.touchmove(event);
    return this.events.touchdrag(event);
  }

  public handleTouchEnd(event: any): void {
    event.originalEvent.preventDefault();
    if (!this.ctx.options.touchEnabled) return;

    const target = featuresAt.touch(event, null, this.ctx)[0];
    event.featureTarget = target;
    if (
      isTap(this.touchStartInfo, {
        time: new Date().getTime(),
        point: event.point,
      })
    ) {
      this.currentMode.tap(event);
    } else {
      this.currentMode.touchend(event);
    }
  }

  public handleKeyDown(event: any): void {
    const isMapElement = (event.srcElement || event.target).classList.contains(
      Constants.classes.CANVAS,
    );
    if (!isMapElement) return;

    if (
      (event.keyCode === 8 || event.keyCode === 46) &&
      this.ctx.options.controls.trash
    ) {
      event.preventDefault();
      this.currentMode.trash();
    } else if (this.isKeyModeValid(event.keyCode)) {
      this.currentMode.keydown(event);
    } else if (event.keyCode === 49 && this.ctx.options.controls.point) {
      this.changeMode(ModeStrings.DRAW_POINT);
    } else if (event.keyCode === 50 && this.ctx.options.controls.line_string) {
      this.changeMode(ModeStrings.DRAW_LINE_STRING);
    } else if (event.keyCode === 51 && this.ctx.options.controls.polygon) {
      this.changeMode(ModeStrings.DRAW_POLYGON);
    }
  }

  public handleKeyUp(event: any): void {
    if (this.isKeyModeValid(event.keyCode)) {
      this.currentMode.keyup(event);
    }
  }

  public handleZoomEnd(): void {
    this.ctx.store?.changeZoom();
  }

  public handleData(event: any): void {
    if (event.dataType === "style") {
      const { setup, map, options, store } = this.ctx;
      const hasLayers = options.styles.some((style: any) =>
        map.getLayer(style.id)
      );
      if (!hasLayers) {
        setup.addLayers();
        store.setDirty();
        store.render();
      }
    }
  }

  public isKeyModeValid(code: number): boolean {
    return !(code === 8 || code === 46 || (code >= 48 && code <= 57));
  }
  public changeMode(
    modename: string,
    nextModeOptions?: any,
    eventOptions: any = {},
  ): void {
    this.currentMode.stop();

    const modebuilder = this.modes[modename];
    if (modebuilder === undefined) {
      throw new Error(`${modename} is not valid`);
    }
    this.currentModeName = modename;
    const mode = modebuilder(this.ctx, nextModeOptions);
    this.currentMode = ModeHandler(mode, this.ctx);

    if (!eventOptions.silent) {
      this.ctx.map?.fire(Constants.events.MODE_CHANGE, { mode: modename });
    }

    this.ctx.store?.setDirty();
    this.ctx.store?.render();
  }

  public actionable(actions: Partial<ActionState>): void {
    let changed = false;
    Object.keys(actions).forEach((action) => {
      if (this.actionState[action as keyof ActionState] === undefined) {
        throw new Error("Invalid action type");
      }
      if (
        this.actionState[action as keyof ActionState] !==
          actions[action as keyof ActionState]
      ) {
        changed = true;
      }
      this.actionState[action as keyof ActionState] =
        actions[action as keyof ActionState]!;
    });
    if (changed) {
      this.ctx.map?.fire(Constants.events.ACTIONABLE, {
        actions: this.actionState,
      });
    }
  }

  public start(): void {
    this.currentModeName = this.ctx.options.defaultMode;
    this.currentMode = ModeHandler(
      this.modes[this.currentModeName](this.ctx),
      this.ctx,
    );
  }

  public getMode(): string | null {
    return this.currentModeName;
  }

  public currentModeRender(geojson: any, push: any): any {
    return this.currentMode.render(geojson, push);
  }

  public fire(eventName: string, eventData: any): void {
    if (!this.ctx.map) return;
    this.ctx.map?.fire(eventName, eventData);
  }

  public addEventListeners(): void {
    this.ctx.map?.on("mousemove", this.events.mousemove);
    this.ctx.map?.on("mousedown", this.events.mousedown);
    this.ctx.map?.on("mouseup", this.events.mouseup);
    this.ctx.map?.on("data", this.events.data);

    this.ctx.map?.on("touchmove", this.events.touchmove);
    this.ctx.map?.on("touchstart", this.events.touchstart);
    this.ctx.map?.on("touchend", this.events.touchend);

    this.ctx.container?.addEventListener("mouseout", this.events.mouseout);

    if (this.ctx.options.keybindings) {
      this.ctx.container?.addEventListener("keydown", this.events.keydown);
      this.ctx.container?.addEventListener("keyup", this.events.keyup);
    }
  }

  public removeEventListeners(): void {
    this.ctx.map?.off("mousemove", this.events.mousemove);
    this.ctx.map?.off("mousedown", this.events.mousedown);
    this.ctx.map?.off("mouseup", this.events.mouseup);
    this.ctx.map?.off("data", this.events.data);

    this.ctx.map?.off("touchmove", this.events.touchmove);
    this.ctx.map?.off("touchstart", this.events.touchstart);
    this.ctx.map?.off("touchend", this.events.touchend);

    this.ctx.container?.removeEventListener("mouseout", this.events.mouseout);

    if (this.ctx.options.keybindings) {
      this.ctx.container?.removeEventListener("keydown", this.events.keydown);
      this.ctx.container?.removeEventListener("keyup", this.events.keyup);
    }
  }

  public trash(options?: any): void {
    this.currentMode.trash(options);
  }

  public combineFeatures(): void {
    this.currentMode.combineFeatures();
  }

  public uncombineFeatures(): void {
    this.currentMode.uncombineFeatures();
  }
}
