PIXI.loader.add("phone-tex", "assets/phone.png");

class Phone extends Entity {
  static readonly DistanceAcceptable = 100;

  collideable = true;

  constructor(state: StateClass) {
    super(state, {
      texture: "phone-tex",
      depth: Depths.Phone,
    });
  }
}