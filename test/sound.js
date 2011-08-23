/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global paladin: false, document: false, window: false, setTimeout: false,
 module, test, expect, ok, notEqual, QUnit, stop, start, asyncTest, equal,
 deepEqual, raises */

(function() {

  var p,
    effect,
    track,
    speaker,
    emptyArray = [],
    effectArray;

  var shortSound = "data:audio/wav;base64,UklGRswJAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YagJAAAnQJ0b4wseBTMC8gBoACwAEwAIAAMAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwls+7peJd84/6qP39/pD/0P/r//f//P/+//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+IdV49ahpfC+UEGwLoAGMAKwASAAcAAwABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACFstGrw9tm8Ej5HP3B/nb/xP/m//X/+//9//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9BXMNLnSAKDgsGmQIeAXsANQAWAAkABAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAx1RGYQtO97LX3bvx2/lb/t//g//L/+v/9//7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8NPYldQyhVEXYHNgNhAZgAQQAcAAwABQACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACDxMg56MP1mPsa/i//pv/Z/+//+P/8//7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+HFnpztTFlFTYJ9wO0AbwAUAAiAA8ABgACAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHCWz7ul4l3zj/qo/f3+kP/Q/+v/9//8//7//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////4h1Xj1qGl8L5QQbAugAYwArABIABwADAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIWy0avD22bwSPkc/cH+dv/E/+b/9f/7//3//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////0Fcw0udIAoOCwaZAh4BewA1ABYACQAEAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADHVEZhC073stfdu/Hb+Vv+3/+D/8v/6//3//v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////w09iV1DKFURdgc2A2EBmABBABwADAAFAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIPEyDnow/WY+xr+L/+m/9n/7//4//z//v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////4cWenO1MWUVNgn3A7QBvABQACIADwAGAAIAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcJbPu6XiXfOP+qj9/f6Q/9D/6//3//z//v//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////iHVePWoaXwvlBBsC6ABjACsAEgAHAAMAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhbLRq8PbZvBI+Rz9wf52/8T/5v/1//v//f////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8=";

  module("sound", {
    setup: function () {
      stop();

      paladin.create({
        graphics: {
          canvas: document.createElement('canvas')
        }
      }, function (instance) {
        p = instance;

        effect = new p.sound.Effect({
          url: shortSound,
          instances: 1, // Force a single clone to make testing audio element possible
          callback: function() {
            effectArray = [effect];
            start();
          }
        });

        speaker = new p.component.Speaker();
      });
    },
    teardown: function () {
    }
  });

  test("Speaker allows volume and muted changes.", function() {
    expect(8);

    ok(speaker.muted === false, "Speaker has muted property, initially false");
    ok(speaker.volume, "Speaker has volume property");

    speaker.muted = true;
    ok(speaker.muted === true, "Speaker allows muted to be set true");
    speaker.muted = false;
    ok(speaker.muted === false, "Speaker allows muted to be set false");

    speaker.volume = 0;
    equal(speaker.volume, 0, "Speaker volume can be set to 0");
    speaker.volume = -56;
    equal(speaker.volume, 0, "Speaker volumes less than 0 are normalized to 0");
    speaker.volume = 0.5;
    equal(speaker.volume, 0.5, "Speaker volumes between 0 and 1.0 are allowed");
    speaker.volume = 1.1;
    equal(speaker.volume, 1.0, "Speaker volumes greater than 1.0 are normalized to 1.0");
  });

  test("Speaker allows Effects to be added and removed.", function() {
    expect(7);

    deepEqual(speaker.sounds, emptyArray, "Speaker has no sounds at first");

    speaker.add('blip', effect);
    deepEqual(speaker.sounds, effectArray, "Adding an Effect to Speaker works");
    raises(function() { speaker.add('blip', effect); }, "Adding an Effect with same name more than once fails");
    raises(function() { speaker.add('empty', null); }, "Adding a null Effect fails");

    speaker.remove('blip');
    deepEqual(speaker.sounds, emptyArray, "Removing an Effect from a Speaker works");
    speaker.add('blip', effect);
    deepEqual(speaker.sounds, effectArray, "Adding an Effect after removing works");

    speaker.add('bloop', effect);
    speaker.remove('bloop');
    deepEqual(speaker.sounds, effectArray, "Remove removes the proper Effect");
  });

  test("Effect gets created properly", function() {
    expect(3);

    raises(function() { new p.sound.Effect({url: null}); }, "Effect constructor expects a url");
    equal(effect.url, shortSound, "Effect url property holds correct url");
    ok(effect.audio instanceof HTMLAudioElement, "Effect audio property returns an audio element");
  });

  test("Effect handles errors in constructor", function() {
    expect(1);
    stop();

    var badEffect = new p.sound.Effect({
      url: "garbage",
      errback: function() {
        start();
        ok(true, "Effect fires errback when there is an error create a Effect");
      }
    });
  });

  test("Effect fires callback in constructor", function() {
    expect(1);
    stop();

    var goodEffect = new p.sound.Effect({
      url: shortSound,
      callback: function() {
        start();
        ok(true, "Effect fires callback when creating a Effect");
      }
    });
  });

  test("Effect.load fires callback", function() {
    expect(2);
    stop();

    p.sound.Effect.load({
      url: shortSound,
      instances: 1,
      callback: function(t) {
        start();
        ok(t instanceof p.sound.Effect, "Effect is a p.sound.Effect object");
        equal(t.url, effect.url, "Effect.load fires callback with reference to correct Effect object");
      }
    });
  });

  test("Effect.load fires errback", function() {
    expect(1);
    stop();

    p.sound.Effect.load({
      url: "garbage",
      instances: 1,
      errback: function() {
        start();
        ok(true, "Effect.load fires errback when there is an error creating an Effect object");
      }
    });
  });

  test("Speaker can play Effect", function() {
    expect(1);
    stop();

    var testSpeaker = new p.component.Speaker();
    testSpeaker.add('blip', effect);
    testSpeaker.muted = true;

    var audio = effect.audio;

    function onEnded() {
      start();
      ok(true, "Speaker.play correctly plays Effect to completion");
      audio.removeEventListener('ended', onEnded, false);
    }

    audio.addEventListener('ended', onEnded, false);

    testSpeaker.play('blip');
  });

  test("Speaker can pause a named Effect", function() {
    expect(1);
    stop();

    var testSpeaker = new p.component.Speaker();
    testSpeaker.add('blip', effect);
    testSpeaker.muted = true;

    function onPause() {
      start();
      ok(true, "Speaker.pause(name) correctly pauses Effect");
      audio.removeEventListener('pause', onPause, false);
    }

    var audio = effect.audio;
    audio.addEventListener('pause', onPause, false);

    testSpeaker.play('blip');
    testSpeaker.pause('blip');
  });

  test("Speaker can pause all playing Effects", function() {
    expect(1);
    stop();

    var testSpeaker = new p.component.Speaker();
    testSpeaker.add('blip', effect);
    testSpeaker.muted = true;

    function onPause() {
      start();
      ok(true, "Speaker.pause() correctly pauses effect");
      audio.removeEventListener('pause', onPause, false);
    }

    var audio = effect.audio;
    audio.addEventListener('pause', onPause, false);

    testSpeaker.play('blip');
    testSpeaker.pause();
  });

  test("sound.music allows Effects to be added and removed.", function() {
    expect(7);

    // Use sound.music speaker singleton
    var music = p.sound.music;

    deepEqual(music.sounds, emptyArray, "sound.music has no Tracks at first");

    music.add('blip', effect);
    deepEqual(music.sounds, effectArray, "Adding a Track to sound.music works");
    raises(function() { music.add('blip', effect); }, "Adding a Track name more than once to sound.music fails");
    raises(function() { music.add('empty', null); }, "Adding a null Track to sound.music fails");

    music.remove('blip');
    deepEqual(music.sounds, emptyArray, "Removing a Track from sound.music works");
    music.add('blip', effect);
    deepEqual(music.sounds, effectArray, "Adding a Track after removing works");

    music.add('bloop', effect);
    music.remove('bloop');
    deepEqual(music.sounds, effectArray, "Remove removes the proper Track");
  });

  test("sound.music can load Tracks", function() {
    expect(2);
    stop();

    track = new p.sound.Track({
      url: shortSound,
      callback: function() {
        start();
        ok(true, "Track fires callback when being created");
        ok(track instanceof p.sound.Track);
      }
    });
  });

  test("sound.music can play Track", function() {
    expect(1);
    stop();

    var music = p.sound.music;
    music.add('track', track);
    music.muted = true;

    var audio = track.audio;

    function onEnded() {
      start();
      ok(true, "sound.music.play correctly plays Track to completion");
      audio.removeEventListener('ended', onEnded, false);
    }

    audio.addEventListener('ended', onEnded, false);

    music.play('track');
  });

}());
