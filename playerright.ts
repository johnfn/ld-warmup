// Professor

class PlayerRight extends Controllable {
  vy = 0;
  onGround = false;
  camera: Camera;
  canPickUpWorld = true;

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

    if (state.activePlayerId === this.id && keyboard.justDown.X) {
      this.checkForInteractions(state);
    }
  }

  checkForInteractions(state: StateClass) {
    if (Util.Dist(this, TinyWorld.Instance) < TinyWorld.InteractionDistance) {
      TinyWorld.Instance.isBeingCarried = true;
      TinyWorld.Instance.carrier = this;
    }
  }
}