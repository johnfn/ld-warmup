PIXI.loader.add("you", "assets/you.png");

// You.
class PlayerLeft extends Controllable {
  collideable = true;
  careAboutSucking = true;

  constructor(state: StateClass) {
    super(state, {
      texture: "you",
      depth: Depths.Player,
    });

    const { tilemap, cameraLeft } = state;
    const startingObject = tilemap.objectLayers["ObjLayer"].objects[0];

    this.x = startingObject.x;
    this.y = startingObject.y;

    this.camera = cameraLeft;
  }

  checkForMapTransition(state: StateClass) {
    const { tilemap } = state;

    if (!this.careAboutSucking) {
      // game is bascialy over just die

      return;
    }

    if (!tilemap.contains(this, this.camera)) {
      tilemap.changeSection(state, this, this.camera);
    }
  }

  update(state: StateClass) {
    this.checkForMapTransition(state);

    if (this.careAboutSucking) {
      this.checkForWorldSucking();
    }

    super.update(state);
  }

  checkForWorldSucking(): void {
    const tinyWorld = TinyWorld.Instance;

    if (Util.Dist(tinyWorld, this) < 400) {
      this.vx = Math.sign(tinyWorld.x - this.x);
    }

    if (Util.Dist(tinyWorld, this) < 200) {
      this.vy = 0;
      this.vx = Math.sign(tinyWorld.x - this.x) * 2;

      this.sprite.scale.x = this.facing * Util.Dist(tinyWorld, this) / 200;
      this.sprite.scale.y = Util.Dist(tinyWorld, this) / 200;

      const desiredY = tinyWorld.y - (1 - this.sprite.scale.y) * (this.height / 2);

      this.y += (desiredY - this.y) / 10;
    }
  }
}