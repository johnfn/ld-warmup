PIXI.loader.add("black", "assets/black.png");
PIXI.loader.add("white", "assets/white.png");

class FadeOutIn extends Entity {
  constructor(state: StateClass, side: "left" | "right") {
    super(state, {
      texture: "black",
      depth: Depths.Fade,
    });

    this.sprite.alpha = 0;
    this.oneCameraOnly = side;
  }

  *doFadeOut(_state: StateClass) {
    this.x = 0;
    this.y = 0;
    this.sprite.width = 100000;
    this.sprite.height = 100000;

    for (let i = 0; i <= 60; i++) {
      yield "next";

      this.sprite.alpha = i / 60;
    }
  }

  *doFadeIn(_state: StateClass) {
    this.x = 0;
    this.y = 0;
    this.sprite.width = 100000;
    this.sprite.height = 100000;

    for (let i = 0; i <= 60; i++) {
      yield "next";

      this.sprite.alpha = (60 - i) / 60;
    }
  }
}