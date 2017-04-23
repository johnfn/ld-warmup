// Professor

class PlayerRight extends Controllable {
  vy = 0;
  onGround = false;
  camera: Camera;
  canPickUpWorld = true;

  facing = 1;

  constructor(state: StateClass) {
    super(state, { texture: "sprite" });

    const { tilemap, cameraRight } = state;
    const startingObject = tilemap.objectLayers["ObjLayer"].objects[0];

    this.x = startingObject.x + 50;
    this.y = startingObject.y;

    this.z = 10;

    this.camera = cameraRight;
  }

  checkForMapTransition(state: StateClass) {
    const { tilemap } = state;

    if (!tilemap.contains(this, this.camera)) {
      tilemap.changeSection(state, this, this.camera);
    }
  }

  update(state: StateClass) {
    const { keyboard } = state;

    super.update(state);

    this.checkForMapTransition(state);

    if (state.activePlayerId === this.id) {
      if (keyboard.down.Left) {
        this.facing = -1;
      }

      if (keyboard.down.Right) {
        this.facing = 1;
      }
    }

    if (state.activePlayerId === this.id && keyboard.justDown.X) {
      const hadInteraction = this.checkForInteractions(state);

      if (hadInteraction) {
        return;
      }

      if (TinyWorld.Instance.carrier === this) {
        this.isTossingWorld = true;
      }
    }

    if (this.isTossingWorld) {
      this.throwWorld(state);
    }
  }

  checkForInteractions(state: StateClass): boolean {
    if (TinyWorld.Instance.canBePickedUp(this)) {
      TinyWorld.Instance.isBeingCarried = true;
      TinyWorld.Instance.carrier = this;

      return true;
    }

    return false;
  }

  throwWorld(state: StateClass): void {
    const { keyboard } = state;

    if (!keyboard.down.X) {
      this.isTossingWorld = false;

      let vx = (keyboard.down.Left ? -10 : 0) + (keyboard.down.Right ? 10 : 0);
      let vy = (keyboard.down.Up ? -10 : 0)   + (keyboard.down.Down ? 10 : 0);

      // no faster diagonals!

      if (vx !== 0 && vy !== 0) {
        vx /= Math.sqrt(2);
        vy /= Math.sqrt(2);
      }

      TinyWorld.Instance.vx = vx;
      TinyWorld.Instance.vy = vy;
      TinyWorld.Instance.carrier = null;
      TinyWorld.Instance.isBeingCarried = false;
    }
  }
}