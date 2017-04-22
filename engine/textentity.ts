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

  style: TextStyleSet;

  wordWrapWidth: number;

  constructor(state: StateClass, {
    parent = state.stage,
    style = {
      default: {
        fontFamily: "FreePixel",
        fontSize: "18px",
        fill: "#ffffff",
        align: "left",
        wordWrap: true,
        wordWrapWidth: 300,
      }
    }
  } = {}) {
    super(state);

    this.style = style;
    this.textObject = new MultiStyleText("hallo", style);

    parent.addChild(this.textObject);

    this.wordWrapWidth = style.default.wordWrapWidth;
  }

  destroy(): void {
    this.textObject.parent.removeChild(this.textObject);
    this.exists = false;
  }

  update(state: StateClass) {
    super.update(state);
  }
}