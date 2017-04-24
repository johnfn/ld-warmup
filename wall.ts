PIXI.loader.add("wall", "assets/wall-normal.png");
PIXI.loader.add("wall-destroyed", "assets/wall-destroyed.png");

class Wall extends Entity {
  ontop: Entity;

  constructor(state: StateClass) {
    super(state, {
      texture: "wall-destroyed",
      parent: state.hud,
      depth: Depths.Wall,
      width: 32,
      height: 600,
    });

    this.x = 0;
    this.y = 0;

    this.ontop = new Entity(state, {
      texture: "wall",
      parent: this.sprite,
      depth: Depths.Wall + 1, // unnecessary lol who cares its 5am
      width: 32,
      height: 600,
    });
  }
}