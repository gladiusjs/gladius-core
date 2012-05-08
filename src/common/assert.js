if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {
  "use strict";

  function assert( condition, message ) {
    if( !condition )
      throw new Error( message );
  }

  return assert;

});
