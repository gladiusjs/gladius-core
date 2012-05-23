if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  function dispatch() {
    var dispatchList = Array.prototype.slice.call( arguments, 0 );
    var i, l;

    if( dispatchList.length > 0 && Array.isArray( dispatchList[0] ) ) {
      dispatchList = dispatchList[0];
    } 
    for( i = 0, l = dispatchList.length; i < l; ++ i ) {
      try {
        var handler = dispatchList[i];
        if( handler.handleEvent ) {
          handler.handleEvent.call( handler, this );
        }
      } catch( error ) {
        console.log( error );
      }
    }
  }

  var Event = function( type, data, queue ) {
    if( undefined === type || type.length < 1 ) {
      throw new Error( "event must have a non-trivial type" );
    }
    this.type = type;
    this.data = data;
    if( undefined === queue ) {
      queue = true;
    }
    this.queue = queue;
    this.dispatch = dispatch.bind( this );
  };

  return Event;

});