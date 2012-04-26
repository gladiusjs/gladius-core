if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  var Event = function( type, data ) {
    function dispatcher() {
      var i, l;
      for( i = 0, l = arguments.length; i < l; ++ i ) {
        try {
          arguments[i].handleEvent( dispatcher );
        } catch( error ) {
          console.log( error );
        }
      }
    }

    dispatcher.type = type;
    dispatcher.data = data;

    return dispatcher;

  };

  return Event;

});