/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  function KeyboardInput( messenger, element ) {

      var that = this;
      var TYPE = 'keyboard';
      var KEYMAP = {
              0: 'meta',
              16: 'shift',
              17: 'ctrl',
              18: 'alt',
              27: 'escape',
              32: 'space',
              37: 'left',
              38: 'up',
              39: 'right',
              40: 'down'
      };
      for( var key = 48; key <= 90; ++ key )
          KEYMAP[key] = String.fromCharCode( key ).toLocaleLowerCase();

      var UNDEFINED = '?';
      var ALL = '*';
      var MODIFIERS = [0, 16, 17, 18];

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

          if( KEYMAP.hasOwnProperty( event.keyCode ) )
              inputs.push( KEYMAP[event.keyCode] );
          else
              inputs.push( UNDEFINED );

          return inputs;
      };

      var hashInput = function( input, state ) {
          var result = TYPE,
            keymapKeys = Object.keys( KEYMAP ),
            hash = [],
            key,
            i;

          for( i = 0; i < keymapKeys.length; ++ i ) {
              key = keymapKeys[i];
              if( input.indexOf( KEYMAP[key]) >= 0 )
                  hash.push( key );
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

      this.handleKeyDown = function( event ) {
          event = that.Event( processEvent( event ), true );
          messenger.send( {
              event: event,
              parameters: []
          } );
      };

      this.handleKeyUp = function( event ) {
          event = that.Event( processEvent( event ), false );
          messenger.send( {
              event: event,
              parameters: []
          } );
      };

      element.addEventListener( 'keydown', this.handleKeyDown, true );
      element.addEventListener( 'keyup', this.handleKeyUp, true );

  }

  return KeyboardInput;
});
