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
}

interface ParticleBehavior {
  lifespan: NumberOrRange;
}

type NumberOrRange = number | [number, number];

class Particles extends Base {
  pool: Pooler;
  particles: Particle[] = [];
  behavior: ParticleBehavior;

  constructor(state: StateClass, behavior: ParticleBehavior = {
    lifespan: [10, 20],
  }) {
    super(state);

    this.behavior = behavior;

    this.pool = new Pooler({
      create: () => {
        return new Entity(state, {
          texture: "tinyworld",
        });
      }
    });
  }

  getValueFrom(thing: NumberOrRange): number {
    if (Array.isArray(thing)) {
      return Util.RandRange(thing);
    }

    return thing;
  }

  update(state: StateClass): void {
    const pos = state.getActivePlayer();

    if (Math.random() > 0.9) {
      const ent = this.pool.get();

      if (!ent) { console.log('fail2get particle'); return; }

      this.particles.push({
        entity: ent,
        lifespan: this.getValueFrom(this.behavior.lifespan),
      });

      ent.x = pos.x;
      ent.y = pos.y;
    }

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      particle.lifespan--;

      particle.entity.x += 1;
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