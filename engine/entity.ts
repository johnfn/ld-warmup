const textureCache: { [key: string]: PIXI.Texture } = {};

interface SpritesheetIndex {
  x: number;
  y: number;
}

class Entity extends Base {
  sprite: PIXI.Sprite;

  public get x(): number { return this.sprite.x; }
  public set x(v: number) { this.sprite.x = v; }

  public get y(): number { return this.sprite.y; }
  public set y(v: number) { this.sprite.y = v; }

  public get width(): number { return this.sprite.width; }

  public get height(): number { return this.sprite.height; }

  private textureName: string;

  private static MaxEntityId = 0;

  id: number;

  private getCachedSpritesheetTexture(state: StateClass, textureName: string, x: number, y: number): PIXI.Texture {
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
    texture: string;

    spritesheet?: SpritesheetIndex;
    parent?: PIXI.Container;
  }) {
    super(state);

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
}