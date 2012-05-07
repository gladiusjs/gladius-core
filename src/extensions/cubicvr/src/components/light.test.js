if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define(
  [ "components/light" ],
  function( Light ) {
    return function() {

      module( "Light", {
        setup: function() {},
        teardown: function() {}
      });
      
      test( "light exposes cubicvr enumerations", function() {
        expect( 7 );
        
        equal( Light.POINT, 1, "point light type is correct" );
        equal( Light.DIRECTIONAL, 2, "directional light type is correct" );
        equal( Light.SPOT, 3, "spot light type is correct" );
        equal( Light.AREA, 4, "area light type is correct" );
        
        equal( Light.GLOBAL, 0, "global light method is correct" );
        equal( Light.STATIC, 1, "static light method is correct" );
        equal( Light.DYNAMIC, 2, "dynamic light method is correct" );
      });
      
      test( "create a light component without a definition", function() {
        expect( 0 );
        
        var light = new Light();
        
        equal( light.type, Light.POINT, "default light type is correct" );
      });
      
      test( "create a light with a definition", function() {
        expect( 0 );
      });

    };
  }
);