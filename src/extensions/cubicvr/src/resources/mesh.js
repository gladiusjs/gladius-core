if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {

  var Mesh = function( service, data ) {
    return new service.target.context.Mesh( data );
  };

  return Mesh;

});