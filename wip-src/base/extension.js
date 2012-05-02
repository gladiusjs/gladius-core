if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {

  var Extension = function( options ) {
    options = options || {};
    if( options.hasOwnProperty( "services" ) ) {
      this.services = options.services;
    } else {
      this.services = {};
    }
    if( options.hasOwnProperty( "components" ) ) {
      this.components = options.components;
    } else {
      this.components = {};
    }
    if( options.hasOwnProperty( "resources" ) ) {
      this.resources = options.resources;
    } else {
      this.resources = {};
    }
  };

  return Extension;

});