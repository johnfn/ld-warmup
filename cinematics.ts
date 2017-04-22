type CurrentActiveEvent = "None"
                        | "First Convo";

class Cinematics extends Base {
  currentOrLastEvent: CurrentActiveEvent = "None";
  activeCoroutine = -1;
  state: StateClass;

  constructor(state: StateClass) {
    super(state);

    this.state = state;
  }

  update(state: StateClass): void {
    if (this.activeCoroutine === -1) {
      switch (this.currentOrLastEvent) {
        case "None":
          this.currentOrLastEvent = "First Convo";
          this.activeCoroutine = this.startCoroutine(state, this.firstConvo());
        break;
      }
    }
  }

  finishCinematic(): void {
    this.stopCoroutine(this.state, this.activeCoroutine);
    this.activeCoroutine = -1;
  }

  *textFollowPlayer(thing: TextEntity, following: Entity) {
    while (true) {
      thing.x = following.x + 10;
      thing.y = following.y - 16;

      yield "next";
    }
  }

  *talk(who: Controllable, text: string) {
    const { keyboard } = this.state;
    const textEntity = new TextEntity(this.state);
    const id = this.startCoroutine(this.state, this.textFollowPlayer(textEntity, who));
    let charactersVisible = 1;

    outer:
    while (true) {
      textEntity.text = text.slice(0, ++charactersVisible);

      for (let i = 0; i < 3; i++) {
        if (keyboard.down.Z) {
          if (charactersVisible < text.length) {
            charactersVisible++;
          }
        }

        if (keyboard.justDown.Z) {
          if (charactersVisible >= text.length) {
            break outer;
          }
        }

        if (keyboard.justDown.X) {
          charactersVisible = text.length;
        }

        yield "next";
      }
    }

    textEntity.destroy();
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

  *firstConvo() {
    const prof = state.playerRightProf;
    const you = state.playerLeft;

    yield* this.talk(prof, "Hello my boy! (Press Z to continue.)");
    yield* this.talk(you, "Err... hello... again.");
    yield* this.talk(prof, "We've met before?");
    yield* this.talk(you, "...");
    yield* this.talk(you, "Yes...");
    yield* this.talk(you, "In a few past Ludum Dare games...");
    yield* this.talk(prof, "Ludum Dare?");
    yield* this.talk(prof, "The Great Event, foretold by prophecy, to\nhappen once every 4 months?");
    yield* this.talk(you, "Yeah.");
    yield* this.talk(prof, "(Amazing... one cognizant of Ludum Dare...\n could he be the one spoken of\n by prophecy?");
    yield* this.talk(you, "Sorry?");
    yield* this.talk(prof, "Just talking to myself. Continue!");
    yield* this.talk(you, "It never seems to go well for me.");
    yield* this.talk(you, "There was this one time... where you turned\n me into Godzilla... it was bad.");
    yield* this.talk(prof, "You don't look like a godzilla to me.");
    yield* this.talk(you, "Yeah, getting back to human was quite\n an adventure, let me tell you.");
    yield* this.talk(prof, "Do I feel the plot for LD39\n coming on?");
    yield* this.talk(you, "Sorry?");
    yield* this.talk(prof, "Anyways... why don't you come to my\nlabratory?");
    yield* this.talk(prof, "I've got an interesting experiment\n in its final stages.");
    yield* this.talk(prof, "I'll make it up to you!");
    yield* this.talk(you, "Well, given that the the left side of\n this world is a giant wall, it would seem\nI don't have much of a choice.");

    yield* this.walkTo(prof, new Point({ x: 500, y: 500 }));
  }
}