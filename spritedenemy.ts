PIXI.loader.add("se", "assets/se.png");

class SpritedEnemy extends Entity {
  constructor(state: StateClass) {
    super(state, {
      texture: "se",
      spritesheet: { x: 1, y: 1 },
    });

    this.x = 32 * 8;
    this.y = 32 * 2;

    state.startCoroutine(this.animate());
  }

  *animate() {
    while (true) {
      this.setTexture({ x: 1, y: 0 });

      yield { frames: 60 };

      this.setTexture({ x: 0, y: 1 });

      yield { frames: 60 };
    }
  }
}