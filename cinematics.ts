type CurrentActiveEvent = "None"
                        | "Professor Goes Home";

class Cinematics extends Base {
  activeEvent: CurrentActiveEvent = "None";
  activeCoroutine = -1;

  constructor(state: StateClass) {
    super(state);
  }

  update(state: StateClass): void {
    if (this.activeEvent === "None") {
      this.activeEvent = "Professor Goes Home";
      this.activeCoroutine = this.startCoroutine(state, this.professorGoesHomeCinematic());
    }
  }

  *professorGoesHomeCinematic() {
    yield "next";

    console.log('yep, this is the prof all right');
  }
}