if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {
  
  var Extension = function( options ) {
    if( options ) {
      if( options.hasOwnProperty( "services" ) ) {
        this.services = options.services;
      }
      if( options.hasOwnProperty( "components" ) ) {
        this.components = options.components;
      }
      if( options.hasOwnProperty( "resources" ) ) {
        this.resources = options.resources;
      }
    }
  };
  
  return Extension;
  
});