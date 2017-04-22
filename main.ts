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
  }, {
    // Regions

    "Camera Regions": true,
  }, {
    // Objects
    ObjLayer: true,
  }>;

  rendererBig: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
  rendererTiny: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
  playerLeft: PlayerLeft;
  playerRight: PlayerRight;

  keyboard: Keyboard;
  physics: Physics;
  cinematics: Cinematics;
  cameraLeft: CameraLeft;
  cameraRight: CameraRight;

  rightCamActive = false;

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

  drawCallText: TextEntity;

  constructor(data: TiledJSON) {
    this.rendererBig = PIXI.autoDetectRenderer(this.width, this.height, {
      antialias: false,
      transparent: false,
      resolution: 1
    });
    document.body.appendChild(this.rendererBig.view);

    this.rendererTiny = PIXI.autoDetectRenderer(this.width, this.height, {
      antialias: false,
      transparent: false,
      resolution: 1
    });
    document.body.appendChild(this.rendererTiny.view);

    this.entities = [];

    this.stage = new PIXI.Container();
    this.hud = new PIXI.Container();

    this.root = new PIXI.Container();

    this.root.addChild(this.stage);
    this.root.addChild(this.hud);

    this.drawCallText = new TextEntity(this, { parent: this.hud });

    this.drawCallText.x = this.width - 100;
    this.drawCallText.y = 0;

    this.cameraLeft = new CameraLeft(this);
    this.cameraRight = new CameraRight(this);

    this.tilemap = new TiledTilemap(data) as any;
    this.playerLeft = new PlayerLeft(this);
    this.playerRight = new PlayerRight(this);

    this.activePlayerId = this.playerLeft.id;

    this.keyboard = new Keyboard();
    this.physics = new Physics();

    this.cinematics = new Cinematics(this);

    const se = new SpritedEnemy(this);
    se.x = 400;

    new PauseScreen(this);

    const tt = new TextEntity(this);
    tt.x = 400;
    tt.y = 400;

    tt.text = "Foo Bar.";

    this.tilemap.processObjects(({ layerName, obj }) => {
      if (layerName === "EnemyLayer") {
        const enemy = new Enemy(this);

        enemy.x = obj.x;
        enemy.y = obj.y;
      }
    });

    this.tilemap.load().then(() => {
      this.tilemap.changeSection(this, this.playerLeft, this.cameraLeft);
      this.tilemap.changeSection(this, this.playerRight, this.cameraRight);

      this.tilemap.displayMap(state, this.cameraLeft);
      this.tilemap.displayMap(state, this.cameraRight);

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

  private countEntitiesUnder(container: PIXI.Container): number {
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
    const { cinematics, rendererBig, rendererTiny, keyboard, cameraLeft, cameraRight, entities, root, currentMode } = state;

    keyboard.update();
    cinematics.update(this);

    const activeEntities = entities.filter(e => e.activeModes.indexOf(currentMode) !== -1);

    for (const entity of activeEntities) {
      entity.update(state);
    }

    this.updateCoroutines();

    this.drawCallText.text = String(this.countEntitiesUnder(this.stage));

    // It's actually important that camera is updated last, so it can be in sync
    // with the rest of the entities in the game. If the player has a screen
    // transition and camera didn't see it, we'd have a frame where the camera
    // was way out of sync.

    cameraLeft.update(state);

    if (state.rightCamActive) {
      root.alpha = state.playerLeft.isActive(state) ? 1.0 : 0.3;
      state.playerLeft.sprite.alpha = 1.0;
      state.playerRight.sprite.alpha = state.playerLeft.isActive(state) ? 0.3 : 1.0;
    }

    rendererBig.render(root);

    if (state.rightCamActive) {
      cameraRight.update(state);
      root.alpha = state.playerRight.isActive(state) ? 1.0 : 0.3;
      state.playerRight.sprite.alpha = 1.0;
      state.playerLeft.sprite.alpha = state.playerRight.isActive(state) ? 0.3 : 1.0;
      rendererTiny.render(root);
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
