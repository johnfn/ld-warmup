class Controllable extends Entity {
  vy = 0;
  vx = 0;
  onGround = false;

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

  switchActivePlayer(state: StateClass): void {
    let currentIndex = state.playerIds.indexOf(this.id);

    state.activePlayerId = state.playerIds[(currentIndex + 1) % state.playerIds.length];
  }

  jump(): void {
    this.vy -= 6;
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

        this.switchActivePlayer(state);
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

    // apply friction

    this.vx /= 1.1;

    if (Math.abs(this.vx) < 0.5) { this.vx = 0; }

    return moveResult;
  }

  update(state: StateClass) {
    if (this.isActive(state)) {
      const { thingsHit } = this.move(state);

      this.checkForCollisionReactions(state, thingsHit);
    }
  }

  checkForCollisionReactions(state: StateClass, tiles: Tile[]): void {
    const dimHouseFront = tiles.filter(t => t.layername === "HouseFront").length > 0;

    state.tilemap.spriteLayers.HouseFront.alpha = dimHouseFront ? 0.3 : 1.0;
  }
}