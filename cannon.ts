PIXI.loader.add("cannon-tex", "assets/cannon.png");

class Cannon extends Entity {
  collideable = true;

  constructor(state: StateClass) {
    super(state, {
      texture: "cannon-tex",
      depth: Depths.TinyWorld,
    });
  }
}