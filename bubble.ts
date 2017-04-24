type BubbleType = "sweat" | ":D" | ":|" | "!";

PIXI.loader.add("sweat", "assets/sweat.png");
PIXI.loader.add(":|", "assets/confused.png");
PIXI.loader.add(":D", "assets/happy.png");
PIXI.loader.add("!", "assets/exclamation.png");

class Bubble extends Entity {
  following: Controllable;
  type: BubbleType;

  constructor(state: StateClass, following: Controllable, type: BubbleType) {
    super(state, {
      texture: type,
      depth: Depths.Text,
    });

    this.following = following;
    this.type      = type;
  }

  update(_state: StateClass) {
    this.x = this.following.x;
    this.y = this.following.y - 32;
  }
}