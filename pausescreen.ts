class PauseScreen extends Entity {
  activeModes: Mode[] = ["Game", "Pause"];

  constructor(state: StateClass) {
    super(state, { texture: "enemy" });
  }

  update(state: StateClass): void {
    const { keyboard } = state;

    if (keyboard.justDown.P) {
      if (state.currentMode === "Pause") {
        state.currentMode = "Game";
      } else {
        state.currentMode = "Pause";
      }
    }
  }
}