PIXI.loader.add("tinyworld", "assets/tinyworld.png");

class TinyWorld extends Entity {
  static Instance: TinyWorld;

  constructor(state: StateClass) {
    super(state, { texture: "tinyworld" });

    TinyWorld.Instance = this;
  }

  update(state: StateClass) {
    super.update(state);
  }
}