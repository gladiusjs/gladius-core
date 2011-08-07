/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
  var Component = require( './Component' );

  function SpeakerComponent( options ) {

      var tracks = {},
        volume = 1,
        muted = false,
        activeAudio = {};

      this.__defineGetter__( 'tracks', function() {
          var name,
            trackList = [];

          for ( name in tracks ) {
              if ( !tracks.hasOwnProperty( name ) ) {
                  continue;
              }
              trackList.push( tracks[name] );
          }

          return trackList;
      });

      this.add = function( name, track ) {
          if ( !track ) {
              throw "Paladin: Speaker expects non-null track in add";
          }

          if ( !name ) {
              throw "Paladin: Speaker expects non-null name for track in add";
          }

          if ( tracks[name] ) {
              throw "Paladin: Speaker already contains track named '" + name + "'";
          }
          tracks[name] = track;
      };

      this.remove = function( name ) {
          tracks[name] = null;
          delete tracks[name];
      };

      this.pause = function( name ) {
          var audioList,
            audio,
            audioName,
            key;

          for( audioName in activeAudio ) {
              if ( !activeAudio.hasOwnProperty( audioName ) ) {
                  continue;
              }

              if ( name && name !== audioName ) {
                  continue;
              }

              audioList = activeAudio[audioName];
              for ( key in audioList ) {
                  if ( !audioList.hasOwnProperty( key ) ) {
                      continue;
                  }

                  audio = audioList[key];
                  if ( !audio.paused ) {
                      audio.pause();
                  }
              }
          }
      };

      this.play = function( name ) {
          // XXXhumph - what to do when play called after pause?
          var track = tracks[name];
          if ( !track ) {
              throw "Paladin: Speaker does not contain a track named '" + name + "'";
          }

          var audio = track.audio;
          if ( !audio ) {
              throw "Paladin: Speaker unable to play track named '" + name + "'";
          }

          // Use Speaker's volume settings
          audio.muted = muted;
          audio.volume = volume;

          // Cache this audio until it's finished playing, in case of pause()
          if ( !activeAudio[name] ) {
              activeAudio[name] = {};
          }
          var audioList = activeAudio[name],
            key = Date.now();
          audioList[key] = audio;
          audio.onended = function() {
              audioList[key] = null;
              delete audioList[key];
          };

          audio.play();
      };

      this.__defineGetter__( 'volume', function() {
          return volume;
      });

      this.__defineSetter__( 'volume', function(v) {
          v = v < 0 ? 0 : v;
          v = v > 1 ? 1 : v;
          volume = v;
      });

      this.__defineGetter__( 'muted', function() {
          return muted;
      });

      this.__defineSetter__( 'muted', function(m) {
          muted = !!m;
      });
  }
  SpeakerComponent.prototype = new Component( {
      type: 'sound'
  } );

  return SpeakerComponent;
});
