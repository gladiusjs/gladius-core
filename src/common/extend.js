if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {
  "use strict";

  function extend( object, extra ) {
    for ( var prop in extra ) {                
      if ( !object.hasOwnProperty( prop ) && extra.hasOwnProperty( prop ) ) {
        object[prop] = extra[prop];
      }
    }
    return object;
  }

  return extend;

});
