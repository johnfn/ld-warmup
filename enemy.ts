PIXI.loader.add("enemy", "assets/enemy.png");

class Enemy extends Entity {
  constructor(state: StateClass) {
    super(state, { texture: "enemy" });

    this.x = 32 * 5;
    this.y = 32 * 2;

    this.startCoroutine(state, this.enemyBehavior());
  }

  *enemyBehavior() {
    while (true) {
      for (let i = 0; i < 60; i++) {
        this.x += 1;

        yield "next";
      }

      for (let i = 0; i < 60; i++) {
        this.x -= 1;

        yield "next";
      }
    }
  }
}