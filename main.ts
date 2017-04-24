// Things to potentially add

// - screenshake ?
// - better styled text ? ? ?
// - proper depth sorting of entities.
// - particles?
// - fixed FPS
// - glow?
// - other funky shader fx?

type CoroutineResult = "next" | { frames: number };

class StateClass {
  readonly width = 600;
  readonly height = 400;
  readonly tilewidth = 32;
  readonly tileheight = 32;

  tilemap: TiledTilemap<{
    // Sprites

    Walls: true,
    HouseFront: true,
    MidGround: true,
  }, {
    // Regions

    "Camera Regions": true,
    "ProfessorDestRegions": true,
    "WorldDest1Regions": true,
    "YourDialogRegions": true,
    "ProfDialogRegions": true,
    "InspectRegions": true,
  }, {
    // Objects
    ObjLayer: true,
    PhoneLayer: true,
    Spikes: true,
    TinyWorldLocationLayer: true,
  }>;

  rendererBig: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
  rendererBigNoWorld: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
  rendererTiny: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
  playerLeft: PlayerLeft;
  playerRightProf: PlayerRight;

  keyboard: Keyboard;
  physics: Physics;
  cinematics: Cinematics;
  cameraLeft: CameraLeft;
  cameraRight: CameraRight;
  particles: AtmosphericParticles;
  hudObj: HUD;

  bgsprite: BGSprite;

  rightCamActive = false;
  leftCamActive  = true;

  entities: Base[];

  activePlayerId: number;
  playerIds: number[] = [];

  currentMode: Mode = "Game";

  coroutines: { [key: number]: {
      fn: IterableIterator<CoroutineResult>;
      framesLeftToWait: number;
      modes?: Mode[];
    }
  } = {};

  private coroutineId = 0;

  stage: PIXI.Container;
  hud: PIXI.Container;
  root: PIXI.Container;

  getActiveCamera(): Camera {
    if (this.rightCamActive) {
      return this.cameraRight;
    } else {
      return this.cameraLeft;
    }
  }

  getInactiveCamera(): Camera {
    if (this.rightCamActive) {
      return this.cameraLeft;
    } else {
      return this.cameraRight;
    }
  }


  getActivePlayer(): Controllable {
    if (this.rightCamActive) {
      return this.playerRightProf;
    } else {
      return this.playerLeft;
    }
  }

  isProfActive(): boolean {
    return this.rightCamActive;
  }

  // HOW DO I GRAMMAR HALP
  isYouActive(): boolean {
    return this.leftCamActive;
  }

  constructor(data: TiledJSON) {
    const bgColor = 0x276bab;

    this.rendererBig = PIXI.autoDetectRenderer(this.width, this.height, {
      antialias: false,
      transparent: false,
      backgroundColor: bgColor,
      resolution: 1
    });
    document.body.appendChild(this.rendererBig.view);

    this.rendererBigNoWorld = PIXI.autoDetectRenderer(this.width, this.height, {
      antialias: false,
      transparent: false,
      backgroundColor: bgColor,
      resolution: 1
    });

    this.rendererTiny = PIXI.autoDetectRenderer(this.width, this.height, {
      antialias: false,
      transparent: false,
      backgroundColor: bgColor,
      resolution: 1
    });
    document.body.appendChild(this.rendererTiny.view);

    this.entities = [];

    this.stage = new PIXI.Container();
    this.hud = new PIXI.Container();

    this.root = new PIXI.Container();

    this.root.addChild(this.stage);
    this.root.addChild(this.hud);

    this.cameraLeft = new CameraLeft(this);
    this.cameraRight = new CameraRight(this);

    this.tilemap = new TiledTilemap(this, data) as any;
    this.playerLeft = new PlayerLeft(this);
    this.playerRightProf = new PlayerRight(this);

    this.activePlayerId = this.playerLeft.id;

    this.keyboard = new Keyboard();
    this.physics = new Physics();

    this.hudObj = new HUD(this);

    this.cinematics = new Cinematics(this);

    this.particles = new AtmosphericParticles(this);

    const se = new SpritedEnemy(this);
    se.x = 400;

    // new PauseScreen(this);

    this.bgsprite = new BGSprite(this, this.rendererBigNoWorld.view);

    this.tilemap.processObjects(({ layerName, obj }) => {
      if (layerName === "EnemyLayer") {
        const enemy = new Enemy(this);

        enemy.x = obj.x;
        enemy.y = obj.y;
      }

      if (layerName === "Spikes") {
        const enemy = new Spike(this);

        enemy.x = obj.x;
        enemy.y = obj.y - 32;
      }

      if (layerName === "PhoneLayer") {
        const enemy = new Phone(this);

        enemy.x = obj.x;
        enemy.y = obj.y - 32;
      }

      if (layerName === "TinyWorld") {
        const tw = new TinyWorld(this)

        tw.x = obj.x;
        tw.y = obj.y - 32;
      }
    });

    this.tilemap.load().then(() => {
      this.tilemap.changeSection(this, this.playerLeft, this.cameraLeft);
      this.tilemap.changeSection(this, this.playerRightProf, this.cameraRight);

      this.tilemap.checkRegionValidity(state);

      gameLoop();
    });
  }

