class G {
  static Gravity = 0.2;
  static Debug = true;
}

class Util {
  static Dist(one: { x: number, y: number }, two: { x: number, y: number }): number {
    return Math.sqrt(
      Math.pow(one.x - two.x, 2) + Math.pow(one.y - two.y, 2)
    );
  }

  static RandElement<T>(arr: T[]): T {
    return arr[Math.floor(arr.length * Math.random())];
  }

  static RandRange(range: [number, number]): number {
    const [low, high] = range;

    return low + Math.floor(Math.random() * (high - low));
  }

  static minBy<T>(list: T[], fn: (T: T) => number): T | undefined {
    let lowestT    : T | undefined = undefined;
    let lowestValue: number | undefined = undefined;

    for (const item of list) {
      const value = fn(item);

      if (lowestValue === undefined || value < lowestValue) {
        lowestT = item;
        lowestValue = value;
      }
    }

    return lowestT;
  }

  static maxBy<T>(list: T[], fn: (T: T) => number): T | undefined {
    let highestT    : T | undefined = undefined;
    let highestValue: number | undefined = undefined;

    for (const item of list) {
      const value = fn(item);

      if (highestValue === undefined || value > highestValue) {
        highestT = item;
        highestValue = value;
      }
    }

    return highestT;
  }

  static SortDepths(x: PIXI.Container): void {
    x.children.sort((a, b) => {
      return ((a as any).z || 0) - ((b as any).z || 0);
    });
  }
}


  (function () {
    // PIXI.Sprite

    PIXI.Sprite.drawCount = 0;

    PIXI.Sprite.prototype.__renderWebGL = PIXI.Sprite.prototype._renderWebGL;
    PIXI.Sprite.prototype._renderWebGL = function (renderer) {
      PIXI.Sprite.drawCount++;
      this.__renderWebGL(renderer);
    };


    PIXI.Sprite.prototype.__renderCanvas = PIXI.Sprite.prototype._renderCanvas;
    PIXI.Sprite.prototype._renderCanvas = function (renderer) {
      PIXI.Sprite.drawCount++;
      this.__renderCanvas(renderer);
    };


    // PIXI.Container

    PIXI.Container.drawCount = 0;

    PIXI.Container.prototype.__renderWebGL = PIXI.Container.prototype._renderWebGL;
    PIXI.Container.prototype._renderWebGL = function (renderer) {
      PIXI.Container.drawCount++;
      this.__renderWebGL(renderer);
    };


    PIXI.Container.prototype.__renderCanvas = PIXI.Container.prototype._renderCanvas;
    PIXI.Container.prototype._renderCanvas = function (renderer) {
      PIXI.Container.drawCount++;
      this.__renderCanvas(renderer);
    };


  })();