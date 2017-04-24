type CurrentActiveEvent = "None"
                        | "First Convo"
                        | "Follow Prof To Home"
                        | "Learn About Tiny World"
                        | "Professor Fiddles"
                        | "Professor is Horrified"
                        | "Professor Explains Tossing"
                        | "Professor Tosses a Few Times"
                        | "You Wake Up"
                        | "You Use Phone"
                        | "We Talk"
                        ;

class Cinematics extends Base {
  currentOrLastEvent: CurrentActiveEvent = "Professor Fiddles";
  activeCoroutine = -1;
  leftFade: FadeOutIn;
  rightFade: FadeOutIn;
  state: StateClass;

  zForDialog = false;

  isOnTinyWorld = false;

  stragglingTexts: TextEntity[] = [];

  constructor(state: StateClass) {
    super(state);

    this.state = state;
    this.leftFade  = new FadeOutIn(this.state, "left");
    this.rightFade = new FadeOutIn(this.state, "right");

    setTimeout(() => {
      if (G.Debug && this.currentOrLastEvent === "Professor Fiddles") {
        this.activeCoroutine = this.startCoroutine(state, this.professorFiddles());
      }

      if (G.Debug && this.currentOrLastEvent === "Professor Tosses a Few Times") {
        this.currentOrLastEvent = "Professor Tosses a Few Times";
        TinyWorld.Instance.isBeingCarried = true;
        TinyWorld.Instance.carrier = state.playerRightProf;
        Controllable.SwitchActivePlayer(state);
        state.rightCamActive = true;
        state.leftCamActive  = false;
      }

      if (G.Debug && this.currentOrLastEvent === "You Wake Up") {
        TinyWorld.Instance.isBeingCarried = true;
        TinyWorld.Instance.carrier = state.playerRightProf;

        Controllable.SwitchActivePlayer(state);

        state.rightCamActive = true;
        state.leftCamActive  = true;

        this.putPlayerOnTinyWorld(state.playerLeft);

        this.activeCoroutine = this.startCoroutine(state, this.youWakeUp());
      }

      if (G.Debug && this.currentOrLastEvent === "You Use Phone") {
        TinyWorld.Instance.isBeingCarried = true;
        TinyWorld.Instance.carrier = state.playerRightProf;

        Controllable.SwitchActivePlayer(state);

        state.rightCamActive = true;
        state.leftCamActive  = true;

        this.putPlayerOnTinyWorld(state.playerLeft);

        this.activeCoroutine = this.startCoroutine(state, this.youUsePhone());
      }
    });
  }

  putPlayerOnTinyWorld(player: Controllable): void {
    const pos = state.tilemap.objectLayers.TinyWorldLocationLayer.objects[0];

    player.x = pos.x;
    player.y = pos.y;

    this.isOnTinyWorld = true;
  }

  update(state: StateClass): void {
    // const { playerLeft: you } = state;

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

        case "Professor Fiddles":
          this.currentOrLastEvent = "Professor is Horrified";
          this.activeCoroutine = this.startCoroutine(state, this.professorIsHorrified());

        break;

        case "Professor is Horrified":
          if (TinyWorld.Instance.isBeingCarried) {
            this.currentOrLastEvent = "Professor Explains Tossing";
            this.activeCoroutine = this.startCoroutine(state, this.professorExplainsTossing());
          }

        break;

        case "Professor Explains Tossing":
          this.currentOrLastEvent = "Professor Tosses a Few Times";

        break;

        case "Professor Tosses a Few Times":
          const worldDest = state.tilemap.regionLayers.WorldDest1Regions.regions[0];

          if (worldDest.region.contains(TinyWorld.Instance)) {
            this.currentOrLastEvent = "You Wake Up";
            this.activeCoroutine = this.startCoroutine(state, this.youWakeUp());
          }

        break;

        case "You Wake Up":
          this.currentOrLastEvent = "You Use Phone";
          this.activeCoroutine = this.startCoroutine(state, this.youUsePhone());
        break;

        case "You Use Phone":
          this.currentOrLastEvent = "We Talk";
          this.activeCoroutine = this.startCoroutine(state, this.profYouTalk());
        break;
      }

      // post clean up

      // worth thinking about how to do this coroutine stuff cleaner post-compo.

