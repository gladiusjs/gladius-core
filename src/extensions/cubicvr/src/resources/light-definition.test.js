if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define(
  [ "resources/light-definition" ],
  function( LightDefinition ) {
    return function() {

      module( "LightDefinition", {
        setup: function() {},
        teardown: function() {}
      });
      
      test( "create a new light definition, default values", function() {
        expect( 0 );
        
        
      });
      
      test( "", function() {
        
      });

    };
  }
);