if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  var Event = function( type, data, queue ) {
    function dispatcher() {
      var i, l;
      for( i = 0, l = arguments.length; i < l; ++ i ) {
        try {
          var handler = arguments[i];
          if( handler.handleEvent ) {
            handler.handleEvent( dispatcher );
          }
        } catch( error ) {
          console.log( error );
        }
      }
    }

    dispatcher.type = type;
    dispatcher.data = data;
    dispatcher.queue = undefined !== queue ? queue : true;

    return dispatcher;

  };

  return Event;

});