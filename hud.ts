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

  update(state: StateClass) {
    const activePlayer = state.getActivePlayer();
    const inspectRegions = state.tilemap.regionLayers.InspectRegions.regions;
    let text = "";

    for (const { region, properties } of inspectRegions) {
      if (region.contains(activePlayer)) {
        text = "X to Inspect!";
      }
    }

    if (activePlayer.canPickUpWorld) {
      if (TinyWorld.Instance.canBePickedUp(activePlayer)) {
        text = "X to pick up world!"
      }
    }

    this.actionText.text = text;
  }
}