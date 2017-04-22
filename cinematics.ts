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

    yield "next";

    yield* this.walkTo(prof, new Point({ x: 500, y: 500 }));
  }
}