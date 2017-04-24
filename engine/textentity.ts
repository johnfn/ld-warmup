class TextEntity extends Base {
  textObject: MultiStyleText;
  exists = true;

  public get x(): number { return this.textObject.x; }
  public set x(v: number) { this.textObject.x = v; }

  public get y(): number { return this.textObject.y; }
  public set y(v: number) { this.textObject.y = v; }

  public get width(): number { return this.textObject.width; }

  public get height(): number { return this.textObject.height; }

  public set text(value: string) { this.textObject.text = value; }

  public get text(): string { return this.textObject.text; }

  style: TextStyleSet;

  wordWrapWidth: number;

  constructor(state: StateClass, {
    parent = state.stage,
    style = {
      default: {
        fontFamily: "FreePixel",
        fontSize: "20px",
        fill: "#ffffff",
        align: "left",
        wordWrap: true,
        wordWrapWidth: 300,
        dropShadow: true,
        dropShadowDistance: 3,
      },

      you: {
        fill: "#aaff88",
      },

      large: {
        fontSize: "48px",
        fill: "#aaff88",
        stroke: "black",
      },

      prof: {
        fill: "#aaccff",
      },
    }
  } = {}) {
    super(state);

    this.style = style;
    this.textObject = new MultiStyleText("", style);

    parent.addChild(this.textObject);

    this.wordWrapWidth = style.default.wordWrapWidth;
  }

  destroy(): void {
    if (this.textObject.parent) {
      this.textObject.parent.removeChild(this.textObject);
    }

    this.exists = false;
  }

  update(state: StateClass) {
    super.update(state);
  }

  *flicker() {
    for (let i = 0; i < 3; i++) {
      this.textObject.visible = false;

      yield { frames: 5 };

      this.textObject.visible = true;

      yield { frames: 5 };
    }
  }
}