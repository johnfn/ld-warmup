class Controllable extends Entity {
  vy = 0;
  onGround = false;

  isActive(state: StateClass): boolean {
    return state.activePlayerId === this.id;
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