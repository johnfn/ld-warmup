PIXI.loader.add("atmosphere-particle", "assets/particle.png");

class AtmosphericParticles extends Particles {
  camera: Camera;
  behavior: ParticleBehavior = {
    lifespan: [100, 200],

    dx: [-2, 2],
    dy: [-2, 2],

    rotation: [-0.2, 0.2],

    scale: [1.0, 2.0],
    alpha: [0.1, 1.0],

    x: 0,
    y: 0,
    tilesheet: "atmosphere-particle",
  };

  constructor(state: StateClass, associatedCamera: Camera) {
    super(state);

    this.camera = associatedCamera;
    this.setBehaviorTo(this.behavior);
  }

  update(state: StateClass): void {
    this.behavior.x = [ this.camera.x, this.camera.x + this.camera.right ];
    this.behavior.y = [ this.camera.y, this.camera.y + this.camera.height ];

    this.behavior.dest = {
      x: TinyWorld.Instance.x + 16,
      y: TinyWorld.Instance.y + 16,

      range: 200,
    };

    this.setBehaviorTo(this.behavior);

    super.update(state);
  }
}