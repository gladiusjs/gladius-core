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

      test( "light definition exposes cubicvr enumerations", function() {
        expect( 7 );

        equal( LightDefinition.LightTypes.POINT, 1, "point light type is correct" );
        equal( LightDefinition.LightTypes.DIRECTIONAL, 2, "directional light type is correct" );
        equal( LightDefinition.LightTypes.SPOT, 3, "spot light type is correct" );
        equal( LightDefinition.LightTypes.AREA, 4, "area light type is correct" );

        equal( LightDefinition.LightingMethods.GLOBAL, 0, "global light method is correct" );
        equal( LightDefinition.LightingMethods.STATIC, 1, "static light method is correct" );
        equal( LightDefinition.LightingMethods.DYNAMIC, 2, "dynamic light method is correct" );
      });
      
      test( "create a new light definition, test default values", function() {
        expect( 11 );
        
        var lightDefinition = new LightDefinition();
        equal(lightDefinition.light_type, LightDefinition.LightTypes.POINT, "default light type is correct");
        deepEqual(lightDefinition.diffuse, [ 1, 1, 1 ], "default diffuse value is correct");
        deepEqual(lightDefinition.specular, [ 1.0, 1.0, 1.0 ], "default specular value is correct");
        equal(lightDefinition.intensity, 1.0, "default intensity value is correct");
        equal(lightDefinition.distance, 10, "default distance is correct");
        equal(lightDefinition.cutoff, 60, "default cutoff angle is correct");
        equal(lightDefinition.map_res, 512, "default map resolution is correct");
        equal(lightDefinition.method, LightDefinition.LightingMethods.DYNAMIC, "default light method is correct");
        equal(lightDefinition.areaCeiling, 40, "default area ceiling is correct");
        equal(lightDefinition.areaFloor, -40, "default area floor is correct");
        deepEqual(lightDefinition.areaAxis, [ 1, 1, 0 ], "default area axis is correct");
      });
      
      test( "create a new light definition, test assigned values", function() {
        expect(11);

        var data = {
          "light_type" : LightDefinition.LightTypes.DIRECTIONAL,
          "diffuse" : [ 2, 3, 4 ],
          "specular" : [ 4.0, 3.0, 2.0 ],
          "intensity" : 2.7,
          "distance" : 16,
          "cutoff" : 932,
          "map_res" : 1025,
          "method" : LightDefinition.LightingMethods.GLOBAL,
          "areaCeiling" : 2001,
          "areaFloor" : 1998,
          "areaAxis" : [17, 27, 113]
        };

        var lightDefinition = new LightDefinition(data);

        equal(lightDefinition.light_type, LightDefinition.LightTypes.DIRECTIONAL, "assigned light type is correct");
        deepEqual(lightDefinition.diffuse, [ 2, 3, 4 ], "assigned diffuse value is correct");
        deepEqual(lightDefinition.specular, [ 4.0, 3.0, 2.0 ], "assigned specular value is correct");
        equal(lightDefinition.intensity, 2.7, "assigned intensity value is correct");
        equal(lightDefinition.distance, 16, "assigned distance is correct");
        equal(lightDefinition.cutoff, 932, "assigned cutoff angle is correct");
        equal(lightDefinition.map_res, 1025, "assigned map resolution is correct");
        equal(lightDefinition.method, LightDefinition.LightingMethods.GLOBAL, "assigned light method is correct");
        equal(lightDefinition.areaCeiling, 2001, "assigned area ceiling is correct");
        equal(lightDefinition.areaFloor, 1998, "assigned area floor is correct");
        deepEqual(lightDefinition.areaAxis, [ 17, 27, 113 ], "assigned area axis is correct");
      });

    };
  }
);