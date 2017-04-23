class Camera extends Base {
  width: number;
  height: number;

  shake: null | { duration: number; strength: number };

  stage: PIXI.Container;

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

    this.stage.x = -value;
  }

  setY(value: number) {
    if (value < this.bounds.y) { value = this.bounds.y; }
    if (value >= this.bounds.bottom - this.height) { value = this.bounds.bottom - this.height; }

    this.stage.y = -value;
  }

  set centerX(value: number) {
    this.setX(value - this.width / 2);
  }

  get centerX(): number {
    return -this.stage.x + this.width / 2;
  }

  set centerY(value: number) {
    this.setY(value - this.height / 2);
  }

  get centerY(): number {
    return -this.stage.y + this.height / 2;
  }

  constructor(state: StateClass) {
    super(state);

    const { width, height, stage } = state;

    this.width = width;
    this.height = height;

    this.stage = stage;

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
}