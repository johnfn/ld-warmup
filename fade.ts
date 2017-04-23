PIXI.loader.add("black", "assets/black.png");

class FadeOutIn extends Entity {
  constructor(state: StateClass, side: "left" | "right") {
    super(state, { texture: "black" });

    this.sprite.alpha = 0;

    this.oneCameraOnly = side;
    this.startCoroutine(state, this.doFadeOut(state));
  }

  *doFadeOut(_state: StateClass) {
    /*
    this.x = 0;
    this.y = 0;
    this.sprite.width = 10000;
    this.sprite.height = 10000;

    for (let i = 0; i <= 60; i++) {
      yield "next";
      this.sprite.alpha = i / 60;
    }
    */
  }
}