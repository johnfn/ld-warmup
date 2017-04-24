class Base {
  activeModes: Mode[] = ["Game"]

  constructor(state: StateClass, dontRegister = false) {
    if (!dontRegister) {
      state.entities.push(this);
    }
  }

  update(_state: StateClass) {

  }

  startCoroutine(state: StateClass, co: IterableIterator<CoroutineResult>): number {
    return state.startCoroutine(co, this.activeModes);
  }

  stopCoroutine(state: StateClass, id: number): void {
    delete state.coroutines[id];
  }

  isCoroutineActive(id: number) {
    return !!state.coroutines[id];
  }
}