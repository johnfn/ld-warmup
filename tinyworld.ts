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
    const activeCam = state.getActiveCamera();

    if (this.isBeingCarried && this.carrier) {
      this.x = this.carrier.x;
      this.y = this.carrier.y - 32;

      return;
    }

    this.vy += G.Gravity;

    const moveResult = physics.move(state, this, this.vx, this.vy);
    const { hitDown, hitUp, hitLeft, hitRight, hit } = moveResult;

    if (hitDown || hitUp) {
      this.vy = -this.vy * 0.8;
    }

    if (hitLeft || hitRight) {
      this.vx = -this.vx * 0.8;
    }

    if (hit && (Math.abs(this.vx) > 5 || Math.abs(this.vy) > 5)) {
      activeCam.shake = { duration: 10, strength: 10 };
    }

    // friction is not fiction, to be clear

    this.vx /= 1.03;

    if (Math.abs(this.vx) < 0.5) { this.vx = 0; }
  }

  canBePickedUp(by: Controllable): boolean {
    return Util.Dist(by, this) < TinyWorld.InteractionDistance &&
           !this.isBeingCarried;
  }
}