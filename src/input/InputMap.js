/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  function InputMap( paladin, entity ) {

      var map = {};
      var that = this;

      this.add = function( destinationEvent, sourceEvent ) {
          if( !map.hasOwnProperty( sourceEvent ) )
              map[sourceEvent] = [];
              entity.listen( {
                  event: sourceEvent,
                  callback: dispatch,
                  parameters: [ sourceEvent ],
                  persistent: true
              } );
          map[sourceEvent].push( destinationEvent );
      };

      this.remove = function( destinationEvent, sourceEvent ) {
          if( map.hasOwnProperty( sourceEvent ) ) {
              var index = map[sourceEvent].indexOf( destinationEvent );
              if( index >= 0 ) {
                  map[sourceEvent].remove( destinationEvent );
                  if( 0 === map[sourceEvent].length ) {
                      entity.ignore( {
                          event: sourceEvent
                      } );
                      delete map[sourceEvent];
                  }
              }
          }
      };

      var dispatch = function( parameters ) {
          var sourceEvent = parameters[0];
          if( map.hasOwnProperty( sourceEvent ) ) {
              for( var i = 0; i < map[sourceEvent].length; ++ i ) {
                  entity.send( {
                      event: map[sourceEvent][i]
                  } );
              }
          }
      };

  }

  return InputMap;
});
