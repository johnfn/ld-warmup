PIXI.loader.add("cannon-tex", "assets/cannon.png");

class Cannon extends Entity {
  collideable = true;

  static Instance: Cannon;

  constructor(state: StateClass) {
    super(state, {
      texture: "cannon-tex",
      depth: Depths.TinyWorld,
    });

    Cannon.Instance = this;
  }
}