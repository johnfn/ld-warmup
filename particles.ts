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
}

class Particles extends Base {
  pool: Pooler;
  particles: Particle[] = [];

  constructor(state: StateClass) {
    super(state);

    this.pool = new Pooler({
      create: () => {
        return new Entity(state, {
          texture: "tinyworld",
        });
      }
    });
  }

  update(state: StateClass): void {
    const pos = state.getActivePlayer();

    if (Math.random() > 0.9) {
      const ent = this.pool.get();

      if (!ent) { return; }

      this.particles.push({
        entity: ent,
      });

      ent.x = pos.x;
      ent.y = pos.y;
    }

    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].entity.x += 1;
    }
  }
}