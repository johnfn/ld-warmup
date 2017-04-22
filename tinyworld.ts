PIXI.loader.add("tinyworld", "assets/tinyworld.png");

class TinyWorld extends Entity {
  constructor(state: StateClass) {
    super(state, { texture: "tinyworld" });
  }

  update(state: StateClass) {
    super.update(state);
  }
}