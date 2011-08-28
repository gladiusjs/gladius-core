/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  /***
   * Messenger
   *
   * Provide a mechanism for game entities to listen for events and to send
   * events. An event is an arbitrary string. Some Javascript events are
   * handled here and converted to game engine events so that entities can
   * listen for them.
   */
  function Messenger() {

      var callbacks = {};

      this.listen = function( options ) {
          var id = options.entity.getId();

          if( !callbacks.hasOwnProperty( options.event ) )
              callbacks[options.event] = {};

          callbacks[options.event][id] = {
              callback: options.callback.bind( options.entity ),
              parameters: options.parameters,
              persistent: options.persistent
          };
      };

      this.ignore = function( options ) {
          if( callbacks.hasOwnProperty( options.event ) ) {
              var listeners = callbacks[options.event];
              if( listeners.hasOwnProperty( options.entity.getId() ) )
                  delete listeners[options.entity.getId()];
              if( 0 === Object.keys( listeners ).length )
                  delete callbacks[options.event];
          }
      };

      this.ignoreAll = function( options ) {
          // Not implemented.
      };

      this.send = function( options ) {
          if( callbacks.hasOwnProperty( options.event ) ) {
              listeners = callbacks[options.event];
              for( var id in listeners ) {
                  var callback = listeners[id].callback,
                      parameters = listeners[id].parameters,
                      persistent = listeners[id].persistent;
                  
                  callback( parameters.concat( options.parameters ) );
                  if( !persistent )
                      delete listeners[id];
              }
              if( 0 == Object.keys( listeners ).length )
                  delete callbacks[options.event];
          }
      };

      var hashInput = function( name, state ) {
          var result = 'client:' + name;

          result += ':';
          if( null !== state )
              result += state ? 'true' : 'false';

          return result;
      };

      this.Event = function( name, state ) {
          return hashInput( name, state );
      };

  }

  return Messenger;

});
