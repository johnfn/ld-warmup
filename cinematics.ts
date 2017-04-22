type CurrentActiveEvent = "None"
                        | "First Convo"
                        | "Follow Prof To Home"
                        | "Learn About Tiny World"
                        | "Professor Fiddles"

class Cinematics extends Base {
  currentOrLastEvent: CurrentActiveEvent = "Follow Prof To Home";
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

        case "Follow Prof To Home":
          this.currentOrLastEvent = "Learn About Tiny World";
          this.activeCoroutine = this.startCoroutine(state, this.learnAboutTinyWorld());
        break;

        case "Learn About Tiny World":
          this.currentOrLastEvent = "Professor Fiddles";
          this.activeCoroutine = this.startCoroutine(state, this.professorFiddles());
        break;
      }
    }
  }

  finishCinematic(): void {
    this.stopCoroutine(this.state, this.activeCoroutine);
    this.activeCoroutine = -1;
  }

  *textFollowPlayer(text: TextEntity, following: Entity) {
    const cam = this.state.getActiveCamera();

    while (text.exists) {
      text.x = following.x + 10;
      text.y = following.y - 16;

      if (text.x + text.wordWrapWidth > cam.right) {
        text.x = cam.right - text.wordWrapWidth;
      }

      yield "next";
    }
  }

  *talk(who: Controllable, text: string, endingCondition?: { waitFrames: number } | (() => boolean)) {
    const { playerRightProf: prof, playerLeft: you } = state;

    const { keyboard } = this.state;
    const textEntity = new TextEntity(this.state);
    const id = this.startCoroutine(this.state, this.textFollowPlayer(textEntity, who));

    let charactersVisible = 1;

    outer:
    while (true) {
      // check to see if we're done

      if (endingCondition && charactersVisible >= text.length) {
        if (typeof endingCondition === "function" && endingCondition()) {
          break outer;
        }

        if (typeof endingCondition === "object") {
          for (let i = 0; i < endingCondition.waitFrames; i++) {
            yield "next";
          }
        }

        break outer;
      }

      // color & render text

      let textToRender = text.slice(0, ++charactersVisible);

      if (who === prof) {
        textToRender = `<prof>${ textToRender }</prof>`;
      } else if (who === you) {
        textToRender = `<you>${ textToRender }</you>`;
      }

      textEntity.text = textToRender;

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
        hitLeft,
      } = physics.move(this.state, who, dx, 0);

      if (
        (dx > 0 && hitRight && who.onGround) ||
        (dx < 0 && hitLeft  && who.onGround)
      ) {

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
    yield* this.talk(prof, "The Great Event, foretold by prophecy, to happen once every 4 months?");
    yield* this.talk(you, "Yeah.");
    yield* this.talk(prof, "(Amazing... one cognizant of Ludum Dare... could he be the one spoken of by prophecy?)");
    yield* this.talk(you, "Sorry?");
    yield* this.talk(prof, "Just talking to myself. Continue!");
    yield* this.talk(you, "It never seems to go well for me.");
    yield* this.talk(you, "There was this one time... where you turned me into Godzilla... it was bad.");
    yield* this.talk(prof, "You don't look like a godzilla to me.");
    yield* this.talk(you, "Yeah, getting back to human was quite an adventure, let me tell you.");
    yield* this.talk(prof, "Do I feel the plot for LD39 coming on?");
    yield* this.talk(you, "Sorry?");
    yield* this.talk(prof, "Anyways... why don't you come to my labratory?");
    yield* this.talk(prof, "I've got an interesting experiment in its final stages.");
    yield* this.talk(prof, "I'll make it up to you!");
    yield* this.talk(you, "Well, given that the the left side of this world is a giant wall, it would seem I don't have much of a choice.");

    this.finishCinematic();
  }

  getRandomSlowbieMessage(): string {
    return Util.RandElement([
      "Hurry up now!",
      "Try to be a bit faster, please.",
      "An old man is faster than you?",
      "Come on, now.",
      "Zzz... oops, sorry, fell asleep.",
      "Come along!",
      "Hurry!",
      "Almost there... I think?",
    ]);
  }

  *followProfessor() {
    const { tilemap, playerRightProf: prof, playerLeft: you } = state;

    const regionsToGo = tilemap.regionLayers.ProfessorDestRegions.regions.sort((a, b) => a.properties!.order - b.properties!.order);

    for (const { region } of regionsToGo) {
      yield* this.walkTo(prof, region);

      if (Util.Dist(prof, you) > 100) {
        yield* this.talk(prof, this.getRandomSlowbieMessage(), () => Util.Dist(prof, you) < 100);
      }
    }

    this.finishCinematic();
  }

  *learnAboutTinyWorld() {
    const { playerRightProf: prof, playerLeft: you, cameraLeft } = state;

    yield* this.talk(prof, "See that right there?");
    yield* this.talk(prof, "Just slightly to the left of the camera viewport?");
    yield* this.talk(you, "Uh...");

    cameraLeft.isExternallyControlled = true;

    yield* cameraLeft.panTo(TinyWorld.Instance);
    yield { frames: 30 };
    yield* cameraLeft.panTo(you);

    cameraLeft.isExternallyControlled = false;

    yield* this.talk(you, "...yeah, I think I do.");
    yield* this.talk(prof, "That... is a SMALL WORLD.");
    yield* this.talk(prof, "[looks suggestively at camera to indicate theme connection]");
    yield* this.talk(you, "Wow!");
    yield* this.talk(you, "What was that look about just now though.");
    yield* this.talk(prof, "It's not important. ");
    yield* this.talk(prof, "Anyways, I'm just about to finish up my experiments with this small world, so give me a few moments.");
    yield* this.talk(prof, "As soon as I finish, I'll make all our bad past encounters up to you. I have just the thing.");
    yield* this.talk(you, "...");
    yield* this.talk(prof, "Oh, and try not to get too close. The world may be small, but I assure you the gravity is VERY normal.");
    yield* this.talk(you, "Oh yeah, I'll definitely be sure not to do that.")
    yield* this.talk(prof, "Good!");
    yield* this.talk(prof, "We wouldn't want any...");
    yield* this.talk(prof, "Accidents!");
    yield* this.talk(prof, "[looks suggestively at camera again]");
    yield* this.talk(you, "Can you stop doing that?")

    this.finishCinematic();
  }

  *professorFiddles() {
    const { playerRightProf: prof, playerLeft: you } = state;

    const spotOne = new Point({ x: prof.x - 100, y: prof.y });
    const spotTwo = new Point({ x: prof.x + 200, y: prof.y });

    while (true) {
      yield* this.walkTo(prof, Rect.FromPoint(spotOne, 100));

      yield* this.talk(prof, "Dum de doo...", { waitFrames: 10 })

      yield* this.walkTo(prof, Rect.FromPoint(spotTwo, 100));

      yield* this.talk(prof, "Not too close now...", { waitFrames: 10 });

      yield* this.walkTo(prof, Rect.FromPoint(spotOne, 100));

      yield* this.talk(prof, "Tinker tinker tinker", { waitFrames: 10 })

      yield* this.walkTo(prof, Rect.FromPoint(spotTwo, 100));

      yield* this.talk(prof, "Fiddle dee dee...", { waitFrames: 10 });
      yield* this.talk(prof, "Nothing dangerous...", { waitFrames: 10 });
      yield* this.talk(prof, "No accidents...", { waitFrames: 10 });
    }

    this.finishCinematic();
  }
}