class Controllable extends Entity {
  vy = 0;
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

  move(state: StateClass) {
    const { keyboard, physics } = state;
    let dx = 0, dy = 0;

    if (this.isActive(state)) {
      if (keyboard.down.A) {
        dx -= 5;
      }

      if (keyboard.down.D) {
        dx += 5;
      }

      if (this.onGround && keyboard.down.Spacebar) {
        this.vy -= 6;
      }

      if (!keyboard.down.Spacebar && this.vy < 0) {
        this.vy = 0;
      }

      if (keyboard.justDown.Z) {
        keyboard.clear("Z");

        this.switchActivePlayer(state);
      }
    }

    this.vy += G.Gravity;

    dy += this.vy;

    const {
      hitDown,
      hitUp,
    } = physics.move(state, this, dx, dy);

    if (hitDown || hitUp) {
      this.vy = 0;
    }

    this.onGround = hitDown && dy > 0;
  }
}