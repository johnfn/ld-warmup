PIXI.loader.add("tinyworld", "assets/tinyworld.png");

class TinyWorld extends Entity {
  vx = 0;
  vy = 0;

  static InteractionDistance = 100;
  static Instance: TinyWorld;
  isBeingCarried = false;
  carrier: Controllable | null = null;

  constructor(state: StateClass) {
    super(state, { texture: "tinyworld" });

    TinyWorld.Instance = this;
  }

  update(state: StateClass) {
    super.update(state);

    this.updatePosition(state);
  }

  updatePosition(state: StateClass) {
    if (this.isBeingCarried && this.carrier) {
      this.x = this.carrier.x;
      this.y = this.carrier.y - 32;

      return;
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  canBePickedUp(): boolean {
    return this.vx === 0 && this.vy === 0 && !this.isBeingCarried;
  }
}