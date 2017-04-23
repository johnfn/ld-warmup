class BGSprite {
  sprite: PIXI.Sprite;
  scale = 8;

  constructor(state: StateClass, canvas: HTMLCanvasElement) {
    this.sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));

    this.sprite.scale = new PIXI.Point(this.scale, this.scale);

    state.root.addChildAt(this.sprite, 0);
  }

  update(state: StateClass) {
    const { width, height } = state;

    const worldX = TinyWorld.Instance.x - state.cameraRight.x;
    const worldY = TinyWorld.Instance.y - state.cameraRight.y;

    // effectively zoom around (worldx, worldy)

    this.sprite.x = - worldX * this.scale + width  / 2;
    this.sprite.y = - worldY * this.scale + height / 2;
  }
}