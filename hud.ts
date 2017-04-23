PIXI.loader.add("nothing", "assets/transparent.png");

class HUD extends Entity {
  actionText: TextEntity;

  constructor(state: StateClass) {
    super(state, {
      texture: "nothing",
      parent: state.hud,
    });

    this.actionText = new TextEntity(state, {
      parent: this.sprite,
    });

    this.actionText.x = state.width - 200;
    this.actionText.y = 0;
  }

  update(_state: StateClass) {
    this.actionText.text = "X to Foobar!";
  }
}