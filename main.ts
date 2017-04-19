const renderer = PIXI.autoDetectRenderer(800, 600, { antialias: false, transparent: false, resolution: 1 });
document.body.appendChild(renderer.view);

const stage = new PIXI.Container();

const spriteNames = {
  "assets/sprite.png": true,
};

PIXI.loader
  .add("sprite", "assets/sprite.png")
  .add("testing", "assets/tilesheet.png")
  .add("tilemap", "assets/tiled.json")
  .load(main);

function main() {
  const sprite = new PIXI.Sprite(
    PIXI.loader.resources["sprite"].texture
  );

  stage.addChild(sprite);

  const tilemap = PIXI.loader.resources["tilemap"].data;

  new TiledTilemap(tilemap)
}

interface TiledLayerJSON {
  data: number[];
  name: string;
  opacity: number;
  type: "tilelayer";
  visible: boolean;

  height: number;
  width: number;

  x: number;
  y: number;
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

  layers: TiledLayerJSON[];
  tilesets: TilesetJSON[];
}

interface Tile {
  x: number;
  y: number;

  spritesheet: string;
  spritesheetx: number;
  spritesheety: number;
  tilewidth: number;
  tileheight: number;
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

class TiledTilemap {
  data: TiledJSON;

  tilesets: Tileset[];
  tiles: Tile[];

  constructor(from: TiledJSON) {
    this.data = from;

    for (const { image, name } of from.tilesets) {
      PIXI.loader.add(name, `./assets/${ image }`);
    }

    PIXI.loader.load(() => this.loadMap());
  }

  loadTilesets(): void {
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

  gidToTileset(gid: number): { name: string; spritesheetx: number; spritesheety: number; tilewidth: number; tileheight: number } {
    for (const { gidStart, gidEnd, name, imagewidth, tilewidth, tileheight } of this.tilesets) {
      if (gid >= gidStart && gid < gidEnd) {
        const normalizedGid = gid - gidStart;
        const tilesWide = imagewidth / tilewidth;

        const x = (normalizedGid % tilesWide);
        const y = Math.floor(normalizedGid / tilesWide);

        return {
          name,
          spritesheetx: x * tilewidth,
          spritesheety: y * tileheight,
          tilewidth,
          tileheight,
        };
      }
    }

    throw new Error("gid out of range. very bad?!?");
  }

  loadTiles(): void {
    const tiles: Tile[] = [];

    for (const { data, width } of this.data.layers) {
      for (let idx = 0; idx < data.length; idx++) {
        const value = data[idx];

        if (value === 0) { continue; } // empty

        const {
          name,
          spritesheetx,
          spritesheety,
          tilewidth,
          tileheight,
        } = this.gidToTileset(value);

        const x = (idx % width) * tilewidth;
        const y = Math.floor(idx / width) * tileheight;

        tiles.push({
          x,
          y,
          spritesheet: name,
          spritesheetx,
          spritesheety,
          tilewidth,
          tileheight,
        });
      }
    }

    this.tiles = tiles;
  }

  addTiles(): void {
    for (const { x, y, spritesheet, spritesheetx, spritesheety, tilewidth, tileheight } of this.tiles) {
      const texture = PIXI.loader.resources[spritesheet].texture;
      const rect = new PIXI.Rectangle(spritesheetx, spritesheety, tilewidth, tileheight);

      texture.frame = rect;

      const sprite = new PIXI.Sprite(texture);

      sprite.x = x;
      sprite.y = y;

      stage.addChild(sprite);
    }
  }

  loadMap(): void {
    this.loadTilesets();
    this.loadTiles();

    this.addTiles();

    renderer.render(stage);
  }
}