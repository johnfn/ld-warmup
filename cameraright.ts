class CameraRight extends Camera {
  isExternallyControlled = false;

  target: Controllable;

  constructor(state: StateClass) {
    super(state);

    // yolo hacks
    setTimeout(() => {
      this.target = state.playerRightProf;
    })
  }

  update(state: StateClass) {
    if (!this.target) { return; }

    if (!this.isExternallyControlled) {
      const destX = this.target.x + this.target.facing * 200;
      const destY = this.target.y;

      this.centerX += (destX - this.centerX) / 60;
      this.centerY += (destY - this.centerY) / 60;

      if (Math.abs(destX - this.centerX) < 1) {
        this.centerX = destX;
      }

      if (Math.abs(destY - this.centerY) < 1) {
        this.centerY = destY;
      }
    }

    super.update(state);
  }
}