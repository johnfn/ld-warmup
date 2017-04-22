PIXI.loader.add("atmosphere-particle", "assets/particle.png");

class AtmosphericParticles extends Particles {
  behavior: ParticleBehavior = {
    lifespan: [100, 200],

    dx: [-2, 2],
    dy: [-2, 2],

    rotation: [-0.2, 0.2],

    x: 0,
    y: 0,
    tilesheet: "atmosphere-particle",
  };

  constructor(state: StateClass) {
    super(state);

    this.setBehaviorTo(this.behavior);
  }

  update(state: StateClass): void {
    const { cameraLeft } = state;

    this.behavior.x = [ cameraLeft.x, cameraLeft.x + cameraLeft.right ];
    this.behavior.y = [ cameraLeft.y, cameraLeft.y + cameraLeft.height ];

    this.behavior.dest = {
      x: TinyWorld.Instance.x + 16,
      y: TinyWorld.Instance.y + 16,

      range: 200,
    };

    this.setBehaviorTo(this.behavior);

    super.update(state);
  }
}