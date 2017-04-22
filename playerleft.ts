PIXI.loader.add("sprite", "assets/sprite.png");

// You.
class PlayerLeft extends Controllable {
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

  checkForMapTransition(state: StateClass) {
    const { tilemap } = state;

    if (!tilemap.contains(this, this.camera)) {
      tilemap.changeSection(state, this, this.camera);
    }
  }

  update(state: StateClass) {
    this.checkForMapTransition(state);
    this.checkForRegionDialogs(state);
    this.checkForWorldSucking(state);

    super.update(state);
  }

  checkForWorldSucking(state: StateClass): void {
    const tinyWorld = TinyWorld.Instance;

    if (Util.Dist(tinyWorld, this) < 300) {
      this.vx = Math.sign(tinyWorld.x - this.x);
    }
  }

  checkForRegionDialogs(state: StateClass) {
    const { cinematics } = state;
    const dialogRegions = state.tilemap.regionLayers.YourDialogRegions;

    for (const { region, properties } of dialogRegions.regions) {
      if (!properties) {
        console.error('dialog region w/o props...')

        continue;
      }

      if (region.contains(this) && !properties.done) {
        this.startCoroutine(state, cinematics.talk(this, properties.dialog));

        properties.done = true;
      }
    }
  }
}