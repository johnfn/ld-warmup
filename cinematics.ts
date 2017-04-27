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
                        | "Chuck That Planet II"
                        | "Made It"
                        | "Fire That Cannon"
                        ;

class Cinematics extends Base {
  currentOrLastEvent: CurrentActiveEvent = "Fire That Cannon";
  activeCoroutine = -1;
  leftFade: FadeOutIn;
  rightFade: FadeOutIn;
  state: StateClass;
  allowFlinging = false;

  zForDialog = false;

  FINAL = false;

  isOnTinyWorld = false;

  canSwitchToOtherGuy = false;

  resetToYouWakeUp = true;

  madeit = false;

  stragglingTexts: TextEntity[] = [];
  stragglingBubbles: Bubble[] = [];

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

      if (G.Debug && this.currentOrLastEvent === "Chuck That Planet II") {
        TinyWorld.Instance.isBeingCarried = true;
        TinyWorld.Instance.carrier = state.playerRightProf;

        Controllable.SwitchActivePlayer(state);

        state.rightCamActive = true;
        state.leftCamActive  = true;

        this.putPlayerOnTinyWorld(state.playerLeft);

        this.canSwitchToOtherGuy = true;
        this.allowFlinging = true;
        this.resetToYouWakeUp = false;

        const startingObject = state.tilemap.objectLayers["ObjLayer"].objects[1];

        state.playerLeft.x = startingObject.x;
        state.playerLeft.y = startingObject.y;
      }

      if (G.Debug && this.currentOrLastEvent === "Fire That Cannon") {
        TinyWorld.Instance.isBeingCarried = true;
        TinyWorld.Instance.carrier = state.playerRightProf;

        state.rightCamActive = true;
        state.leftCamActive  = true;

        this.putPlayerOnTinyWorld(state.playerLeft);

        this.canSwitchToOtherGuy = true;
        this.allowFlinging = true;
        this.resetToYouWakeUp = false;

        const startingObject = state.tilemap.objectLayers["ObjLayer"].objects[1];

        state.playerLeft.x = startingObject.x;
        state.playerLeft.y = startingObject.y;
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
          this.resetToYouWakeUp = false;

          this.currentOrLastEvent = "We Talk";
          this.activeCoroutine = this.startCoroutine(state, this.profYouTalk());
        break;

        case "We Talk":
          this.currentOrLastEvent = "Chuck That Planet II";
        break;

        case "Chuck That Planet II":
          if (this.madeit) {
            this.currentOrLastEvent = "Made It";
            this.activeCoroutine = this.startCoroutine(state, this.madeIt());
          }
        break;
      }

      // post clean up

      // worth thinking about how to do this coroutine stuff cleaner post-compo.

