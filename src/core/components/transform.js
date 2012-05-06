if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {
  
  var Component = require( "base/component" );
  
  var Transform = function() {
    
  };
  Transform.prototype = new Component();
  Transform.prototype.constructor = Transform;
  
  return Transform;
  
});