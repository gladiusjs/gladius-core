/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, document: false, window: false, setTimeout: false,
 module, test, expect, ok, notEqual, QUnit, stop, start, asyncTest, equal,
 deepEqual, raises */

define( function( require ) {

  var p = require('paladin'),
    paladin,
    track,
    speaker,
    emptyArray = [],
    trackArray;

  var shortSound = "data:audio/wav;base64,UklGRswJAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YagJAAAnQJ0b4wseBTMC8gBoACwAEwAIAAMAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwls+7peJd84/6qP39/pD/0P/r//f//P/+//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+IdV49ahpfC+UEGwLoAGMAKwASAAcAAwABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACFstGrw9tm8Ej5HP3B/nb/xP/m//X/+//9//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9BXMNLnSAKDgsGmQIeAXsANQAWAAkABAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAx1RGYQtO97LX3bvx2/lb/t//g//L/+v/9//7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8NPYldQyhVEXYHNgNhAZgAQQAcAAwABQACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACDxMg56MP1mPsa/i//pv/Z/+//+P/8//7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+HFnpztTFlFTYJ9wO0AbwAUAAiAA8ABgACAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHCWz7ul4l3zj/qo/f3+kP/Q/+v/9//8//7//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////4h1Xj1qGl8L5QQbAugAYwArABIABwADAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIWy0avD22bwSPkc/cH+dv/E/+b/9f/7//3//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////0Fcw0udIAoOCwaZAh4BewA1ABYACQAEAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADHVEZhC073stfdu/Hb+Vv+3/+D/8v/6//3//v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////w09iV1DKFURdgc2A2EBmABBABwADAAFAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIPEyDnow/WY+xr+L/+m/9n/7//4//z//v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////4cWenO1MWUVNgn3A7QBvABQACIADwAGAAIAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcJbPu6XiXfOP+qj9/f6Q/9D/6//3//z//v//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////iHVePWoaXwvlBBsC6ABjACsAEgAHAAMAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhbLRq8PbZvBI+Rz9wf52/8T/5v/1//v//f////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8=";

  module("sound", {
    setup: function () {
      stop();

      p.create({
        graphics: {
          canvas: document.createElement('canvas')
        }
      }, function (instance) {
        paladin = instance;

        track = new paladin.sound.Track({
          url: shortSound,
          instances: 1, // Force a single clone to make testing audio element possible
          callback: function() {
            trackArray = [track];
            start();
          }
        });

        speaker = new paladin.component.Speaker();
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

  test("Speaker allows Tracks to be added and removed.", function() {
    expect(7);

    deepEqual(speaker.tracks, emptyArray, "Speaker has no tracks at first");

    speaker.add('blip', track);
    deepEqual(speaker.tracks, trackArray, "Adding a Track to Speaker works");
    raises(function() { speaker.add('blip', track); }, "Adding a Track name more than once fails");
    raises(function() { speaker.add('empty', null); }, "Adding a null Track fails");

    speaker.remove('blip');
    deepEqual(speaker.tracks, emptyArray, "Removing a Track from a Speaker works");
    speaker.add('blip', track);
    deepEqual(speaker.tracks, trackArray, "Adding a track after removing works");

    speaker.add('bloop', track);
    speaker.remove('bloop');
    deepEqual(speaker.tracks, trackArray, "Remove removes the proper track");
  });

  test("Track gets created properly", function() {
    expect(3);

    raises(function() { new paladin.sound.Track({url: null}); }, "Track constructor expects a url");
    equal(track.url, shortSound, "Track url property holds correct url");
    ok(track.audio instanceof HTMLAudioElement, "Track audio property returns an audio element");
  });

  test("Track handles errors in constructor", function() {
    expect(1);
    stop();

    var badTrack = new paladin.sound.Track({
      url: "garbage",
      errback: function() {
        start();
        ok(true, "Track fires errback when there is an error create a Track");
      }
    });
  });

  test("Track fires callback in constructor", function() {
    expect(1);
    stop();

    var goodTrack = new paladin.sound.Track({
      url: shortSound,
      callback: function() {
        start();
        ok(true, "Track fires callback when creating a Track");
      }
    });
  });

  test("Track.load fires callback", function() {
    expect(2);
    stop();

    paladin.sound.Track.load({
      url: shortSound,
      instances: 1,
      callback: function(t) {
        start();
        ok(t instanceof paladin.sound.Track, "Track is a paladin.sound.Track object");
        equal(t.url, track.url, "Track.load fires callback with reference to correct Track object");
      }
    });
  });

  test("Track.load fires errback", function() {
    expect(1);
    stop();

    paladin.sound.Track.load({
      url: "garbage",
      instances: 1,
      errback: function() {
        start();
        ok(true, "Track.load fires errback when there is an error creating a Track object");
      }
    });
  });

  test("Speaker can play Track", function() {
    expect(1);
    stop();

    var testSpeaker = new paladin.component.Speaker();
    testSpeaker.add('blip', track);
    testSpeaker.muted = true;

    var audio = track.audio;

    function onEnded() {
      start();
      ok(true, "Speaker.play correctly plays track to completion");
      audio.removeEventListener('ended', onEnded, false);
    }

    audio.addEventListener('ended', onEnded, false);

    testSpeaker.play('blip');
  });

  test("Speaker can pause named Track", function() {
    expect(1);
    stop();

    var testSpeaker = new paladin.component.Speaker();
    testSpeaker.add('blip', track);
    testSpeaker.muted = true;

    function onPause() {
      start();
      ok(true, "Speaker.pause(name) correctly pauses track");
      audio.removeEventListener('pause', onPause, false);
    }

    var audio = track.audio;
    audio.addEventListener('pause', onPause, false);

    testSpeaker.play('blip');
    testSpeaker.pause('blip');
  });

  test("Speaker can pause all playing Tracks", function() {
    expect(1);
    stop();

    var testSpeaker = new paladin.component.Speaker();
    testSpeaker.add('blip', track);
    testSpeaker.muted = true;

    function onPause() {
      start();
      ok(true, "Speaker.pause() correctly pauses track");
      audio.removeEventListener('pause', onPause, false);
    }

    var audio = track.audio;
    audio.addEventListener('pause', onPause, false);

    testSpeaker.play('blip');
    testSpeaker.pause();
  });

});
