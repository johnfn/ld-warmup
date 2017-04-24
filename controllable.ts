class Controllable extends Entity {
  readonly tossSpeed = 8;

  vy = 0;
  vx = 0;

  groundForgiveness = 7;

  onGround = 0;
  onSafeGround = false;
  canPickUpWorld = false;
  isTossingWorld = false;
  cantWalk = false;

  facing = 1;
  lastSafeSpot: IPoint;

  camera: Camera;

  scopes: Scope[] = [];

  private lastTalkCoID: number = -1;

  constructor(state: StateClass, props: {
    width?: number;
    height?: number;
    depth?: number;
    texture: string;

    spritesheet?: SpritesheetIndex;
    parent?: PIXI.Container;
  }) {
    super(state, props);

    state.playerIds.push(this.id);
    this.sprite.pivot = new PIXI.Point(16, 0);

    for (let i = 0; i < 10; i++) {
      const scope = new Scope(state, this.sprite);

      this.scopes.push(scope);
      scope.visible = false;
    }
  }

  isActive(state: StateClass): boolean {
    return state.activePlayerId === this.id;
  }

  static SwitchActivePlayer(state: StateClass): void {
    let currentIndex = state.playerIds.indexOf(state.activePlayerId);

    state.activePlayerId = state.playerIds[(currentIndex + 1) % state.playerIds.length];
  }

  jump(): void {
    this.vy -= 7;
    this.onGround = 0;
  }

  move(state: StateClass): MoveResult {
    const { keyboard, physics } = state;
    let dx = 0, dy = 0;

    if (this.isActive(state)) {
      if (this.cantWalk) {
        if (keyboard.justDown.Left || keyboard.justDown.Right || keyboard.justDown.Spacebar) {
          this.cantWalk = false;
        }
      } else {
        if (keyboard.down.Left) {
          dx -= 5;
        }

        if (keyboard.down.Right) {
          dx += 5;
        }
      }

      if (this.onGround > 0 && keyboard.down.Spacebar) {
        this.jump();
      }

      if (!keyboard.down.Spacebar && this.vy < 0) {
        this.vy = 0;
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

    this.onGround = hitDown && dy > 0 ? this.groundForgiveness : --this.onGround;

    this.onSafeGround = false;

    if (this.onGround >= 0) {
      this.onSafeGround = moveResult.thingsHit.filter(x => isTile(x)).length > 0;
    }

    // apply friction

    this.vx /= 1.1;

    if (Math.abs(this.vx) < 0.5) { this.vx = 0; }

    return moveResult;
  }

  update(state: StateClass) {
    const { keyboard, cinematics } = state;

    if (this.isActive(state)) {
      if (keyboard.down.Left) {
        this.facing = -1;
      } else if (keyboard.down.Right) {
        this.facing = 1;
      }
    }

    if (Math.sign(this.facing) !== Math.sign(this.sprite.scale.x)) {
      this.sprite.scale.x *= -1;
    }

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

    // you dont move when you're tossing the world.

    if (!this.isTossingWorld) {
      const { thingsHit } = this.move(state);

      if (this.isActive(state)) {
        this.checkForActiveCollisions(state, thingsHit);

        if (keyboard.justDown.X) {
          this.checkInspect(state);
        }
      }

      this.checkForIndiscriminateCollisions(state, thingsHit);
    }
  }

  checkForInteractions(state: StateClass): boolean {
    const { cinematics } = state;

    if (TinyWorld.Instance.canBePickedUp(this)) {
      TinyWorld.Instance.isBeingCarried = true;
      TinyWorld.Instance.carrier = this;

      return true;
    }

    const phones = state.entities.filter(x => x instanceof Phone) as Phone[];
    let closestPhone  = Util.minBy(phones, p => Util.Dist(p, this))!;

    if (Util.Dist(closestPhone, this) < Phone.DistanceAcceptable) {
      if (cinematics.canSwitchToOtherGuy) {
        state.keyboard.clear("X");

        Controllable.SwitchActivePlayer(state);

        return true;
      }

      if (cinematics.currentOrLastEvent === "You Use Phone") {
        cinematics.finishCinematic();

        return true;
      }

      // switch
    }

    if (Util.Dist(this, Cannon.Instance) < 100 && !Cannon.fired) {
      if (this.x > Cannon.Instance.x) {
        this.startCoroutine(state, cinematics.talk(this, "I need to be on the left side of the cannon..."));
      } else {
        if (this.facing == 1) {
          this.startCoroutine(state, cinematics.fireCannon());

          Cannon.fired = true;
        } else {
          this.startCoroutine(state, cinematics.talk(this, "I need to face the other way..."));
        }
      }
    }

    return false;
  }

  checkInspect(state: StateClass): void {
    const { cinematics } = state;
    const inspectRegions = state.tilemap.regionLayers.InspectRegions.regions;

    for (const { region, properties } of inspectRegions) {
      if (region.contains(this) && properties && !this.isCoroutineActive(this.lastTalkCoID)) {
        let text = state.isProfActive() ? properties.profinspect : properties.inspect;

        this.lastTalkCoID = this.startCoroutine(state, cinematics.talk(this, text))

        break;
      }
    }
  }

  checkForActiveCollisions(state: StateClass, tiles: HitTestResult): void {
    const dimHouseFront = tiles.filter(t => isTile(t) && t.layername === "HouseFront").length > 0;

    state.tilemap.spriteLayers.HouseFront.alpha = dimHouseFront ? 0.3 : 1.0;
  }

  restore(state: StateClass): void {
    this.x = this.lastSafeSpot.x;
    this.y = this.lastSafeSpot.y;

    this.startCoroutine(state, this.flicker());
  }

  checkForIndiscriminateCollisions(state: StateClass, things: HitTestResult): void {
    let died = false;

    died = died || things.filter(x => x instanceof Entity && x.deadly).length > 0;

    if (died) {
      this.restore(state);

      return;
    }

    if (this.onSafeGround) {
      this.lastSafeSpot = {
        x: this.x,
        y: this.y,
      };
    }
  }


  drawScopes(state: StateClass): void {
    const { keyboard } = state;

    if (!this.isTossingWorld) {
      for (const s of this.scopes) {
        s.visible = false;
      }

      return;
    }

    // scale (facing) will take care of this for us. ( tricky )

    let vx = Math.abs((keyboard.down.Left ? -25 : 0) + (keyboard.down.Right ? 25 : 0));
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
    const { keyboard, playerLeft, cinematics } = state;
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
        vx = - this.facing * speed;
        vy = speed;
      }

      TinyWorld.Instance.vx = vx;
      TinyWorld.Instance.vy = vy;

      TinyWorld.Instance.carrier = null;
      TinyWorld.Instance.isBeingCarried = false;

      // do a fling

      if (cinematics.allowFlinging) {
        playerLeft.vx = -vx * 3;
        playerLeft.vy =  vy * 1.3;

        state.cameraLeft.shake = { duration: 20, strength: 5 };

        cinematics.interruptPhoneCall();

        this.startCoroutine(state, cinematics.gotTossedLel());
      }

      this.cantWalk = true;
    }
  }

  activeDialogCo: number = -1;

  checkForRegionDialogs(state: StateClass) {
    const { cinematics } = state;
    let dialogRegions: RegionLayer;

    if (state.playerRightProf as Controllable === this) {
      dialogRegions = state.tilemap.regionLayers.ProfDialogRegions;
    } else {
      dialogRegions = state.tilemap.regionLayers.YourDialogRegions;
    }

    for (const { region, properties } of dialogRegions.regions) {
      if (!properties) {
        console.error('dialog region w/o props...')

        continue;
      }

      if (region.contains(this) && !properties.done) {
        if (this.activeDialogCo !== -1 && state.isActiveCo(this.activeDialogCo)) {
          // too hard to stop lol

          break;
        }

        if (properties.name === "spikeirony") {
          this.activeDialogCo = this.startCoroutine(state, cinematics.spikeIrony());
        }

        if (properties.name === "ohno") {
          this.activeDialogCo = this.startCoroutine(state, cinematics.ohno());
        }

        if (properties.name === "madeit") {
          cinematics.madeit = true;
        }

        if (properties.dialog) {
          this.activeDialogCo = this.startCoroutine(state, cinematics.talk(this, properties.dialog));
        }

        properties.done = true;
      }
    }
  }
}