class CameraLeft extends Camera {
  isExternallyControlled = false;

  update(state: StateClass) {
    const { playerLeft } = state;

    if (!this.isExternallyControlled) {
      this.centerX = playerLeft.x;
      this.centerY = playerLeft.y;
    }
  }

  *panTo(point: IPoint) {
    while (Util.Dist({ x: this.centerX, y: this.centerY }, point) > 30) {
      this.centerX -= (this.centerX - point.x) / 40;
      this.centerY -= (this.centerY - point.y) / 40;

      yield "next";
    }
  }
}