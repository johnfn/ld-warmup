type HitTestResult = (Tile | Entity)[];
type MoveResult = {
  hit: boolean;

  thingsHit: HitTestResult;

  hitUp: boolean;
  hitLeft: boolean;
  hitRight: boolean;
  hitDown: boolean;
}

class Physics {
  hitTestPoint(state: StateClass, point: Point): HitTestResult {
    const { tilemap } = state;
    const { x, y } = point;

    let results = tilemap.hitTest(point);

    for (const e of state.entities) {
      if (!(e instanceof Entity)) { continue; }
      if (!e.collideable) { continue; }

      if (x >= e.x && x < e.x + e.width && y >= e.y && y < e.y + e.height) {
        results.push(e);
      }
    }

    return results;
  }

  hitTestSprite(state: StateClass, point: Point, wh: Point): HitTestResult {
    const topLeft = new Point({ x: point.x, y: point.y });
    const pointsToTest = [
      topLeft.add(new Point({ x: 0       , y: 0 })),
      topLeft.add(new Point({ x: wh.x - 4, y: 0 })),
      topLeft.add(new Point({ x: 0       , y: wh.y  - 4})),
      topLeft.add(new Point({ x: wh.x - 4, y: wh.y  - 4})),
    ];

    let tiles: HitTestResult = [];

    for (const point of pointsToTest) {
      tiles = tiles.concat(this.hitTestPoint(state, point));
    }

    return tiles;
  }

  isCollision(res: HitTestResult, entity: Entity): boolean {
    for (const thing of res) {

      if (isTile(thing)) {
        if (thing.layername === "Walls") {
          return true;
        }
      } else if (thing instanceof Entity) {
        if (thing === entity) {
          // no self collisions!

          continue;
        }

        return true;
      }
    }

    return false;
  }

  move(state: StateClass, entity: Entity, dx: number, dy: number): MoveResult {
    const newX = entity.x + dx;
    const newY = entity.y + dy;

    let hit  = false;
    let hitX = false;
    let hitY = false;

    const wh = new Point({ x: entity.width, y: entity.height });
    const thingsHit = this.hitTestSprite(state, new Point({ x: newX, y: newY }), wh);

    if (!this.isCollision(thingsHit, entity)) {
      entity.x = newX;
      entity.y = newY;
    } else {
      hit  = true;
      hitX = true;
      hitY = true;

      if (!this.isCollision(this.hitTestSprite(state, new Point({ x: entity.x, y: newY }), wh), entity)) {
        entity.y = newY;
        hitY   = false;
      }

      if (!this.isCollision(this.hitTestSprite(state, new Point({ x: newX, y: entity.y }), wh), entity)) {
        entity.x = newX;
        hitX   = false;
      }
    }

    return {
      hit,
      thingsHit,

      hitUp   : hitY && dy < 0,
      hitDown : hitY && dy > 0,
      hitLeft : hitX && dx < 0,
      hitRight: hitX && dx > 0,
    };
  }
}