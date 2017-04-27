interface TiledTileLayerJSON {
  data: number[];
  name: string;
  opacity: number;
  visible: boolean;
  height: number;
  width: number;
  x: number;
  y: number;

  type: "tilelayer";
}

interface TiledObjectJSON {
  gid?: number;
  properties?: { [key: string]: string; };
  height: number;
  id: number;
  name: string;
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
}

interface TiledObjectLayerJSON {
  draworder: "topdown";
  height: number;
  name: string;
  objects: TiledObjectJSON[];
  opacity: number;
  visible: boolean;
  width: number;
  x: number;
  y: number;

  type: "objectgroup";
}

interface TilesetJSON {
  columns: number;
  firstgid: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  margin: number;
  name: string;
  spacing: number;
  tilecount: number;
  tileheight: number;
  tilewidth: number;
}

interface TiledJSON {
  height: number;
  width : number;
  nextobjectid: number;
  orientation: "orthogonal";
  renderorder: "right-down";
  tileheight: number;
  tilewidth: number;
  version: number;

  layers: (TiledTileLayerJSON | TiledObjectLayerJSON)[];
  tilesets: TilesetJSON[];
}

interface Tile {
  x: number;
  y: number;

  tile: SpritesheetTile;
  layername: string;
}

function isTile(x: any): x is Tile {
  return x.tile && x.layername && typeof x.x === "number" && typeof x.y === "number";
}

interface Tileset {
  gidStart: number;
  gidEnd: number;

  name: string;
  image: string;

  imagewidth: number;
  imageheight: number;
  tilewidth: number;
  tileheight: number;
}

interface TiledObject {
  tile: SpritesheetTile;

  properties?: { [key: string]: string; };

  height: number;
  width: number;

  x: number;
  y: number;
}

interface SpritesheetTile {
  name: string;
  spritesheetx: number;
  spritesheety: number;
  tilewidth: number;
  tileheight: number
}

interface TiledRegion {
  region: Rect;
  properties?: { [key: string]: any; };
}

interface RegionLayer {
  regions: TiledRegion[];
}

interface ObjectLayer {
  objects: TiledObject[];
}

PIXI.loader.add("tilemap", "assets/tiled2.json");
class TiledTilemap<SpriteLayers, RegionLayers, ObjectLayers> {
  private data: TiledJSON;

  private tilesets: Tileset[];
  private tiles: Tile[][][];

  private currentRegion: { [key: number]: Rect } = {};

  private tilePool: Pooler;

  spriteLayers: { [key in keyof SpriteLayers]: PIXI.Container } = {} as any;
  regionLayers: { [key in keyof RegionLayers]: RegionLayer } = {} as any;
  objectLayers: { [key in keyof ObjectLayers]: ObjectLayer } = {} as any;

  entities: Entity[];

  constructor(state: StateClass, from: TiledJSON) {
    this.data = from;

    this.tilePool = new Pooler({
      size: 3000,

      create: () => {
        const e = new Entity(state, {
          dontRegister: true,
          texture: "nothing",
          parent: "none",
        });

        return e;
      }
    })

    this.loadMap();
  }

  async load(): Promise<void> {
    for (const { image, name } of this.data.tilesets) {
      PIXI.loader.add(name, `./assets/${ image }`);
    }

    await new Promise((resolve, _reject) => {
      PIXI.loader.load(resolve);
    });
  }

  processObjects(fn: (obj: { layerName: string; obj: TiledObject }) => void): void {
    for (const key in this.objectLayers) {
      const layer = this.objectLayers[key];

      for (const obj of layer.objects) {
        fn({ layerName: key, obj, });
      }
    }
  }

  getRegionFor(point: { x: number, y: number }): Rect {
    const newRegionCandidates = this.regionLayers["Camera Regions"].regions.filter(r => {
      return r.region.contains({ x: point.x, y: point.y });
    });

    if (newRegionCandidates.length === 0) {
      throw new Error("No region found for player!");
    }

    if (newRegionCandidates.length > 1) {
      throw new Error("Overlapping regions!");
    }

    return newRegionCandidates[0].region;
  }

  changeSection(state: StateClass, who: Entity, cam: Camera): void {
    const newRegion = this.getRegionFor(who);

    if (newRegion === this.currentRegion[cam.id]) { return; }

    this.currentRegion[cam.id] = newRegion;

    this.removeAllSprites(state);
    this.displayMap(state);

    cam.bounds = new Rect({ x: newRegion.x, y: newRegion.y, w: newRegion.w, h: newRegion.h, });
  }

  private removeAllSprites(state: StateClass): void {
    this.tilePool.releaseAll();
  }

  private loadTilesets(): void {
    const tilesets: Tileset[] = [];

    for (const { image, name, firstgid, imageheight, imagewidth, tileheight, tilewidth } of this.data.tilesets) {
      const tiles = (imageheight * imagewidth) / (tileheight * tilewidth);

      tilesets.push({
        gidStart: firstgid,
        gidEnd: firstgid + tiles,
        name,
        image,
        imagewidth,
        imageheight,
        tilewidth,
        tileheight,
      });
    }

    this.tilesets = tilesets;
  }

  private gidToTileset(gid: number): SpritesheetTile {
    for (const { gidStart, gidEnd, name, imagewidth, tilewidth, tileheight } of this.tilesets) {
      if (gid >= gidStart && gid < gidEnd) {
        const normalizedGid = gid - gidStart;
        const tilesWide = imagewidth / tilewidth;

        const x = (normalizedGid % tilesWide);
        const y = Math.floor(normalizedGid / tilesWide);

        return {
          name,
          spritesheetx: x,
          spritesheety: y,
          tilewidth,
          tileheight,
        };
      }
    }

    throw new Error("gid out of range. very bad?!?");
  }