      if (this.activeCoroutine !== -1) {
        for (const x of this.stragglingTexts) {
          x.destroy();
        }

        this.stragglingTexts = [];
      }
    }
  }

  finishCinematic(): void {
    this.stopCoroutine(this.state, this.activeCoroutine);
    this.activeCoroutine = -1;
  }

  *textFollowPlayer(text: TextEntity, following: Entity, cam: Camera, stayOnScreen = true) {
    while (text.exists) {
      text.x = following.x + 10;
      text.y = following.y - 16;

      // console.log(cam.right);

      if (stayOnScreen && text.x + text.wordWrapWidth > cam.right) {
        text.x = cam.right - text.wordWrapWidth;
      }

      yield "next";
    }
  }

  *talk(
    who: Entity,
    text: string, endingCondition?: { waitFrames: number } | (() => boolean),
    stayOnScreen = true,
    cam?: Camera) {

    const { playerRightProf: prof, playerLeft: you } = state;
    const { keyboard } = this.state;
    const textEntity = new TextEntity(this.state);
    if (!cam) {
      if (who instanceof Controllable) {
        cam = who.camera;
      } else {
        console.log('err, no associated cam!')

        cam = state.cameraLeft; // random
      }
    }

    this.stragglingTexts.push(textEntity);

    const id = this.startCoroutine(this.state, this.textFollowPlayer(textEntity, who, cam, stayOnScreen));

    let charactersVisible = 1;

    if (!endingCondition) {
      this.zForDialog = true;
    }

    outer:
    while (true) {
      // check to see if we're done

      if (endingCondition) {
        if (typeof endingCondition === "function" && endingCondition()) {
          yield { frames: 30 };

          break outer;
        }

        if (typeof endingCondition === "object" && charactersVisible > text.length) {
          for (let i = 0; i < endingCondition.waitFrames; i++) {
            yield "next";
          }

          break outer;
        }
      }

      // color & render text

      let textToRender = text.slice(0, ++charactersVisible);

      if (who === prof) {
        textToRender = `<prof>${ textToRender }</prof>`;
      } else if (who === you) {
        textToRender = `<you>${ textToRender }</you>`;
      }

      textEntity.text = textToRender;

      if (endingCondition) {
        charactersVisible++;

        yield { frames: 3 };
      } else {
        for (let i = 0; i < 3; i++) {
          if (keyboard.justDown.Z) {
            keyboard.clear("Z");

            if (charactersVisible < text.length) {
              charactersVisible = text.length;

              yield { frames: 3 };

              break /* inner */;
            } else {
              break outer;
            }
          }

          yield "next";
        }
      }
    }

    textEntity.destroy();
    this.stopCoroutine(this.state, id);

    if (!endingCondition) {
      this.zForDialog = false;
    }
  }

  *walkTo(who: Controllable, where: Rect, speed = 2) {
    const { physics } = this.state;

    while (!where.contains(who)) {
      const dx = where.centerX > who.x ? speed : -speed;
      const {
        hitRight,
        hitLeft,
      } = physics.move(this.state, who, dx, 0);

      if (
        (dx > 0 && hitRight && who.onGround > 0) ||
        (dx < 0 && hitLeft  && who.onGround > 0)
      ) {
        who.jump();
      }

      who.facing = Math.sign(dx);

      yield "next";
    }
  }

  *firstConvo() {
    const { playerRightProf: prof, playerLeft: you } = state;

    yield* this.talk(prof, "Hello my boy! (Press Z to continue.)");
    yield* this.talk(you, "Err... hello... again.");
    yield* this.talk(prof, "We've met before?");
    yield* this.talk(you, "...");
    yield* this.bubble(you, ":|");
    yield* this.talk(you, "Yes...");
    yield* this.talk(you, "In a few past Ludum Dare games...");
    yield* this.talk(prof, "Ludum Dare?");
    yield* this.talk(prof, "The Great Event, foretold by prophecy, to happen once every 4 months?");
    yield* this.talk(you, "Yeah.");
    yield* this.talk(prof, "(Amazing... one cognizant of Ludum Dare... could he be the one spoken of by prophecy?)");
    yield* this.talk(you, "Sorry?");
    yield* this.talk(prof, "Just talking to myself. Continue!");
    yield* this.bubble(you, ":|");
    yield* this.talk(you, "It never seems to go well for me.");
    yield* this.talk(you, "There was this one time... where you turned me into Godzilla... it was bad.");
    yield* this.talk(prof, "You don't look like a godzilla to me.");
    yield* this.talk(you, "Yeah, getting back to human was quite an adventure, let me tell you.");
    yield* this.talk(prof, "Do I feel the plot for LD39 coming on?");
    yield* this.talk(you, "Sorry?");
    yield* this.talk(prof, "Anyways... why don't you come to my labratory?");
    yield* this.talk(prof, "I've got an interesting experiment in its final stages.");
    yield* this.bubble(prof, ":D");
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

    yield* this.talk(prof, "Welcome!");
    yield* this.talk(prof, "...");
    yield* this.talk(prof, "To my TINY WORLD LABORATORY!");
    yield* this.bubble(prof, ":D");
    yield* this.talk(you, "Uh...");
    yield* this.bubble(you, ":|");
    yield* this.talk(prof, "See that right there?");
    yield* this.talk(prof, "Just slightly to the left of the camera viewport?");
    yield* this.talk(you, "Uhhhhh...");

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
    yield* this.bubble(prof, ":D");
    yield* this.talk(you, "...");
    yield* this.talk(prof, "Oh, and try not to get too close. The world may be small, but I assure you the gravity is VERY normal.");
    yield* this.talk(prof, "I've got my anti-gravity skateboard, so I'm not affected, but yours is completely normal, so watch out!");
    yield* this.talk(prof, "It'll literally suck you in!");
    yield* this.talk(prof, "...");
    yield* this.talk(prof, "It's kind of like a metaphor.");
    yield* this.talk(prof, "The world sucks. Literally.");
    yield* this.bubble(prof, ":|");
    yield* this.talk(you, "(...how can it be a metaphor if it's literal...)")
    yield* this.talk(prof, "Well at least this tiny one does.");
    yield* this.talk(prof, "Anyways.");
    yield* this.talk(prof, "Safety first!");
    yield* this.talk(you, "Oh yeah, I'll definitely be sure not to do that.")
    yield* this.talk(prof, "Good!");
    yield* this.talk(prof, "We wouldn't want any...");
    yield* this.talk(prof, "Accidents!");
    yield* this.talk(prof, "[looks suggestively at camera again]");
    yield* this.bubble(prof, ":|");
    yield* this.talk(you, "Can you stop doing that?")

    this.finishCinematic();
  }

  *suckedIntoTinyWorldOhNo() {
    const { playerLeft: you } = state;

    while (Util.Dist(you, TinyWorld.Instance) > 40) {
      yield "next";
    }

    this.finishCinematic();
  }

  *professorFiddles() {
    const { playerRightProf: prof } = state;

    const spotOne = new Point({ x: prof.x, y: prof.y });
    const spotTwo = new Point({ x: prof.x - 400, y: prof.y });

    this.startCoroutine(state, this.suckedIntoTinyWorldOhNo());

    while (true) {
      yield* this.walkTo(prof, Rect.FromPoint(spotOne, 100));

      yield* this.talk(prof, "Dum de doo...", { waitFrames: 10 }, false);

      yield* this.walkTo(prof, Rect.FromPoint(spotTwo, 100));

      yield* this.talk(prof, "Not too close now...", { waitFrames: 10 }, false);

      yield* this.walkTo(prof, Rect.FromPoint(spotOne, 100));

      yield* this.talk(prof, "Tinker tinker tinker", { waitFrames: 10 }, false)
      yield* this.bubble(prof, "sweat");

      yield* this.walkTo(prof, Rect.FromPoint(spotTwo, 100));

      yield* this.talk(prof, "Fiddle dee dee...", { waitFrames: 10 }, false);
      yield* this.talk(prof, "Nothing dangerous...", { waitFrames: 10 }, false);
      yield* this.talk(prof, "No accidents...", { waitFrames: 10 }, false);
    }
  }

  *bubble(target: Controllable, type: BubbleType) {
    const b = new Bubble(this.state, target, type);

    for (let i = 0; i < 45; i++) {
      yield "next";

      if (this.state.keyboard.justDown.Z || this.state.keyboard.justDown.X) {
        break;
      }
    }

    b.destroy(this.state);
  }

  *professorIsHorrified() {
    const { playerRightProf: prof, playerLeft: you } = state;

    yield* this.leftFade.doFadeOut(this.state);

    this.putPlayerOnTinyWorld(you);

    you.sprite.scale.x = 1;
    you.sprite.scale.y = 1;

    Controllable.SwitchActivePlayer(state);
    state.rightCamActive = true;
    state.leftCamActive  = false;

    yield "next";

    yield* this.talk(prof, "OH MY GOD NO!");
    yield* this.talk(prof, "...");
    yield* this.talk(prof, "Holy freaking crap.");
    yield* this.talk(prof, "He really just got sucked into the small world, didnt he.");
    yield* this.talk(prof, "...");
    yield* this.bubble(prof, "sweat");
    yield* this.talk(prof, "And now he's probably tiny too.");
    yield* this.talk(prof, "Well, there's only one thing to do. First, I better go pick up that tiny world (with X).");
    yield* this.talk(prof, "I'm not affected by the weird gravity. I've got this anti-gravity skateboard.");
    yield* this.talk(prof, "Then I'll need to go find my de-minimizer. It's the only way to get him back to normal size.");
    yield* this.talk(prof, "I tossed that thing out. I thought it was a waste of space.");
    yield* this.bubble(prof, ":|");
    yield* this.talk(prof, "Anyway, yep, gotta pick it up with X.");

    this.finishCinematic();
  }

  *professorExplainsTossing() {
    const { playerRightProf: prof } = state;

    yield* this.talk(prof, "Phew! Just like ... ergh ... nothing!");
    yield* this.talk(prof, "I might not be able to jump while carrying this thing. It's pretty heavy!");
    yield* this.bubble(prof, "sweat");
    yield* this.talk(prof, "Alright, so I can toss this thing around. Hold X, then choose a direction with the arrow keys.");
    yield* this.talk(prof, "Finally, release X and let it go flying!");
    yield* this.bubble(prof, ":|");
    yield* this.talk(prof, "I mean... TRY to be careful. It is an entire tiny world, after all.");
    yield* this.bubble(prof, ":|");
    yield* this.bubble(prof, "sweat");
    yield* this.talk(prof, "And apparently it has that guy on it...");
    yield* this.talk(prof, "...");
    yield* this.talk(prof, "I'm sure he'll be fine...");
    yield* this.talk(prof, "...");
    yield* this.talk(prof, "Anyways, I should go to the left and down to get my de-minimizer back.");

    this.finishCinematic();
  }

  *spikeIrony() {
    const { playerRightProf: prof } = state;

    yield* this.talk(prof, "Aww... crap...");
    yield* this.bubble(prof, ":|");
    yield* this.talk(prof, "I completely forgot that along with the de-minimizer, I *also* dumped a bunch of spike traps down here.");
    yield* this.talk(prof, "Why did I even buy those?");
    yield* this.talk(prof, "...and leave them here?");
    yield* this.talk(prof, "Definitely not my best choice in retrospect.")
    yield* this.bubble(prof, "sweat");
  }

  *youWakeUp() {
    const { playerRightProf: prof, playerLeft: you, cameraLeft } = state;

    state.rightCamActive = true;
    state.leftCamActive  = true;

    yield* this.leftFade.doFadeIn(this.state);

    yield* this.talk(you, "Zzzzzzzzzzzzzzzzzzz...", { waitFrames: 30 }, true);
    yield* this.talk(you, "Pass the sugar...", { waitFrames: 30 }, true);
    yield* this.talk(you, "zzzzzzzzzzzz...", { waitFrames: 30 }, true);
    yield* this.talk(you, "...", { waitFrames: 30 }, true);
    yield* this.bubble(you, "!");
    yield* this.talk(you, "Where...", { waitFrames: 30 }, true);
    yield* this.talk(you, "What...", { waitFrames: 30 }, true);
    yield* this.talk(you, "The...", { waitFrames: 30 }, true);
    yield* this.talk(you, "CRAP?", { waitFrames: 30 }, true);
    yield* this.bubble(you, "!");

    const middle = you.pt;

    yield* this.walkTo(you, Rect.FromPoint(middle.add(new Point({ x: 300, y: 0 })), 100), 3);

    yield* this.bubble(you, ":|");

    yield* this.walkTo(you, Rect.FromPoint(middle.add(new Point({ x: -300, y: 0 })), 100), 5);

    yield* this.talk(prof, "Whats the matter? Forget how to control me? Arrow keys. (idiot).");

    yield* this.bubble(you, ":|");
    yield* this.bubble(you, "sweat");

    yield* this.talk(you, "Oh man", { waitFrames: 30 }, true);
    yield* this.talk(you, "Oh this is bad", { waitFrames: 30 }, true);
    yield* this.talk(you, "This is really really bad", { waitFrames: 30 }, true);
    yield* this.talk(you, "What do I do what do I do", { waitFrames: 30 }, true);
    yield* this.talk(you, "What did the professor say to do at a time like this", { waitFrames: 30 }, true);

    yield* this.bubble(you, "sweat");

    yield* this.talk(you, "Crap, I can't rememeber!", { waitFrames: 30 }, true);
    yield* this.talk(you, "I never listened to that guy!", { waitFrames: 30 }, true);
    yield* this.talk(you, "I can't remember a word he's said!", { waitFrames: 30 }, true);
    yield* this.talk(you, "Ever!", { waitFrames: 30 }, true);
    yield* this.talk(you, "He's just that unmemorable!", { waitFrames: 30 }, true);

    yield* this.bubble(you, "sweat");

    yield* this.talk(you, "Okay, don't panic... just... look around...", { waitFrames: 30 }, true);

    const phones = state.entities.filter(x => x instanceof Phone) as Phone[];
    let closestPhoneYou  = Util.minBy(phones, p => Util.Dist(p, you))!;

    cameraLeft.isExternallyControlled = true;
    yield* cameraLeft.panTo(closestPhoneYou);
    yield { frames: 30 };
    yield* cameraLeft.panTo(you);
    cameraLeft.isExternallyControlled = false;

    yield* this.talk(you, "Hey, look, a telephone! Maybe I can call the professor.", { waitFrames: 30 }, true);
    yield* this.talk(you, "...", { waitFrames: 30 }, true);

    yield* this.bubble(you, ":|");

    yield* this.talk(you, "I don't know his number...", { waitFrames: 30 }, true);
    yield* this.bubble(you, ":|");

    this.finishCinematic();
  }

  *youUsePhone() {
    const { playerRightProf: prof, playerLeft: you } = state;
    const phones = state.entities.filter(x => x instanceof Phone) as Phone[];

    let closestPhoneYou  = Util.minBy(phones, p => Util.Dist(p, you))!;
    let closestPhoneProf = Util.minBy(phones, p => Util.Dist(p, prof))!;

    yield* this.bubble(you, ":D");
    yield* this.talk(you, "I'll just try random ones.", { waitFrames: 30 }, true);

    yield* this.walkTo(you, Rect.FromPoint(closestPhoneYou, 100).translate({ x: 0, y: -100 }));

    while (true) {
      this.startCoroutine(this.state, this.talk(closestPhoneProf, "Ring ring ring!", { waitFrames: 30 }, false));
      this.startCoroutine(this.state, this.talk(you             , "Ring ring ring!", { waitFrames: 30 }, false));

      yield { frames: 90 };
    }
  }

  *profYouTalk() {
    const { playerRightProf: prof, playerLeft: you } = state;

    yield* this.talk(you, "Hello..?", { waitFrames: 30 });

    yield* this.bubble(prof, ":D");

    yield* this.talk(prof, "Hello!");
    yield* this.talk(prof, "Oh thank god it worked!!!");
    yield* this.talk(prof, "I was worried for a moment we would lose you forever!");

    yield* this.talk(prof, "I had put a phone on the tiny world for this exact purpose.");
    yield* this.bubble(you, "sweat");

    yield* this.talk(you, "So I seem to be trapped on this... very... little.. planet thing.", { waitFrames: 30 });
    yield* this.talk(prof, "A TINY WORLD?");
    yield* this.talk(prof, "[looks at camera dramatically]");
    yield* this.talk(you, "Could you stop doing that please.");
    yield* this.talk(prof, "How could you tell?");
    yield* this.talk(you, "Bro, your massive face is basically the only thing I can see right now.");

    yield* this.bubble(prof, "sweat");

    yield* this.talk(prof, "Uergh.. anyway... let's focus on the task at hand. Getting you untiny.");
    yield* this.talk(you, "Ok!");
    yield* this.bubble(prof, "!");
    yield* this.talk(prof, "Here's the plan. I'll go look for the de-minimizer. If I need you to do anything, I'll call you up.");
    yield* this.talk(prof, "Fortunately, along with all my spike traps, I also threw away a ton of phones, so it should be pretty easy to talk!.");

    this.finishCinematic();
  }
}