/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
  var Component = require( './Component' );

  function SpeakerComponent( options ) {

      var sounds = {},
        volume = 1,
        muted = false,
        activeAudio = {};

      this.__defineGetter__( 'sounds', function() {
          var name,
            soundList = [];

          for ( name in sounds ) {
              if ( !sounds.hasOwnProperty( name ) ) {
                  continue;
              }
              soundList.push( sounds[name] );
          }

          return soundList;
      });

      this.add = function( name, sound ) {
          if ( !sound ) {
              throw "Paladin: Speaker expects non-null sound in add";
          }

          if ( !name ) {
              throw "Paladin: Speaker expects non-null name for track in add";
          }

          if ( sounds[name] ) {
              throw "Paladin: Speaker already contains a sound named '" + name + "'";
          }
          sounds[name] = sound;
      };

      this.remove = function( name ) {
          sounds[name] = null;
          delete sounds[name];
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
          var sound = sounds[name];
          if ( !sound ) {
              throw "Paladin: Speaker does not contain a sound named '" + name + "'";
          }

          var audio = sound.audio;
          if ( !audio ) {
              throw "Paladin: Speaker unable to play sound named '" + name + "'";
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