  startCoroutine(co: IterableIterator<CoroutineResult>, modes?: Mode[]): number {
    this.coroutines[++this.coroutineId] = {
      fn: co,
      framesLeftToWait: 0,
      modes,
    };

    return this.coroutineId;
  }

  stopCoroutine(id: number): void {
    delete this.coroutines[id];
  }

  private updateCoroutines(): void {
    for (const key in this.coroutines) {
      const co = this.coroutines[key];

      if (co.modes && co.modes.indexOf(this.currentMode) === -1) {
        continue;
      }

      if (co.framesLeftToWait > 0) {
        co.framesLeftToWait--;
        continue;
      }

      const { value, done } = co.fn.next();

      if (done) {
        delete this.coroutines[key];

        continue;
      }

      if (typeof value === "object") {
        co.framesLeftToWait = value.frames;

        continue;
      }
    }
  }

  countEntitiesUnder(container: PIXI.Container): number {
    let result = 1;

    if (!container.children || container.children.length === 0) {
      return result;
    }

    for (const child of container.children) {
      result += this.countEntitiesUnder(child as any);
    }

    return result;
  }

  update(): void {
    const { cinematics, rendererBig, rendererTiny, rendererBigNoWorld, keyboard, cameraLeft, cameraRight, entities, root, currentMode } = state;

    (PIXI.Sprite as any).drawCount = 0;
    (PIXI.Container as any).drawCount = 0;

    keyboard.update();
    cinematics.update(this);
    this.bgsprite.update(this); // oops

    const activeEntities = entities.filter(e => e.activeModes.indexOf(currentMode) !== -1);

    for (const entity of activeEntities) {
      entity.update(state);
    }

    this.updateCoroutines();

    // It's actually important that camera is updated last, so it can be in sync
    // with the rest of the entities in the game. If the player has a screen
    // transition and camera didn't see it, we'd have a frame where the camera
    // was way out of sync.

    // RENDER LEFT

    if (state.leftCamActive) {
      cameraLeft.update(state);

      /*
      if (state.rightCamActive) {
        root.alpha = state.playerLeft.isActive(state) ? 1.0 : 0.3;
        state.playerLeft.sprite.alpha = 1.0;
        state.playerRightProf.sprite.alpha = state.playerLeft.isActive(state) ? 0.3 : 1.0;
      }
      */

      // hide irrelevant entities

      for (const e of entities) {
        if (e instanceof Entity && e.oneCameraOnly !== "no") {
          e.sprite.visible = e.oneCameraOnly === "left";
        }
      }

      state.stage.x = state.cameraLeft.desiredStageX;
      state.stage.y = state.cameraLeft.desiredStageY;

      this.bgsprite.sprite.visible = true;

      rendererBig.render(root);
    }

    // RENDER RIGHT

    if (state.rightCamActive) {
      cameraRight.update(state);

      // hide irrelevant entities

      for (const e of entities) {
        if (e instanceof Entity && e.oneCameraOnly !== "no") {
          e.sprite.visible = e.oneCameraOnly === "right";
        }
      }

      state.stage.x = state.cameraRight.desiredStageX;
      state.stage.y = state.cameraRight.desiredStageY;

      this.bgsprite.sprite.visible = false;

      rendererTiny.render(root);

      TinyWorld.Instance.visible = false;
      rendererBigNoWorld.render(root);
      TinyWorld.Instance.visible = true;

      this.bgsprite.sprite.texture.update();


      console.log((PIXI.Sprite as any).drawCount);
      console.log((PIXI.Container as any).drawCount);
    }
  }
}

let state: StateClass;

function main() {
  const tilemapData = PIXI.loader.resources["tilemap"].data;

  state = new StateClass(tilemapData);
}

function gameLoop(): void {
  requestAnimationFrame(() => gameLoop());

  state.update();

  /*
  stage.children.sort((a, b) => {
    return ((a as any).z || 0) - ((b as any).z || 0);
  });
  */
}

PIXI.loader.load(main);
