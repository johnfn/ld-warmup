PIXI.loader.add("prof", "assets/prof.png");

class PlayerRight extends Controllable {
  readonly tossSpeed = 8;

  vy = 0;
  onGround = false;
  canPickUpWorld = true;
  collideable = true;

  scopes: Scope[] = [];

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

    for (let i = 0; i < 10; i++) {
      const scope = new Scope(state, this.sprite);

      this.scopes.push(scope);
      scope.visible = false;
    }
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
      if (keyboard.justDown.X) {
        const hadInteraction = this.checkForInteractions(state);

        if (hadInteraction) {
          return;
        }

        if (TinyWorld.Instance.carrier === this) {
          this.isTossingWorld = true;
        }
      }

      this.drawScopes(state);

      if (this.isTossingWorld) {
        this.throwWorld(state);
      }

      this.checkForRegionDialogs(state);
    }
  }

  checkForRegionDialogs(state: StateClass) {
    const { cinematics } = state;
    const dialogRegions = state.tilemap.regionLayers.ProfDialogRegions;

    for (const { region, properties } of dialogRegions.regions) {
      if (!properties) {
        console.error('dialog region w/o props...')

        continue;
      }

      if (region.contains(this) && !properties.done) {
        if (properties.name === "spikeirony") {
          this.startCoroutine(state, cinematics.spikeIrony());
        }

        properties.done = true;
      }
    }
  }

  checkForInteractions(_state: StateClass): boolean {
    if (TinyWorld.Instance.canBePickedUp(this)) {
      TinyWorld.Instance.isBeingCarried = true;
      TinyWorld.Instance.carrier = this;

      return true;
    }

    return false;
  }

  drawScopes(state: StateClass): void {
    const { keyboard } = state;

    if (!this.isTossingWorld) {
      for (const s of this.scopes) {
        s.visible = false;
      }

      return;
    }

    let vx = (keyboard.down.Left ? -25 : 0) + (keyboard.down.Right ? 25 : 0);
    let vy = (keyboard.down.Up ? -25 : 0)   + (keyboard.down.Down ? 25 : 0);

    let x = 16;
    let y = -16; // center of tinyworld (above head!)

    for (const s of this.scopes) {
      x += vx;
      y += vy;

      s.x = x;
      s.y = y;

      s.visible = true;
    }
  }

  throwWorld(state: StateClass): void {
    const { keyboard } = state;
    const speed = this.tossSpeed;

    if (!keyboard.down.X) {
      this.isTossingWorld = false;

      let vx = (keyboard.down.Left ? -speed : 0) + (keyboard.down.Right ? speed : 0);
      let vy = (keyboard.down.Up ? -speed : 0)   + (keyboard.down.Down ? speed : 0);

      // no faster diagonals!

      if (vx !== 0 && vy !== 0) {
        vx /= Math.sqrt(2);
        vy /= Math.sqrt(2);
      }

      // if they didnt input a direction, do a half hearted toss in the last
      // direction they were facing

      if (vx === 0 && vy === 0) {
        vx = this.facing * speed / 2;
        vy = speed / 2;
      }

      TinyWorld.Instance.vx = vx;
      TinyWorld.Instance.vy = vy;
      TinyWorld.Instance.carrier = null;
      TinyWorld.Instance.isBeingCarried = false;
    }
  }
}