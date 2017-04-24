class BGSprite {
  sprite: PIXI.Sprite;
  scale = 8;

  dimmer: Entity;

  constructor(state: StateClass, canvas: HTMLCanvasElement) {
    this.sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
    this.sprite.scale = new PIXI.Point(this.scale, this.scale);

    this.dimmer = new Entity(state, {
      width: this.sprite.width,
      height: this.sprite.height,
      texture: "black",
      depth: Depths.Fade,
      parent: this.sprite
    });

    this.dimmer.sprite.alpha = 0.5;
  }

  update(state: StateClass) {
    const { width, height } = state;

    const worldX = TinyWorld.Instance.x - state.cameraRight.x;
    const worldY = TinyWorld.Instance.y + 24 - state.cameraRight.y;

    // effectively zoom around (worldx, worldy)

    this.sprite.x = - worldX * this.scale + width  / 2;
    this.sprite.y = - worldY * this.scale + height / 2;

    if (state.cinematics.isOnTinyWorld && !this.sprite.parent) {
      state.root.addChildAt(this.sprite, 0);
    }

    if (!state.cinematics.isOnTinyWorld && this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
  }
}