      if (this.activeCoroutine !== -1) {
        this.removeStragglingTexts();
      }
    }
  }

  removeStragglingTexts(): void {
    for (const x of this.stragglingTexts) {
      x.destroy();
    }

    this.stragglingTexts = [];

    for (const b of this.stragglingBubbles) {
      b.destroy(this.state);
    }

    this.stragglingBubbles = [];
  }

  finishCinematic(): void {
    this.stopCoroutine(this.state, this.activeCoroutine);
    this.activeCoroutine = -1;
  }

  *textFollowPlayer(text: TextEntity, following: Entity, cam: Camera, stayOnScreen = true) {
    while (text.exists) {
      text.x = following.x + 10;
      text.y = following.y - 64;

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

      if (text[0] === "!") {
          textToRender = `<large>${ textToRender.slice(1) }</large>`;
      } else {
        if (who === prof) {
          textToRender = `<prof>${ textToRender }</prof>`;
        } else if (who === you) {
          textToRender = `<you>${ textToRender }</you>`;
        }
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

      if (this.FINAL) {
        TinyWorld.Instance.y = who.y - 48;
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
    yield* this.bubble(you, ":|");
    yield* this.talk(you, "Yes...");
    yield* this.talk(you, "In fact it feels like we meet about every 4 months or so...");
    yield* this.talk(prof, "Really?");
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
        yield* this.talk(prof, this.getRandomSlowbieMessage(), { waitFrames: 60 });
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

    this.stragglingBubbles.push(b);

    this.zForDialog = true;

    for (let i = 0; i < 45; i++) {
      yield "next";

      if (this.state.keyboard.justDown.Z || this.state.keyboard.justDown.X) {
        break;
      }
    }

    this.zForDialog = false;

    b.destroy(this.state);

    this.stragglingBubbles.splice(this.stragglingBubbles.indexOf(b), 1);
  }

  *professorIsHorrified() {
    const { playerRightProf: prof, playerLeft: you } = state;

    this.state.initialMusic.fade(1, 0, 4000);

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
    yield* this.talk(prof, "Well, I guess it's on me...");

    this.state.realMusic.play();

    yield* this.talk(prof, "To save the world.");

    yield* this.talk(prof, "(And him.)");

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
    yield* this.talk(prof, "Alright, so I can toss this thing around. Hold X, then choose a direction with the arrow keys (including diagonals).");
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

    TinyWorld.Instance.isBeingCarried = true;
    TinyWorld.Instance.carrier = prof;

    yield* this.talk(prof, "Aww... crap...");
    yield* this.bubble(prof, ":|");
    yield* this.talk(prof, "I completely forgot that along with the de-minimizer, I *also* dumped a bunch of spike traps down here.");
    yield* this.talk(prof, "Why did I even buy those?");
    yield* this.talk(prof, "...and leave them here?");
    yield* this.talk(prof, "Definitely not my best choice in retrospect.")
    yield* this.bubble(prof, "sweat");
  }

  *ohno() {
    const { playerRightProf: prof, playerLeft: you } = state;

    yield* this.talk(prof, "Oh... oh no.");
    yield* this.bubble(prof, ":|");
    yield* this.talk(prof, "Can you hear me?");
    yield* this.talk(you, "Yeah, what's up?");
    yield* this.talk(prof, "Well, I can't hear you at all.");

    yield* this.bubble(you, ":|");

    yield* this.talk(prof, "But let me explain.");
    yield* this.talk(prof, "This... this used to be the de-minimizer.");
    yield* this.talk(prof, "Now... now it's just a bunch of doodads. (And a few doohickeys.)");

    yield* this.bubble(prof, "sweat");
    this.startCoroutine(this.state, this.bubble(you, "sweat"));

    yield* this.talk(prof, "...");

    yield* this.talk(prof, "Alright, there's only one thing to do. As a back up plan, I hid a very powerful metafictional laser in the middle of the planet.");
    yield* this.talk(prof, "It's so dangerous, it may rip the very fabric of our being apart.");
    yield* this.talk(prof, "But it's going to be our only hope.");
    yield* this.talk(you, "Metafictional laser? What the heck does that mean?");
    yield* this.talk(prof, "Don't worry about it.");
    yield* this.talk(you, "I thought you said you couldn't hear me.");
    yield* this.talk(prof, "I can't. I'm just guessing what you're saying.");
    yield* this.talk(prof, "You're very predictable.");
    yield* this.bubble(you, ":|");
    yield* this.talk(prof, "Anyways, it's in the center of the planet.");
    yield* this.talk(prof, "I'll direct you there by phone.");

    this.finishCinematic();
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

    yield* this.talk(prof, "Whats the matter? Forget how to control me? Arrow keys. (idiot).", { waitFrames: 30 });

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

    yield* this.bubble(you, ":D");
    yield* this.talk(you, "I'll just try random ones.", { waitFrames: 30 }, true);

    yield* this.walkTo(you, Rect.FromPoint(closestPhoneYou, 100).translate({ x: 0, y: -100 }));

    this.finishCinematic();
  }

  phoneIndex = 0;
  phoneInterrupted = false;

  // my masterpiece

  // i had to rewrite it w/o yield stars because i dont have a 'stop the coroutine for gods sake'
  // abstraction loma

  *youUsePhone() {
    const { playerRightProf: prof, playerLeft: you } = state;
    const phones = state.entities.filter(x => x instanceof Phone) as Phone[];

    let closestPhoneYou  = Util.minBy(phones, p => Util.Dist(p, you))!;
    let closestPhoneProf = Util.minBy(phones, p => Util.Dist(p, prof))!;

    this.phoneInterrupted = false;

    while (true) {
      {
        const walker = this.walkTo(you, Rect.FromPoint(closestPhoneYou, 100).translate({ x: 0, y: -100 }));
        let res = walker.next();
        while (!res.done) {
          yield "next";
          res = walker.next();

          if (this.phoneInterrupted) {
            this.phoneInterrupted = false;
            return;
          }
        }
      }

      you.facing = 0;

      this.allowFlinging = true;

      this.startCoroutine(this.state, this.talk(closestPhoneProf, "Ring ring ring!", { waitFrames: 30 }, false));
      this.startCoroutine(this.state, this.talk(you             , "Ring ring ring!", { waitFrames: 30 }, false));

      for (let i = 0; i < 90; i++) {
        yield "next";

        if (this.phoneInterrupted) {
          this.phoneInterrupted = false;
          this.removeStragglingTexts();
          return;
        }
      }

      {
        const talker = this.talk(you, "Hello..?", { waitFrames: 30 });
        let res = talker.next();
        while (!res.done) {
          yield "next";
          res = talker.next();

          if (this.phoneInterrupted) {
            this.phoneInterrupted = false;
            this.removeStragglingTexts();
            return;
          }
        }
      }

      const msg = [
        "No one there...",
        "The number you have dialed has been disconnected or... alright, fine, okay.",
        "Dial tone.",
        "Busy.",
        "It's some old lady yelling at me...",
        "Oh god, I dialed my ex somehow",
        "Yes... I'd like one large cheese... my address? ... errr ....",
        "It's a dog barking.",
        "Dial tone.",
        "Oops, I forgot to enter a number...",
        "Yes, 911? I'd like to report a crime. Uh, it's kind of hard to explain actually you see I got sucked into a very small uh world, and now I'm stuck here, and so I would like you to send a very small police car to come and... uhh.. hello?",
      ];

      this.phoneIndex = (this.phoneIndex + 1) % msg.length;

      {
        const talker = this.talk(you, msg[this.phoneIndex], { waitFrames: 30 });
        let res = talker.next();
        while (!res.done) {
          yield "next";
          res = talker.next();
          yield "next";
          yield "next";

          if (this.phoneInterrupted) {
            this.phoneInterrupted = false;
            this.removeStragglingTexts();
            return;
          }
        }
      }

      {
        const talker = this.talk(you, "Let's try again.", { waitFrames: 30 });
        let res = talker.next();
        while (!res.done) {
          yield "next";
          res = talker.next();

          if (this.phoneInterrupted) {
            this.phoneInterrupted = false;
            this.removeStragglingTexts();
            return;
          }
        }
      }
    }
  }

  lock = false;

  *gotTossedLel() {
    const { playerRightProf: prof, playerLeft: you } = state;

    if (this.lock) { return; }
    this.lock = true;

    yield* this.bubble(you, "!");

    const randomExclamation = Util.RandElement([
      "!AAGHHHH!!!!",
      "!HOLY CRAP!",
      "!GHKLJFHGKJHA!",
      "!GADZOOKS!",
      "!SWEET MOTHER IN HEAVEN!",
      "!PRAISE JESUS!",
      "!BAZOOPER!",
      "!HELLO CLIFF FACE!",
      "!HEAVENS TO BETSY!",
      "!DEAR JOSEPHINE!",
      "!HALLOWED BE THY NAME!",
      "!HOLY SMOKES!",
      "!EXCALIBUR'S MIGHT!",
      "!THOR'S HAMMER!",
      "!ODIN'S ANVIL!",
      "!PLUTO'S NOT A PLANET!",
      "!E TO THE PI I PLUS ONE IS ZERO!",
      "!PINEAPPLE BELONGS ON PIZZA!",
      "!AVOCADOS ARE A FRUIT!",
      "!NO ONE COULD MAKE A GAME IN 48 HOURS",
    ]);

    yield* this.talk(you, randomExclamation, { waitFrames: 30 });

    yield { frames: 90 };

    if (Math.random() > 0.95) {
      yield* this.talk(prof, "I wonder if he minds all this tossing?", { waitFrames: 30 });
      yield* this.talk(prof, "Ehh, probably not.", { waitFrames: 30 });
    }

    if (this.resetToYouWakeUp) {
      this.activeCoroutine = -1;
      this.currentOrLastEvent = "You Wake Up";
    }

    this.lock = false;
  }

  interruptPhoneCall(): void {
    this.phoneInterrupted = true;
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
    yield* this.talk(prof, "A SMALL WORLD?");
    yield* this.talk(prof, "[looks at camera dramatically]");
    yield* this.talk(you, "Could you stop doing that please.");
    yield* this.talk(prof, "How could you tell?");
    yield* this.talk(you, "A particularly good guess.");
    yield* this.talk(prof, "Uergh.. anyway... ");

    yield* this.talk(you, "And like... there are a lot of earthquakes here.");
    yield* this.talk(you, "Like... a lot.");
    yield* this.bubble(prof, "sweat");

    yield* this.talk(prof, "... let's focus on the task at hand. Getting you untiny.");
    yield* this.talk(you, "Ok!");
    yield* this.bubble(prof, "!");
    yield* this.talk(prof, "Here's the plan. I'll go look for the de-minimizer. If I need you to do anything, I'll call you up.");
    yield* this.talk(prof, "Fortunately, along with all my spike traps, I also threw away a ton of phones, so it should be pretty easy to talk!.");
    yield* this.talk(prof, "So yeah. Let's keep going. And whenever you want to switch to being the other guy (whatever that means), press X at a phone!");

    this.canSwitchToOtherGuy = true;

    this.finishCinematic();
  }

  *madeIt() {
    const { playerRightProf: prof, playerLeft: you } = state;

    yield* this.talk(you, "Wow!!");
    yield* this.talk(you, "Those earthquakes!");
    yield* this.talk(you, "They were perfectly timed...");
    yield* this.talk(you, "...to give me a huge migraine.");
    yield* this.talk(you, "But I guess they got me over the walls, so thats a plus.");

    yield* this.bubble(you, ":|");

    yield* this.talk(you, "Is this thing on?");
    yield* this.talk(prof, "Yes!");
    yield* this.talk(prof, "Okay, listen to me very closely.");
    yield* this.talk(prof, "Go to the left side of the room, face to te right, and fire the cannon. ");
    yield* this.talk(prof, "Assuming it doesn't rend the fabric of spacetime in twain...");
    yield* this.bubble(you, "!");
    yield* this.talk(prof, "... it should be easy for you to return to normal size!");
    yield* this.talk(you, "...");
    yield* this.talk(you, "(How on earth could a cannon get me back to normal size... this makes no sense...)");

    this.finishCinematic();
  }

  *fireCannon() {
    const { playerRightProf: prof, playerLeft: you } = state;

    TinyWorld.Instance.isBeingCarried = true;
    TinyWorld.Instance.carrier = prof;

    state.cameraLeft.isExternallyControlled = true;
    state.cameraRight.isExternallyControlled = true;

      yield* this.talk(you, "...");
      yield* this.bubble(you, "!");

      yield* this.talk(you, "FIRE!");

      const white = new Entity(this.state, {
        texture: "white",
        depth: Depths.Fade,
      });

      white.x = Cannon.Instance.x + 32;
      white.y = Cannon.Instance.y + 16;

      white.sprite.anchor.x = 0;
      white.sprite.anchor.y = 0.5;

      white.sprite.width  = 0;
      white.sprite.height = 8;

      const origCenterX = this.state.cameraLeft.centerX;
      const origCenterY = this.state.cameraLeft.centerY;

      this.startCoroutine(this.state, this.talk(you, "weird... it just looks... white?"));

      for (let i = 0; i < 50; i++) {
        white.sprite.width += 4;

        yield "next"
      }

      this.state.cameraLeft.shake = { duration: 100, strength: 5 };

      // 200

      for (let i = 0; i < 50; i++) {
        white.sprite.width += 2;
        white.sprite.height += 1;

        yield "next"
      }

      yield* this.bubble(you, ":|");

      this.state.cameraLeft.shake = { duration: 100, strength: 10 };

      // 300 (58 high)

      for (let i = 0; i < 50; i++) {
        white.sprite.width += 2;

        yield "next"
      }

      yield* this.bubble(you, "!");

      this.state.cameraLeft.shake = { duration: 100, strength: 10 };

      // 400 (58 high)

      for (let i = 0; i < 100; i++) {
        white.sprite.width += 2;

        yield "next"
      }

      yield* this.talk(you, "uhh...");

      for (let i = 0; i < 25; i++) {
        this.state.cameraLeft.shake = { duration: 4, strength: 10 };

        yield "next"; yield "next"; yield "next"; yield "next";

        this.state.cameraLeft.centerX = origCenterX;
        this.state.cameraLeft.centerY = origCenterY;
      }

      for (let i = 0; i < 100; i++) {
        white.sprite.x += Math.random() * 3 - 1.5;

        state.wall.ontop.sprite.alpha = (100 - i) / 100;

        yield "next"
      }

      for (let i = 100; i > 0; i--) {
        white.sprite.alpha = i / 100;

        yield "next";
      }

      yield* this.talk(you, "weird...");
      yield* this.talk(you, "that black thing...");
      yield* this.talk(you, "its kinda... gone...");
      yield* this.talk(you, "what if i just...");
      yield* this.talk(you, "sort of...");
      yield* this.talk(you, "????");

    state.wall.ontop.sprite.alpha = 0;

    this.FINAL = true;

    const dummy = new Entity(state, {
      texture: "you",
      depth: Depths.Fade,
    });

    while (true) {
      yield "next";

      const ofsX = (you.x - state.cameraLeft.x - state.width);
      const ofsY = (you.y - state.cameraLeft.y);

      dummy.x = ofsX + state.cameraRight.x;
      dummy.y = ofsY + state.cameraRight.y;

      dummy.sprite.scale = you.sprite.scale;
      dummy.sprite.pivot = you.sprite.pivot;

      if (ofsX > 0) {
        you.x = dummy.x;
        you.y = dummy.y;

        you.careAboutSucking = false;

        dummy.destroy(this.state);

        state.cameraRight.target = you;

        // yield* this.leftFade.doFadeOut(this.state);

        break;
      }
    }

    state.cameraLeft.dontmovepls = true;

    while (true) {
      if (state.keyboard.justDown.X && Util.Dist(you, prof) <= 100) {
        break;
      }

      yield "next";
    }

    yield* this.talk(you, "What in the world j- wait, no, that's a bad expression.", undefined, true, state.cameraRight);
    yield* this.talk(you, "What did you do?!?", undefined, true, state.cameraRight);
    yield* this.talk(prof, "Never speak of this again.", undefined, true, state.cameraRight);
    yield* this.talk(you, "...", undefined, true, state.cameraRight);
    yield* this.talk(prof, "...", undefined, true, state.cameraRight);
    yield* this.talk(you, "...", undefined, true, state.cameraRight);
    yield* this.talk(prof, "...", undefined, true, state.cameraRight);
    yield* this.talk(you, "...", undefined, true, state.cameraRight);
    yield* this.talk(prof, "Man I should really throw this out. It gives me nothing but trouble.", undefined, true, state.cameraRight);
    yield* this.talk(prof, "Better do it quick.", undefined, true, state.cameraRight);

    const goodX = this.state.cameraRight.x + 100;

    yield* this.walkTo(prof, Rect.FromPoint({ x: goodX, y: prof.y }, 100), 2);

    const twdummy = new Entity(state, {
      texture: "tinyworld",
      depth: Depths.Fade,
    });

    this.allowFlinging = false;

    TinyWorld.Instance.vx = -15;
    TinyWorld.Instance.vy = 5;
    TinyWorld.Instance.y -= 50;

    TinyWorld.Instance.carrier = null;
    TinyWorld.Instance.isBeingCarried = false;

    for (let i = 0; i < 30; i++) {
      yield "next";

      twdummy.x = (TinyWorld.Instance.x - state.cameraRight.x + state.width) + state.cameraLeft.x;
      twdummy.y = (TinyWorld.Instance.y - state.cameraRight.y) + state.cameraLeft.y;
    }

    let i = 0;

    // FORCE

    if (TinyWorld.Instance.x - state.cameraRight.x > 0) {
      yield* this.talk(prof, "Stupid thing. *kick*", undefined, true, state.cameraRight);
    }

    while (TinyWorld.Instance.x - state.cameraRight.x > 0) {
      ++i;

      TinyWorld.Instance.vy -= i / 8;
      TinyWorld.Instance.vx -= i / 4;

      for (let j = 0; j < 2; j++) {
        yield "next";

        twdummy.x = (TinyWorld.Instance.x - state.cameraRight.x + state.width) + state.cameraLeft.x;
        twdummy.y = (TinyWorld.Instance.y - state.cameraRight.y) + state.cameraLeft.y;
      }
    }

    TinyWorld.Instance.x = twdummy.x;
    TinyWorld.Instance.y = twdummy.y;

    twdummy.visible = false;

    yield* this.talk(you, "You just...", undefined, true, state.cameraRight);
    yield* this.talk(you, "tossed...", undefined, true, state.cameraRight);
    yield* this.talk(you, "the world...", undefined, true, state.cameraRight);

    this.state.cameraRight.shake = { duration: 200, strength: 2 };

    yield* this.talk(you, "!WHAT IS HAPPENING?!?", undefined, true, state.cameraRight);

    yield* this.talk(prof, "Yeah don't worry about it. Everything's fine.", undefined, true, state.cameraRight);

    yield* this.talk(prof, "Saved you from being really tiny forever. Only made a few rifts in space time. All in all, a good Ludum Dare.", undefined, true, state.cameraRight);
    yield* this.talk(prof, "I'm going to go to sleep. Along with some other Ludum Dare game makers I could name.", undefined, true, state.cameraRight);

    state.hud.visible = false;

    this.state.realMusic.fade(1, 0.5, 5000);

    yield* this.leftFade.doFadeOut(this.state);

    yield* this.talk(prof, "See you in another 4 months!", undefined, true, state.cameraRight);
    yield* this.talk(prof, "Or longer!", undefined, true, state.cameraRight);
    yield* this.talk(prof, "But probably not!", undefined, true, state.cameraRight);


    this.state.realMusic.fade(0.5, 0.0, 5000);

    yield* this.rightFade.doFadeOut(this.state);

    // state.cameraLeft.isExternallyControlled = false;
    // state.cameraRight.isExternallyControlled = false;

    // TODO - remove phone -  it ruins the mood ...

  }
}