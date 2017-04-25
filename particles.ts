interface ItemInPool {
  entity: Entity;
  alive: boolean;
}

class Pooler {
  readonly size: number = 100;
  pool: ItemInPool[] = [];
  create: () => Entity;

  constructor(props: {
    create: () => Entity;
    size?: number;
  }) {
    this.size = props.size || 100;
    this.create = props.create;

    for (let i = 0; i < this.size; i++) {
      const newSprite = this.create();

      newSprite.sprite.visible = false;

      this.pool.push({
        alive: false,
        entity: newSprite,
      });
    }
  }

  get(): Entity | undefined {
    for (const obj of this.pool) {
      const { alive, entity } = obj;

      if (alive) { continue; }

      obj.alive = true;
      entity.sprite.visible = true;

      return entity;
    }

    return undefined;
  }

  releaseAll(): void {
    for (const obj of this.pool) {
      obj.alive = false;
      obj.entity.sprite.visible = false;

      if (obj.entity.sprite.parent) {
        obj.entity.sprite.parent.removeChild(obj.entity.sprite);
      }
    }
  }

  release(s: Entity ): void {
    for (const obj of this.pool) {
      if (obj.entity === s) {
        obj.alive = false;

        obj.entity.sprite.visible = false;
      }
    }
  }
}

interface Particle {
  entity: Entity;

  lifespan: number;

  dx: number;
  dy: number;

  rotation: number;

  alpha: number;

  scale: number;
}

interface ParticleBehavior {
  lifespan: NumberOrRange;

  rotation: NumberOrRange;

  tilesheet: string;

  dx: NumberOrRange;
  dy: NumberOrRange;

  x: NumberOrRange;
  y: NumberOrRange;

  scale: NumberOrRange;

  alpha: NumberOrRange;

  dest?: {
    x: number;
    y: number;

    range: number;
  }
}

type NumberOrRange = number | [number, number];

class Particles extends Base {
  pool: Pooler;
  particles: Particle[] = [];
  behavior: ParticleBehavior;
  container: Entity;
  on = true;

  constructor(state: StateClass, behavior: ParticleBehavior = {
    lifespan: [100, 200],
    dx: [-3, 3],
    dy: [-3, 3],
    x: 0,
    y: 0,
    rotation: 1,
    scale: [1, 4],
    alpha: [0.1, 1.0],
    tilesheet: "atmosphere-particle",
  }) {
    super(state);

    this.container = new Entity(state, {
      texture: "nothing",
      depth: Depths.Particles,
    });

    this.behavior = behavior;

    this.pool = new Pooler({
      create: () => {
        const e = new Entity(state, {
          texture: this.behavior.tilesheet,
          parent: this.container.sprite,
        });

        e.sprite.pivot = new PIXI.Point(16, 16);

        return e;
      }
    });
  }

  setBehaviorTo(b: ParticleBehavior): void {
    this.behavior = b;
  }

  getValueFrom(thing: NumberOrRange): number {
    if (Array.isArray(thing)) {
      return Util.RandRange(thing);
    }

    return thing;
  }

  update(_state: StateClass): void {
    if (!this.on) { return; }

    if (Math.random() > 0.75) {
      const ent = this.pool.get();

      if (!ent) { console.log('fail2get particle'); return; }

      let dx = 0, dy = 0;

      // set up particles starting values

      while (dx * dx + dy * dy < 2) {
        dx = this.getValueFrom(this.behavior.dx);
        dy = this.getValueFrom(this.behavior.dy);
      }

      this.particles.push({
        entity: ent,
        lifespan: this.getValueFrom(this.behavior.lifespan),
        rotation: this.getValueFrom(this.behavior.rotation),
        dx,
        dy,
        scale: this.getValueFrom(this.behavior.scale),
        alpha: this.getValueFrom(this.behavior.alpha),
      });

      ent.x = this.getValueFrom(this.behavior.x);
      ent.y = this.getValueFrom(this.behavior.y);
    }

    for (let i = 0; i < this.particles.length; i++) {
      const obj = this.particles[i];

      obj.lifespan--;

      obj.entity.sprite.rotation += obj.rotation;

      if (this.behavior.dest &&
          Util.Dist(obj.entity, this.behavior.dest) < this.behavior.dest.range) {

        const { x: destX, y: destY } = this.behavior.dest;

        obj.dx -= Math.sign(obj.entity.x - destX) / 10;
        obj.dy -= Math.sign(obj.entity.y - destY) / 10;
      }

      obj.entity.x += obj.dx;
      obj.entity.y += obj.dy;

      obj.entity.sprite.scale = new PIXI.Point(obj.scale, obj.scale);
      obj.entity.sprite.alpha = obj.alpha;
    }

    // release & remove dead particles
    this.particles = this.particles.filter(particle => {
      if (particle.lifespan < 0) {
        this.pool.release(particle.entity);

        return false;
      }

      return true;
    });
  }
}