type CurrentActiveEvent = "None"
                        | "Professor Goes Home";

class Cinematics extends Base {
  activeEvent: CurrentActiveEvent = "None";
  activeCoroutine = -1;
  state: StateClass;

  constructor(state: StateClass) {
    super(state);

    this.state = state;
  }

  update(state: StateClass): void {
    if (this.activeEvent === "None") {
      this.activeEvent = "Professor Goes Home";
      this.activeCoroutine = this.startCoroutine(state, this.professorGoesHomeCinematic());
    }
  }

  *textFollowPlayer(thing: TextEntity, following: Entity) {
    while (true) {
      thing.x = following.x + 10;
      thing.y = following.y - 16;

      yield "next";
    }
  }

  *talk(who: Controllable, text: string) {
    const textEntity = new TextEntity(this.state);
    const id = this.startCoroutine(this.state, this.textFollowPlayer(textEntity, who));

    while (true) {
      textEntity.text = text;

      yield { frames: 10 };
    }

    this.stopCoroutine(this.state, id);
  }

  *walkTo(who: Controllable, where: Point) {
    const { physics } = this.state;

    while (true) {
      const {
        hitRight,
      } = physics.move(this.state, who, 2, 0);

      if (hitRight && who.onGround) {
        who.jump();
      }

      yield "next";
    }
  }

  *professorGoesHomeCinematic() {
    const prof = state.playerRightProf;

    yield* this.talk(prof, "Hello my boy!");

    yield "next";

    yield* this.walkTo(prof, new Point({ x: 500, y: 500 }));
  }
}