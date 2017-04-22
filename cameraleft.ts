class CameraLeft extends Camera {
  update(state: StateClass) {
    const { playerLeft } = state;

    this.centerX = playerLeft.x;
    this.centerY = playerLeft.y;
  }
}