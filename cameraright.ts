class CameraRight extends Camera {
  update(state: StateClass) {
    const { playerRightProf } = state;

    const destX = playerRightProf.x + playerRightProf.facing * 200;
    const destY = playerRightProf.y;

    this.centerX += (destX - this.centerX) / 60;
    this.centerY += (destY - this.centerY) / 60;

    if (Math.abs(destX - this.centerX) < 1) {
      this.centerX = destX;
    }

    if (Math.abs(destY - this.centerY) < 1) {
      this.centerY = destY;
    }

    super.update(state);
  }
}