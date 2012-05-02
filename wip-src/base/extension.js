if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {

  var Extension = function( name, options ) {
    if( !typeof name === "string" || !name.length > 0 ) {
      throw new Error( "extension needs a non-trivial name" );
    }
    
    this.name = name;
    
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