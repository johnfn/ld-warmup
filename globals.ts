class G {
  static Gravity = 0.2;
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
}