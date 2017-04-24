PIXI.loader.add("prof", "assets/prof.png");

class PlayerRight extends Controllable {
  vy = 0;
  onGround = false;
  canPickUpWorld = true;
  collideable = true;

  constructor(state: StateClass) {
    super(state, {
      texture: "prof",
      depth: Depths.Prof,
    });

    const { tilemap, cameraRight } = state;
    const startingObject = tilemap.objectLayers["ObjLayer"].objects[0];

    this.x = startingObject.x + 50;
    this.y = startingObject.y;

    this.camera = cameraRight;
  }

  checkForMapTransition(state: StateClass) {
    const { tilemap } = state;

    if (!tilemap.contains(this, this.camera)) {
      tilemap.changeSection(state, this, this.camera);
    }
  }

  update(state: StateClass) {
    super.update(state);

    this.checkForMapTransition(state);
  }
}