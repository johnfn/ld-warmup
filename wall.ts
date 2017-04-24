PIXI.loader.add("wall", "assets/wall-normal.png");
PIXI.loader.add("wall-destroyed", "assets/wall-destroyed.png");

class Wall extends Entity {
  constructor(state: StateClass) {
    super(state, {
      texture: "wall",
      parent: state.hud,
      depth: Depths.Wall,
      width: 32,
      height: 600,
    });

    this.x = 0;
    this.y = 0;
  }
}