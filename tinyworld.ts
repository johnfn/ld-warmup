PIXI.loader.add("tinyworld", "assets/tinyworld.png");

class TinyWorld extends Entity {
  vx = 0;
  vy = 0;

  static InteractionDistance = 100;
  static Instance: TinyWorld;
  isBeingCarried = false;
  carrier: Controllable;

  constructor(state: StateClass) {
    super(state, { texture: "tinyworld" });

    TinyWorld.Instance = this;
  }

  update(state: StateClass) {
    super.update(state);

    if (this.isBeingCarried) {
      this.x = this.carrier.x;
      this.y = this.carrier.y - 32;
    }
  }
}