const textureCache: { [key: string]: PIXI.Texture } = {};

interface SpritesheetIndex {
  x: number;
  y: number;
}

class Entity extends Base {
  sprite: PIXI.Sprite;

  collideable = false;
  deadly      = false;

  oneCameraOnly: "left" | "right" | "no" = "no";

  public get x(): number { return this.sprite.x; }
  public set x(v: number) { this.sprite.x = v; }

  public get y(): number { return this.sprite.y; }
  public set y(v: number) { this.sprite.y = v; }

  public get z(): number { return (this.sprite as any).z; }
  public set z(v: number) { (this.sprite as any).z = v; }

  public get width(): number { return this.sprite.width; }

  public get height(): number { return this.sprite.height; }

  public get visible(): boolean { return this.sprite.visible; }
  public set visible(v: boolean) { this.sprite.visible = v; }

  public get pt(): Point {
    return new Point({ x: this.x, y: this.y });
  }

  private textureName: string;

  private static MaxEntityId = 0;

  id: number;

  getCachedSpritesheetTexture(state: StateClass, textureName: string, x: number, y: number): PIXI.Texture {
    const { tilewidth, tileheight } = state;
    const key = `${ textureName }-${ x }-${ y }`;

    if (!textureCache[key]) {
      const texture = PIXI.loader.resources[textureName].texture.clone();
      const rect = new PIXI.Rectangle(x * tilewidth, y * tileheight, tilewidth, tileheight);

      texture.frame = rect;

      textureCache[key] = texture;
    }

    return textureCache[key];
  }

  constructor(state: StateClass, props: {
    width?: number;
    height?: number;
    depth?: number;
    dontRegister?: boolean;
    texture: string;

    spritesheet?: SpritesheetIndex;
    parent?: PIXI.Container;
  }) {
    super(state, props.dontRegister || false);

    const { stage } = state;
    const { texture: textureName, width, height, spritesheet, parent = stage } = props;

    if (spritesheet) {
      const { x: spritesheetx, y: spritesheety } = spritesheet;
      const texture = this.getCachedSpritesheetTexture(state, textureName, spritesheetx, spritesheety);

      this.sprite = new PIXI.Sprite(texture);
    } else {
      this.sprite = new PIXI.Sprite(
        PIXI.loader.resources[textureName].texture
      );
    }

    this.textureName = textureName;

    this.sprite.width = width || 32;
    this.sprite.height = height || 32;

    parent.addChild(this.sprite);

    // basically a proxy for isTile() which would be n**2 lg n which is way 2 much.
    if (!props.dontRegister) {
      this.z = props.depth || 0;
      Util.SortDepths(parent);
    }

    this.id = ++Entity.MaxEntityId;
  }

  setTexture(index: SpritesheetIndex): void {
    const { x, y } = index;

    this.sprite.texture = this.getCachedSpritesheetTexture(state, this.textureName, x, y);
  }

  destroy(state: StateClass) {
    this.sprite.parent.removeChild(this.sprite);

    state.entities.splice(state.entities.indexOf(this), 1);
  }

  *flicker() {
    for (let i = 0; i < 5; i++) {
      this.visible = false;

      yield { frames: 3 };

      this.visible = true;

      yield { frames: 3 };
    }

    for (let i = 0; i < 5; i++) {
      this.visible = false;

      yield { frames: 1 };

      this.visible = true;

      yield { frames: 1 };
    }
  }
}