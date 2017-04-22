PIXI.loader.add("sprite", "assets/sprite.png");

class PlayerLeft extends Entity {
  vy = 0;
  onGround = false;
  camera: Camera;

  constructor(state: StateClass) {
    super(state, { texture: "sprite" });

    const { tilemap, cameraLeft } = state;
    const startingObject = tilemap.objectLayers["ObjLayer"].objects[0];

    this.x = startingObject.x;
    this.y = startingObject.y;

    this.z = 10;

    this.camera = cameraLeft;
  }

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

  checkForMapTransition(state: StateClass) {
    const { tilemap } = state;

    if (!tilemap.contains(this, this.camera)) {
      tilemap.changeSection(state, this, this.camera);
    }
  }

  update(state: StateClass) {
    this.move(state);
    this.checkForMapTransition(state);
  }
}