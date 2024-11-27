import type { DrawContext } from "./context.ts";
import * as Constants from "./constants.ts";
import { ModeStrings } from "./constants/modes.ts";

type CLASS_TYPE = "mode" | "feature" | "mouse";
const classTypes: CLASS_TYPE[] = ["mode", "feature", "mouse"];

export class DrawUI {
  private buttonElements: Record<string, HTMLButtonElement> = {};
  private activeButton: HTMLButtonElement | null = null;
  private currentMapClasses = {
    mode: null,
    feature: null,
    mouse: null,
  };
  private nextMapClasses = {
    mode: null,
    feature: null,
    mouse: null,
  };

  private ctx: DrawContext;

  constructor(ctx: DrawContext) {
    this.ctx = ctx;
  }

  clearMapClasses() {
    this.queueMapClasses({ mode: null, feature: null, mouse: null });
    this.updateMapClasses();
  }

  queueMapClasses(options: {
    mode?: string | null;
    feature?: string | null;
    mouse?: string | null;
  }) {
    this.nextMapClasses = Object.assign(this.nextMapClasses, options);
  }

  updateMapClasses() {
    if (!this.ctx.container) return;

    const classesToRemove: string[] = [];
    const classesToAdd: string[] = [];

    classTypes.forEach((type) => {
      if (this.nextMapClasses[type] === this.currentMapClasses[type]) return;

      classesToRemove.push(`${type}-${this.currentMapClasses[type]}`);
      if (this.nextMapClasses[type] !== null) {
        classesToAdd.push(`${type}-${this.nextMapClasses[type]}`);
      }
    });

    if (classesToRemove.length > 0) {
      this.ctx.container?.classList.remove(...classesToRemove);
    }

    if (classesToAdd.length > 0) {
      this.ctx.container?.classList.add(...classesToAdd);
    }

    this.currentMapClasses = Object.assign(
      this.currentMapClasses,
      this.nextMapClasses,
    );
  }

  private createControlButton(
    id: string,
    options: {
      className?: string;
      title: string;
      container: HTMLElement;
      onActivate: () => void;
      onDeactivate?: () => void;
    },
  ) {
    const button = document.createElement("button");
    button.className =
      `${Constants.classes.CONTROL_BUTTON} ${options.className}`;
    button.setAttribute("title", options.title);
    options.container.appendChild(button);

    button.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        e.stopPropagation();

        const clickedButton = e.target;
        if (clickedButton === this.activeButton) {
          this.deactivateButtons();
          if (options.onDeactivate) {
            options.onDeactivate();
          }
          return;
        }

        this.setActiveButton(id);
        options.onActivate();
      },
      true,
    );

    return button;
  }

  public deactivateButtons() {
    if (!this.activeButton) return;
    this.activeButton.classList.remove(Constants.classes.ACTIVE_BUTTON);
    this.activeButton = null;
  }

  setActiveButton(id?: string) {
    this.deactivateButtons();

    if (!id) return;

    const button = this.buttonElements[id];
    if (!button) return;

    if (button && id !== "trash") {
      button.classList.add(Constants.classes.ACTIVE_BUTTON);
      this.activeButton = button;
    }
  }

  addButtons(): HTMLDivElement {
    const controls: any = this.ctx.options.controls;
    const controlGroup = document.createElement("div");
    controlGroup.className =
      `${Constants.classes.CONTROL_GROUP} ${Constants.classes.CONTROL_BASE}`;

    if (!controls) return controlGroup;

    if (controls[Constants.types.LINE]) {
      this.buttonElements[Constants.types.LINE] = this.createControlButton(
        Constants.types.LINE,
        {
          container: controlGroup,
          className: Constants.classes.CONTROL_BUTTON_LINE,
          title: `LineString tool ${this.ctx.options.keybindings ? "(l)" : ""}`,
          onActivate: () =>
            this.ctx.events?.changeMode(ModeStrings.DRAW_LINE_STRING),
          onDeactivate: () => this.ctx.events?.trash(),
        },
      );
    }

    if (controls[Constants.types.POLYGON]) {
      this.buttonElements[Constants.types.POLYGON] = this.createControlButton(
        Constants.types.POLYGON,
        {
          container: controlGroup,
          className: Constants.classes.CONTROL_BUTTON_POLYGON,
          title: `Polygon tool ${this.ctx.options.keybindings ? "(p)" : ""}`,
          onActivate: () =>
            this.ctx.events?.changeMode(ModeStrings.DRAW_POLYGON),
          onDeactivate: () => this.ctx.events?.trash(),
        },
      );
    }

    if (controls[Constants.types.POINT]) {
      this.buttonElements[Constants.types.POINT] = this.createControlButton(
        Constants.types.POINT,
        {
          container: controlGroup,
          className: Constants.classes.CONTROL_BUTTON_POINT,
          title: `Marker tool ${this.ctx.options.keybindings ? "(m)" : ""}`,
          onActivate: () => this.ctx.events?.changeMode(ModeStrings.DRAW_POINT),
          onDeactivate: () => this.ctx.events?.trash(),
        },
      );
    }

    if (controls.trash) {
      this.buttonElements.trash = this.createControlButton("trash", {
        container: controlGroup,
        className: Constants.classes.CONTROL_BUTTON_TRASH,
        title: "Delete",
        onActivate: () => {
          this.ctx.events?.trash();
        },
      });
    }

    if (controls.combine_features) {
      this.buttonElements.combine_features = this.createControlButton(
        "combineFeatures",
        {
          container: controlGroup,
          className: Constants.classes.CONTROL_BUTTON_COMBINE_FEATURES,
          title: "Combine",
          onActivate: () => {
            this.ctx.events?.combineFeatures();
          },
        },
      );
    }

    if (controls.uncombine_features) {
      this.buttonElements.uncombine_features = this.createControlButton(
        "uncombineFeatures",
        {
          container: controlGroup,
          className: Constants.classes.CONTROL_BUTTON_UNCOMBINE_FEATURES,
          title: "Uncombine",
          onActivate: () => {
            this.ctx.events?.uncombineFeatures();
          },
        },
      );
    }

    return controlGroup;
  }

  removeButtons() {
    Object.keys(this.buttonElements).forEach((buttonId) => {
      const button = this.buttonElements[buttonId];
      if (button.parentNode) {
        button.parentNode.removeChild(button);
      }
      delete this.buttonElements[buttonId];
    });
  }
}
