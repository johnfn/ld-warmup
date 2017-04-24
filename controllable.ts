class Controllable extends Entity {
  vy = 0;
  vx = 0;

  onGround = false;
  onSafeGround = false;
  canPickUpWorld = false;
  isTossingWorld = false;
  facing = 1;
  lastSafeSpot: IPoint;

  camera: Camera;

  private lastTalkCoID: number = -1;

  constructor(state: StateClass, props: {
    width?: number;
    height?: number;
    texture: string;

    spritesheet?: SpritesheetIndex;
    parent?: PIXI.Container;
  }) {
    super(state, props);

    state.playerIds.push(this.id);
  }

  isActive(state: StateClass): boolean {
    return state.activePlayerId === this.id;
  }

  static SwitchActivePlayer(state: StateClass): void {
    let currentIndex = state.playerIds.indexOf(state.activePlayerId);

    state.activePlayerId = state.playerIds[(currentIndex + 1) % state.playerIds.length];
  }

  jump(): void {
    this.vy -= 7;
  }

  move(state: StateClass): MoveResult {
    const { keyboard, physics } = state;
    let dx = 0, dy = 0;

    if (this.isActive(state)) {
      if (keyboard.down.Left) {
        dx -= 5;
      }

      if (keyboard.down.Right) {
        dx += 5;
      }

      if (this.onGround && keyboard.down.Spacebar) {
        this.jump();
      }

      if (!keyboard.down.Spacebar && this.vy < 0) {
        this.vy = 0;
      }

      if (keyboard.justDown.C) {
        keyboard.clear("C");

        Controllable.SwitchActivePlayer(state);
      }
    }

    this.vy += G.Gravity;

    dy += this.vy;
    dx += this.vx;

    const moveResult = physics.move(state, this, dx, dy);
    const hitDown = moveResult.hitDown;
    const hitUp = moveResult.hitUp;

    if (hitDown || hitUp) {
      this.vy = 0;
    }

    this.onGround = hitDown && dy > 0;

    this.onSafeGround = false;

    if (this.onGround) {
      this.onSafeGround = moveResult.thingsHit.filter(x => isTile(x)).length > 0;
    }

    // apply friction

    this.vx /= 1.1;

    if (Math.abs(this.vx) < 0.5) { this.vx = 0; }

    return moveResult;
  }

  update(state: StateClass) {
    const { keyboard } = state;

    if (this.isActive(state)) {
      if (keyboard.down.Left) {
        this.facing = -1;
      } else if (keyboard.down.Right) {
        this.facing = 1;
      }
    }

    // you dont move when you're tossing the world.

    if (!this.isTossingWorld) {
      const { thingsHit } = this.move(state);

      if (this.isActive(state)) {
        this.checkForActiveCollisions(state, thingsHit);

        if (keyboard.justDown.X) {
          this.checkInspect(state);
        }
      }

      this.checkForIndiscriminateCollisions(state, thingsHit);
    }
  }

  checkInspect(state: StateClass): void {
    const { cinematics } = state;
    const inspectRegions = state.tilemap.regionLayers.InspectRegions.regions;

    for (const { region, properties } of inspectRegions) {
      if (region.contains(this) && properties && !this.isCoroutineActive(this.lastTalkCoID)) {
        let text = state.isProfActive() ? properties.profinspect : properties.inspect;

        this.lastTalkCoID = this.startCoroutine(state, cinematics.talk(this, text))

        break;
      }
    }
  }

  checkForActiveCollisions(state: StateClass, tiles: HitTestResult): void {
    const dimHouseFront = tiles.filter(t => isTile(t) && t.layername === "HouseFront").length > 0;

    state.tilemap.spriteLayers.HouseFront.alpha = dimHouseFront ? 0.3 : 1.0;
  }

  restore(state: StateClass): void {
    this.x = this.lastSafeSpot.x;
    this.y = this.lastSafeSpot.y;

    this.startCoroutine(state, this.flicker());
  }

  checkForIndiscriminateCollisions(state: StateClass, things: HitTestResult): void {
    let died = false;

    died = died || things.filter(x => x instanceof Entity && x.deadly).length > 0;

    if (died) {
      this.restore(state);

      return;
    }

    if (this.onSafeGround) {
      this.lastSafeSpot = {
        x: this.x,
        y: this.y,
      };
    }
  }
}