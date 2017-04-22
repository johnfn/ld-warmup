interface ItemInPool {
  entity: Entity;
  alive: boolean;
}

class Pooler {
  readonly size = 100;
  pool: ItemInPool[] = [];
  create: () => Entity;

  constructor(props: {
    create: () => Entity;
  }) {
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
}

interface ParticleBehavior {
  lifespan: NumberOrRange;

  rotation: NumberOrRange;

  dx: NumberOrRange;
  dy: NumberOrRange;

  x: NumberOrRange;
  y: NumberOrRange;

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

  constructor(state: StateClass, behavior: ParticleBehavior = {
    lifespan: [100, 200],
    dx: [-3, 3],
    dy: [-3, 3],
    x: 0,
    y: 0,
    rotation: 1,
  }) {
    super(state);

    this.behavior = behavior;

    this.pool = new Pooler({
      create: () => {
        const e = new Entity(state, {
          texture: "tinyworld",
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
    if (Math.random() > 0.9) {
      const ent = this.pool.get();

      if (!ent) { console.log('fail2get particle'); return; }

      let dx = 0, dy = 0;

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