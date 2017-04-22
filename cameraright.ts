class CameraRight extends Camera {
  update(state: StateClass) {
    const { playerRightProf } = state;

    this.centerX = playerRightProf.x;
    this.centerY = playerRightProf.y;
  }
}