  private loadTiles(): void {
    const tiles: Tile[][][] = [];

    for (let i = 0; i < this.data.width; i++) {
      tiles[i] = [];

      for (let j = 0; j < this.data.height; j++) {
        tiles[i][j] = [];
      }
    }

    for (const layer of this.data.layers) {
      if (layer.type !== "tilelayer") { continue; }

      const { data, width, name: layername } = layer;

      for (let idx = 0; idx < data.length; idx++) {
        const value = data[idx];

        if (value === 0) { continue; } // empty
        if (value > 200000) { continue; } // tiled bug ?

        const x = (idx % width);
        const y = Math.floor(idx / width);

        tiles[x][y].push({
          x: x * this.data.tilewidth,
          y: y * this.data.tileheight,
          tile: this.gidToTileset(value),
          layername: layername,
        });
      }
    }

    this.tiles = tiles;
  }

  private addTileSprites(state: StateClass, region: Rect): void {
    const { stage } = state;

    for (const layer of this.data.layers) {
      if (this.spriteLayers[layer.name]) { continue; }

      const container = new PIXI.Container();

      (container as any).z = (Depths as any)[layer.name] || 0 ;

      this.spriteLayers[layer.name] = container;
      stage.addChild(container);
    }

    if (!region) { throw new Error("tried to add tile sprites w/o current region"); }

    Util.SortDepths(stage);

    const tw = this.data.tilewidth;
    const th = this.data.tileheight;

    for (let i = region.x / tw; i <= region.right / tw; i++) {
      for (let j = region.y / th; j <= region.bottom / th; j++) {
        if (!this.tiles[i][j]) { continue; }

        for (const tile of this.tiles[i][j]) {
          const {
            x,
            y,
            layername,
            tile: {
              name: spritesheet,
              spritesheetx,
              spritesheety,
            }
          } = tile;

          const ent = this.tilePool.get();

          if (!ent) { return; }

          ent.sprite.texture = ent.getCachedSpritesheetTexture(state, spritesheet, spritesheetx, spritesheety);
          if (ent.sprite.parent) {
            ent.sprite.parent.removeChild(ent.sprite);
          }

          this.spriteLayers[layername].addChild(ent.sprite);

          ent.x = x;
          ent.y = y;

          /*
          const sprite = new Entity(state, {
            texture: spritesheet,
            dontRegister: true,
            spritesheet: { x: spritesheetx, y: spritesheety, },
            parent: this.spriteLayers[layername],
          });

          sprite.x = x;
          sprite.y = y;
          */
        }
      }
    }
  }

  private loadObjects(): void {
    for (const layer of this.data.layers) {
      if (layer.type !== "objectgroup") { continue; }

      if (layer.name.toUpperCase().indexOf("REGION") !== -1) {
        this.loadRegionLayer(layer);
      } else {
        this.loadObjectLayer(layer);
      }
    }
  }

  private loadRegionLayer(layer: TiledObjectLayerJSON): void {
    const result: RegionLayer = {
      regions: layer.objects.map(obj => {
        return {
          properties: obj.properties,
          region: new Rect({
            x: obj.x,
            y: obj.y,
            w: obj.width,
            h: obj.height,
          }),
        };
      }),
    };

    this.regionLayers[layer.name] = result;
  }

  private loadObjectLayer(layer: TiledObjectLayerJSON): void {
    const objects: TiledObject[] = [];

    for (const obj of layer.objects) {
      if (!obj.gid) { continue; }

      objects.push({
        tile: this.gidToTileset(obj.gid),

        properties: obj.properties,

        height: obj.height,
        width: obj.width,
        x: obj.x,
        y: obj.y,
      });
    }

    this.objectLayers[layer.name] = {
      objects,
    }
  }

  loadMap(): void {
    this.loadTilesets();
    this.loadTiles();
    this.loadObjects();
  }

  deduplicatedRegions(): Rect[] {
    const dedupedRegions: Rect[] = [];

    for (const key in this.currentRegion) {
      const region = this.currentRegion[key];

      if (dedupedRegions.indexOf(region) === -1) {
        dedupedRegions.push(region);
      }
    }

    return dedupedRegions;
  }

  displayMap(state: StateClass): void {
    for (const region of this.deduplicatedRegions()) {
      this.addTileSprites(state, region);
    }
  }

  checkRegionValidity(state: StateClass): void {
    for (const { region } of this.regionLayers["Camera Regions"].regions) {
      if (region.w < state.width || region.h < state.height) {
        console.error("Bad size for camera region!")
        console.error(region);
      }
    }
  }

  hitTest(p: Point): HitTestResult {
    const tileX = Math.floor(p.x / this.data.tilewidth);
    const tileY = Math.floor(p.y / this.data.tileheight);

    if (tileX < 0 || tileX >= this.data.width || tileY < 0 || tileY >= this.data.height) {
      return [];
    }

    return this.tiles[tileX][tileY].slice(0);
  }

  contains(e: Entity, cam: Camera): boolean {
    const region = this.currentRegion[cam.id];

    if (!region) { return false; }

    return e.x > region.x &&
           e.y > region.y &&
           e.x + e.width  < region.right &&
           e.y + e.height < region.bottom;
  }
}