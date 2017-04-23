PIXI.loader.add("scope", "assets/scope.png");

class Scope extends Entity {
  constructor(state: StateClass, parent: PIXI.Container) {
    super(state, {
      texture: "scope",
      parent,
    });

    this.sprite.pivot.x = 16;
    this.sprite.pivot.y = 16;
  }

  update(_state: StateClass): void {
    super.update(_state);

    this.sprite.rotation += 0.05;
  }
}