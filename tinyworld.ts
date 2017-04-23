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
    const { physics } = state;

    if (this.isBeingCarried && this.carrier) {
      this.x = this.carrier.x;
      this.y = this.carrier.y - 32;

      return;
    }

    this.vy += G.Gravity;

    const moveResult = physics.move(state, this, this.vx, this.vy);
    const hitDown = moveResult.hitDown;
    const hitUp = moveResult.hitUp;

    if (hitDown || hitUp) {
      this.vy = 0;
    }

    // friction is not fiction, to be clear

    this.vx /= 1.03;

    if (Math.abs(this.vx) < 0.5) { this.vx = 0; }
  }

  canBePickedUp(by: Controllable): boolean {
    return Math.abs(this.vx) < 4 &&
           this.vy === 0 &&
           Util.Dist(by, this) < TinyWorld.InteractionDistance &&
           !this.isBeingCarried;
  }
}