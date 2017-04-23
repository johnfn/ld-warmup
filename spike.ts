PIXI.loader.add("spike-tex", "assets/spike.png");

class Spike extends Entity {
  collideable = true;
  deadly      = true;

  constructor(state: StateClass) {
    super(state, { texture: "spike-tex" });
  }
}