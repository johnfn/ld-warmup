class CameraLeft extends Camera {
  isExternallyControlled = false;

  update(state: StateClass) {
    const { playerLeft } = state;

    if (!this.isExternallyControlled) {
      this.centerX = playerLeft.x;
      this.centerY = playerLeft.y;
    }

    if (this.shouldShake()) {
      this.centerX += Math.random() * 4 - 2;
      this.centerY += Math.random() * 4 - 2;
    }

    super.update(state);
  }

  shouldShake(): boolean {
    const { playerLeft: you } = state;

    if (Util.Dist(you, TinyWorld.Instance) < 200) {
      return true;
    }

    return false;
  }

  *panTo(point: IPoint) {
    while (Util.Dist({ x: this.centerX, y: this.centerY }, point) > 30) {
      this.centerX -= (this.centerX - point.x) / 40;
      this.centerY -= (this.centerY - point.y) / 40;

      yield "next";
    }
  }
}