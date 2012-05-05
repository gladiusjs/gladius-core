if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {

  var guid = require( "common/guid" );
  require( "extension-lib/CubicVR" );

  var Target = function(element){
    this.element = element;
    this.context = CubicVR.init({
      context: guid(),
      canvas: this.element
    });
  };

  return Target;

});