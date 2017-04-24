PIXI.loader.add("nothing", "assets/transparent.png");

class HUD extends Entity {
  actionText: TextEntity;
  dlgText: TextEntity;

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

    this.dlgText = new TextEntity(state, {
      parent: this.sprite,
    });

    this.dlgText.x = state.width - 200;
    this.dlgText.y = 40;
  }

  update(state: StateClass) {
    const { cinematics } = state;
    const activePlayer = state.getActivePlayer();
    const inspectRegions = state.tilemap.regionLayers.InspectRegions.regions;
    let text = "";

    // X icon

    for (const { region, properties: _p } of inspectRegions) {
      if (region.contains(activePlayer)) {
        text = "X to Inspect!";
      }
    }

    if (activePlayer.canPickUpWorld) {
      if (TinyWorld.Instance.canBePickedUp(activePlayer)) {
        text = "X to pick up world!"
      }

      if (TinyWorld.Instance.isBeingCarried) {
        text = "X + Arrows to toss!"
      }
    }

    const phones = state.entities.filter(x => x instanceof Phone) as Phone[];
    const closestPhone = Util.minBy(phones, p => Util.Dist(p, activePlayer))!;

    if (Util.Dist(activePlayer, closestPhone) < 200) {
      text = "X to use phone!"
    }

    this.actionText.text = text;

    // Z icon

    if (cinematics.zForDialog) {
      this.dlgText.text = "Z to continue dialog";

      if (text === "") {
        this.dlgText.y = 0;
      } else {
        this.dlgText.y = 40;
      }
    } else {
      this.dlgText.text = "";
    }
  }
}