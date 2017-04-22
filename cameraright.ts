class CameraRight extends Camera {
  update(state: StateClass) {
    const { playerRight } = state;

    this.centerX = playerRight.x;
    this.centerY = playerRight.y;
  }
}