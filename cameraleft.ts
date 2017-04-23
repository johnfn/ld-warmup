class CameraLeft extends Camera {
  isExternallyControlled = false;

  update(state: StateClass) {
    const { playerLeft } = state;

    if (!this.isExternallyControlled) {
      const destX = playerLeft.x + playerLeft.facing * 200;
      const destY = playerLeft.y;

      if (Math.abs(destX - this.centerX) < 5) {
        this.centerX = destX;
      }

      if (Math.abs(destY - this.centerY) < 5) {
        this.centerY = destY;
      }

      this.centerX += (destX - this.centerX) / 60;
      this.centerY += (destY - this.centerY) / 60;
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