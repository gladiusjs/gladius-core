/**
 * SoundEffects - simple API for loading, managing, playing sound effects.
 *
 * API Info:
 * ---------
 *
 *  - SoundEffects.init(config) - load sounds into SoundEffects.  The config
 *    object should include the following properties:
 *
 *      - sounds: an object with audio src values keyed by name
 *      - channels: an (optional) number of channels to create (4 by default)
 *      - callback: an (optional) callback function when readyState is READY.
 *
 *  - SoundEffects.play(soundName) - plays the sound named soundName, which was
 *    previously loaded via init().  NOTE: you must load sounds via init() before
 *    calling play().
 *
 *  - SoundEffects.readyState - a readonly property indicating the state of the
 *    SoundEffects object.  Possible states are: EMPTY, LOADING, READY.  Sounds
 *    can be played once the READY state has been reached.
 *
 *  - SoundEffects.effectNames - a readonly property of sound effect names loaded
 *    into SoundEffects.  NOTE: you must load sounds via init() before accessing
 *    effectNames.
 *
 *  - SoundEffects.volume - a read/write property that sets the volume to be used
 *    for all sound effects. The volume must be a value between 0 and 1.0.
 *
 *  - SoundEffects.muted - a read/write property that determines whether any
 *    sound should be made when playing sound effects.
 *
 * Sample Code:
 * ------------
 *
 *  Using SoundEffects looks like this:
 *
 *      var fx = SoundEffects,
 *         sound = {'explosion': 'data:audio/wav;base64,UklGRo6EAABXQVZFZm10I...'};
 *
 *     fx.init({
 *       sounds: sounds, // an object containing audio effect src strings, keyed by effect name
 *       callback: function() { // effects are ready to be played now...
 *       }
 *     });
 *
 *     fx.play('explosion');
 *
 * Credits:
 * --------
 *
 * Written by David Humphrey (@humphd) with multi-channel inspiration from
 * http://www.phoboslab.org/log/2011/03/multiple-channels-for-html5-audio
 */

var SoundEffects = (function(global, nop) {

  var readyState = 0,
    globalVolume = 1.0,
    globalMuted = false,
    cloneCount,
    readyCallback = nop,
    audioSources = {},
    audioNames = [],
    audioPending = 0,
    fx = {

      // Ready State Values
      EMPTY: 0,
      LOADING: 1,
      READY: 2,

      get readyState() {
        return readyState;
      },

      get effectNames() {
        if (readyState < fx.READY) {
          throw "SoundEffects: invalid state.  You must call init() before accessing effectNames.";
        }
        return audioNames.slice(0);
      },

      get volume() {
        return globalVolume;
      },

      set volume(v) {
        // Normalize to a value between 0 and 1.0
        v = v < 0 ? 0 : v;
        v = v > 1.0 ? 1.0 : v;

        globalVolume = v;
      },

      get muted() {
        return globalMuted;
      },

      set muted(m) {
        globalMuted = !!m;
      },

      init: function(config) {
        if (readyState !== this.EMPTY) {
          throw "SoundEffects: invalid state.  You can only call init() once.";
        }

        cloneCount = config.channels || 4;
        readyCallback = config.callback || nop;
        var sounds = config.sounds;

        if (!sounds) {
          throw "SoundEffects: missing sounds object to init().";
        }
        loadSounds(sounds);
      },

      play: function(name) {
        if (readyState !== fx.READY) {
          throw "SoundEffects: invalid state.  You must call init() before calling play().";
        }

        if (!audioSources[name]) {
          throw "SoundEffects: no sound named '" + name + "'";
        }

        var audio = findAvailable(name);
        audio.volume = globalVolume;
        audio.muted = globalMuted;
        audio.play();
      }
    };

  function audioPlayable(audio, name) {
    audioPending--;
    audioNames.push(name);
    audioSources[name] = [];

    for (var i=0; i < cloneCount; i++) {
      audioSources[name].push(audio.cloneNode(true));
    }

    if (audioPending === 0) {
      readyState = fx.READY;
      readyCallback();
    }
  }

  function buildCallback(audio, name) {
    return function() {
      audioPlayable(audio, name);
    };
  }

  function loadSounds(sounds) {
    var name,
        audio;

    for (name in sounds) {
      if (!sounds.hasOwnProperty(name)) {
        continue;
      }

      audioPending++;

      audio = new Audio();
      audio.autobuffer = true;
      audio.preload = 'auto';
      audio.oncanplaythrough = buildCallback(audio, name);
      audio.src = sounds[name];
    }

    if (audioPending > 0) {
      readyState = fx.LOADING;
    }
  }

  function findAvailable(name) {
    var clones = audioSources[name],
        clone;

    if (!clones) {
      throw "SoundEffects: unable to find an effect named '" + name + "'";
    }

    for (var i = 0; i < cloneCount; i++) {
      clone = clones[i];

      if (clone.paused || clone.ended) {
        if (clone.ended) {
          clone.currentTime = 0;
        }
        return clone;
      }
    }

    // Rewind first one if none are available
    clone = clones[0];
    clone.pause();
    clone.currentTime = 0;

    return clone;
  }

  return fx;

}(window, function(){}));
