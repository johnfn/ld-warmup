PIXI.loader.add("tinyworld", "assets/tinyworld.png");

class TinyWorld extends Entity {
  vx = 0;
  vy = 0;
  collideable = true;

  static InteractionDistance = 50;
  static Instance: TinyWorld;

  isBeingCarried = false;
  _carrier: Controllable | null = null;

  set carrier(v: Controllable | null) {
    this._carrier = v;

    if (v !== null) {
      this.lastCarrier = v;
      v.shouldHaveWorld = true;
    }
  }

  get carrier(): Controllable | null { return this._carrier; }

  lastCarrier: Controllable | null = null;

  lastSafeSpot: IPoint;

  constructor(state: StateClass) {
    super(state, {
      texture: "tinyworld",
      depth: Depths.TinyWorld,
    });

    TinyWorld.Instance = this;
  }

  update(state: StateClass) {
    super.update(state);

    this.updatePosition(state);
  }

  updatePosition(state: StateClass) {
    const { physics } = state;
    // const activeCam = state.getActiveCamera();
    const inactiveCam = state.getInactiveCamera();

    if (this.isBeingCarried && this.carrier) {
      this.x = this.carrier.x - 16;
      this.y = this.carrier.y - 32;

      return;
    }

    this.vy += G.Gravity;

    const moveResult = physics.move(state, this, this.vx, this.vy);
    const { hitDown, hitUp, hitLeft, hitRight, hit, thingsHit } = moveResult;

    if (hitDown || hitUp) {
      this.vy = -this.vy * 0.4;
      this.vx = this.vx * 0.4;
    }

    if (hitLeft || hitRight) {
      this.vx = -this.vx * 0.4;
    }

    if (hit && Math.abs(this.vx) + Math.abs(this.vy) > 3 && !state.cinematics.FINAL) {
      const power = Math.abs(this.vx) + Math.abs(this.vy);

      // activeCam.shake = { duration: 10, strength: 10 };
      inactiveCam.shake = { duration: power * 20, strength: power * 10 };
    }

    // friction is again fiction

    if (Math.abs(this.vx) < 0.5) { this.vx = 0; }

    this.checkForIndiscriminateCollisions(state, thingsHit);
  }

  restore(state: StateClass): void {
    if (this.lastCarrier) {
      this.isBeingCarried = true;
      this.carrier = this.lastCarrier;

      this.startCoroutine(state, this.flicker());
    } else {
      // this will never happen but hey

      alert('oh my god  how did you screw up so bad  please restart the game wow')
    }
  }

  checkForIndiscriminateCollisions(state: StateClass, things: HitTestResult): void {
    let died = false;

    died = died || things.filter(x => x instanceof Entity && x.deadly).length > 0;

    if (died) {
      this.restore(state);

      return;
    }
  }


  canBePickedUp(by: Controllable): boolean {
    return Util.Dist(by, this) < TinyWorld.InteractionDistance &&
           !this.isBeingCarried;
  }
}