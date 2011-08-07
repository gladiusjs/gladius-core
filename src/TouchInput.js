/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  function TouchInput( messenger, element ) {

      var that = this,
        TYPE = 'touch',
        KEYMAP = {
          0: 'meta',
          16: 'shift',
          17: 'ctrl',
          18: 'alt'
        },
        touch,
        UNDEFINED = '?',
        ALL = '*',
        MODIFIERS = [0, 16, 17, 18],
        activeTouches = {};

      var updateInputState = function( event ) {
          var touches = event.changedTouches,
            touch;
          switch( event.type ) {
          case "touchstart":
          case "touchmove":
              for( touch in touches )
                  activeTouches[touch.identifier] = touch;
              break;
          case "touchend":
          case "touchcancel":
              for( touch in touches )
                  delete activeTouches[touch.identifier];
              break;
          }
      };

      var processEvent = function( event ) {
          var inputs = [];

          updateInputState( event );
          return inputs;
      };

      var hashInput = function( input, state ) {
          var result = TYPE,
            key;

          var hash = [];
          for( key in Object.keys( KEYMAP ) ) {
              if( input.indexOf( KEYMAP[key] ) >= 0 )
                  hash.push( key );
          }
          result += ':' + hash.join( '-' );

          result += ':';
          if( null !== state )
              result += state ? 'true' : 'false';

          return result;
      };

      this.Event = function( input, state ) {
          return hashInput( input, state );
      };

      var buildParameterList = function( touches ) {
          var parameters = [],
            touch;
          for( var i = 0; i < touches.length; ++ i ) {
              touch = touches[i];
              parameters.push( {
                  identifier: touch.identifier,
                  position: {
                      x: touch.pageX,
                      y: touch.pageY
                  }
              } );
          }
          return parameters;
      };

      this.handleTouchStart = function( event ) {
          console.log( event );
          event.preventDefault();
          var options = {
              event: that.Event( processEvent( event ), true ),
              parameters: buildParameterList( event.changedTouches )
          };
          messenger.send( options );
      };

      this.handleTouchEnd = function( event ) {
          console.log( event );
          event.preventDefault();
          var options = {
              event: that.Event( processEvent( event ), false ),
              parameters: buildParameterList( event.changedTouches )
          };
          messenger.send( options );
      };

      this.handleTouchCancel = function( event ) {
          event = that.Event( processEvent( event ), false );
          messenger.send( {
              event: event,
              parameters: buildParameterList( event.changedTouches )
          } );

      };

      this.handleTouchMove = function( event ) {
          console.log( event );
          event.preventDefault();
          processEvent( event );
      };

      element.addEventListener( 'touchstart', this.handleTouchStart, true );
      element.addEventListener( 'touchend', this.handleTouchEnd, true );
      element.addEventListener( 'touchcancel', this.handleTouchCancel, true );
      element.addEventListener( 'touchmove', this.handleTouchMove, true );
  }

  return TouchInput;
});
