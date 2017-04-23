class BGSprite {
  sprite: PIXI.Sprite;

  constructor(state: StateClass, canvas: HTMLCanvasElement) {
    this.sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));

    this.sprite.x = 100;
    this.sprite.y = 100;

    state.root.addChildAt(this.sprite, 0);
  }
}