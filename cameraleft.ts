class CameraLeft extends Camera {
  update(state: StateClass) {
    const { player } = state;

    this.centerX = player.x;
    this.centerY = player.y;
  }
}