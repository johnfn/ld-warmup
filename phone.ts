PIXI.loader.add("phone-tex", "assets/phone.png");

class Phone extends Entity {
  collideable = true;

  constructor(state: StateClass) {
    super(state, {
      texture: "phone-tex",
      depth: Depths.Phone,
    });
  }
}