type CurrentActiveEvent = "None"
                        | "First Convo"
                        | "Follow Prof To Home"

class Cinematics extends Base {
  currentOrLastEvent: CurrentActiveEvent = "First Convo";
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

        case "First Convo":
          this.currentOrLastEvent = "Follow Prof To Home";
          this.activeCoroutine = this.startCoroutine(state, this.followProfessor());
        break;
      }
    }
  }

  finishCinematic(): void {
    this.stopCoroutine(this.state, this.activeCoroutine);
    this.activeCoroutine = -1;
  }

  *textFollowPlayer(text: TextEntity, following: Entity) {
    while (text.exists) {
      text.x = following.x + 10;
      text.y = following.y - 16;

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

  *walkTo(who: Controllable, where: Rect) {
    const { physics } = this.state;

    while (!where.contains(who)) {
      const dx = where.centerX > who.x ? 2 : -2;
      const {
        hitRight,
      } = physics.move(this.state, who, dx, 0);

      if (hitRight && who.onGround) {
        who.jump();
      }

      yield "next";
    }
  }

  *firstConvo() {
    const { playerRightProf: prof, playerLeft: you } = state;

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

    this.finishCinematic();
  }

  *followProfessor() {
    const { tilemap, playerRightProf: prof, playerLeft: you } = state;

    const regionsToGo = tilemap.regionLayers.ProfessorDestRegions.regions.sort((a, b) => a.properties!.order - b.properties!.order);

    for (const { region } of regionsToGo) {
      yield* this.walkTo(prof, region);

      // ensure that the player is there before moving on.
    }

    this.finishCinematic();
  }
}