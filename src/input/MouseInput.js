/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, MouseEvent: false, DOMMouseScroll: false */

define( function ( require ) {

  function MouseInput( messenger, element ) {

      var that = this;
      var TYPE = 'mouse';
      var KEYMAP = {
              0: 'meta',
              16: 'shift',
              17: 'ctrl',
              18: 'alt'
      };
      var BUTTONMAP = {
              0: 'mouse1',
              1: 'mouse3',
              2: 'mouse2'
      };
      var WHEELMAP = {
              0: 'wheel-up',
              1: 'wheel-down'
      };
      var UNDEFINED = '?';
      var ALL = '*';
      var MODIFIERS = [0, 16, 17, 18];

      var position = {
              x: undefined,
              y: undefined
      };

      var updateInputState = function( event ) {
          position.x = event.pageX;
          position.y = event.pageY;
      };

      var processEvent = function( event ) {
          var inputs = [];

          if( event.shiftKey || 16 === event.keyCode )
              inputs.push( KEYMAP[16] );
          if( event.ctrlKey || 17 === event.keyCode )
              inputs.push( KEYMAP[17] );
          if( event.altKey || 18 === event.keyCode )
              inputs.push( KEYMAP[18] );
          if( event.metaKey || 0 === event.keyCode )
              inputs.push( KEYMAP[0] );

          if( event instanceof MouseEvent &&
                  BUTTONMAP.hasOwnProperty( event.button ) )
              inputs.push( BUTTONMAP[event.button] );
          else if( event instanceof DOMMouseScroll )
              inputs.push( (event.detail < 0) ? WHEELMAP[0] : WHEELMAP[1] );
          else
              inputs.push( UNDEFINED );

          updateInputState( event );
          return inputs;
      };

      var hashInput = function( input, state ) {
          var result = TYPE,
            keymapKeys = Object.keys( KEYMAP ),
            buttonmapKeys = Object.keys( BUTTONMAP ),
            wheelmapKeys = Object.keys( WHEELMAP ),
            button,
            hash = [],
            key,
            i;

          for( i = 0; i < keymapKeys.length; ++ i ) {
              key = keymapKeys[i];
              if( input.indexOf( KEYMAP[key] ) >= 0 )
                  hash.push( key );
          }
          result += ':' + hash.join( '-' );

          hash = [];

          for( i = 0; i < buttonmapKeys.length; ++ i ) {
              button = buttonmapKeys[i];
              if( input.indexOf( BUTTONMAP[button] ) >= 0 ) {
                  hash.push( button );
              }
          }
          result += ':' + hash.join( '-' );

          hash = [];

          for( i = 0; i < wheelmapKeys.length; ++ i ) {
              var wheel = wheelmapKeys[i];
              if( input.indexOf( WHEELMAP[wheel] ) >= 0 ) {
                  hash.push( wheel );
              }
          }
          result += ':' + hash.join( '-' );

          result += ':';
          if( state !== null )
              result += state ? 'true' : 'false';

          return result;
      };

      this.Event = function( input, state ) {
          return hashInput( input, state );
      };

      this.handleMouseDown = function( event ) {
          event = that.Event( processEvent( event ), true );
          messenger.send( {
              event: event,
              parameters: [position]
          } );
      };

      this.handleMouseUp = function( event ) {
          event = that.Event( processEvent( event ), false );
          messenger.send( {
              event: event,
              parameters: [position]
          } );
      };

      this.handleMouseWheel = function( event ) {
          event = that.Event( processEvent( event ), null );
          messenger.send( {
              event: event,
              parameters: [position]
          } );
      };

      this.handleMouseMove = function( event ) {
          processEvent( event );
      };

      element.addEventListener( 'mousedown', this.handleMouseDown, true );
      element.addEventListener( 'mouseup', this.handleMouseUp, true );
      element.addEventListener( 'DOMMouseScroll', this.handleMouseWheel, true );
      element.addEventListener( 'mousemove', this.handleMouseMove, true );

  }

  return MouseInput;
});
