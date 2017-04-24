class Camera extends Base {
  width: number;
  height: number;

  shake: null | { duration: number; strength: number };

  desiredStageX = 0;
  desiredStageY = 0;

  bounds: Rect;

  id: number;

  static cameras = 0;

  get x(): number {
    return this.centerX - this.width / 2;
  }

  get right(): number {
    return this.centerX + this.width / 2;
  }

  get y(): number {
    return this.centerY - this.height / 2;
  }

  get bottom(): number {
    return this.centerY + this.height / 2;
  }

  setX(value: number) {
    if (value < this.bounds.x) { value = this.bounds.x; }
    if (value >= this.bounds.right - this.width) { value = this.bounds.right - this.width; }

    this.desiredStageX = -value;
  }

  setY(value: number) {
    if (value < this.bounds.y) { value = this.bounds.y; }
    if (value >= this.bounds.bottom - this.height) { value = this.bounds.bottom - this.height; }

    this.desiredStageY = -value;
  }

  set centerX(value: number) {
    this.setX(value - this.width / 2);
  }

  get centerX(): number {
    return -this.desiredStageX + this.width / 2;
  }

  set centerY(value: number) {
    this.setY(value - this.height / 2);
  }

  get centerY(): number {
    return -this.desiredStageY + this.height / 2;
  }

  constructor(state: StateClass) {
    super(state);

    const { width, height } = state;

    this.width = width;
    this.height = height;

    this.id = ++Camera.cameras;
  }

  update(_state: StateClass) {
    if (this.shake) {
      const { strength } = this.shake;

      this.shake.duration--;

      this.centerX += Math.random() * strength - strength / 2;
      this.centerY += Math.random() * strength - strength / 2;

      if (this.shake.duration <= 0) {
        this.shake = null;
      }
    }
  }

  *panTo(point: IPoint) {
    let i = 0;

    while (Util.Dist({ x: this.centerX, y: this.centerY }, point) > 30) {
      this.centerX -= (this.centerX - point.x) / 40;
      this.centerY -= (this.centerY - point.y) / 40;

      yield "next";

      if (++i > 60) { return; } // i give up on this bug
    }
  }
}