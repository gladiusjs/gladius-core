


(function (window, document, Paladin, undefined) {

    // Default number of audio instances to clone
    var DEFAULT_INSTANCES = 4;

    // Cross-browser Audio() constructor
    var Audio = (function() {
      return ('Audio' in window) ?
        window.Audio :
        function() {
          return document.createElement('audio');
        };
    }());

    function nop(){}

    function AudioPool( url, instances, callback, errback ) {
      var audio = new Audio(),
        cloningDone = false, // work around https://bugzilla.mozilla.org/show_bug.cgi?id=675986
        clones = [];

      // XXXhumph do we want to have this be configurable for late load?
      audio.autobuffer = true;
      audio.preload = 'auto';

      // XXXhumph do we want to keep some kind of state to know if things worked?
      audio.onerror = function() {
        errback(audio.error);
      };
      audio.oncanplaythrough = function() {
        if (cloningDone) {
          return;
        }
        while ( instances-- ) {
         clones.push( audio.cloneNode( true ) );
        }
        cloningDone = true;
        callback();
      };
      audio.src = url;

      this.getInstance = function() {
        var clone,
          count,
          i;

        for ( i = 0, count = clones.length; i < count; i++) {
          clone = clones[i];

          if ( clone.paused || clone.ended ) {
            if ( clone.ended ) {
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
      };
    }

    function Track( options ) {
      var url = options.url;
      if ( !url ) {
        throw "Paladin Sound: you must pass a URL to Track.";
      }

      var pool = new AudioPool(
        url,
        options.instances || DEFAULT_INSTANCES,
        options.callback ?
          (function( track, callback ) {
            return function() {
              callback( track );
            };
          }( this, options.callback )) : nop,
        options.errback || nop
      );

      this.__defineGetter__( 'audio', function() {
        return pool.getInstance();
      });

      this.__defineGetter__( 'url', function() {
        return url;
      });
    }

    Track.load = function( options ) {
      var track = new Track({
        url: options.url,
        instances: options.instances,
        callback: options.callback,
        errback: options.errback
      });
    };

    function Sound( options ) {
      this.Track = Track;
    }

    Paladin.subsystem.register( "sound", Sound );

}(window, window.document, Paladin));
