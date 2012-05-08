if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define(
  [ "components/light", "resources/light-definition" ],
  function( Light, LightDefinition ) {
    return function() {

      module( "Light", {
        setup: function() {},
        teardown: function() {}
      });
      

      
      test( "create a light component without a definition", function() {
        expect( 10 );
        
        var light = new Light();

        equal(light.type, LightDefinition.LightTypes.POINT, "default light type is correct");
        equal(light.diffuse, [ 1, 1, 1 ], "default diffuse value is correct");
        equal(light.specular, [ 1.0, 1.0, 1.0 ], "default specular value is correct");
        equal(light.intensity, 1.0, "default intensity value is correct");
        equal(light.distance, 10, "default distance is correct");
        equal(light.cutoff, 60, "default cutoff angle is correct");
        equal(light.map_res, 512, "default map resolution is correct");
        equal(light.method, LightDefinition.LightingMethods.GLOBAL, "default light method is correct");
        equal(light.areaCeiling, 40, "default area ceiling is correct");
        equal(light.areaFloor, -40, "default area floor is correct");
        equal(light.areaAxis, [ 1, 1, 0 ], "default area axis is correct");
      });
      
      test( "create a light with a definition", function() {

        expect( 10 );

        var data = {
          "type" : LightDefinition.LightTypes.DIRECTIONAL,
          "diffuse" : [ 2, 3, 4 ],
          "specular" : [ 4.0, 3.0, 2.0 ],
          "intensity" : 2.7,
          "distance" : 16,
          "cutoff" : 932,
          "map_res" : 1025,
          "method" : LightDefinition.LightingMethods.DYNAMIC,
          "areaCeiling" : 2001,
          "areaFloor" : 1998,
          "areaAxis" : [17, 27, 113]
        };

        var lightDefinition = new LightDefinition(data);
        var light = new Light(lightDefinition);

        equal(light.type, lightDefinition.type, "assigned light type is correct");
        equal(light.diffuse, lightDefinition.diffuse, "assigned diffuse value is correct");
        equal(light.specular, lightDefinition.specular, "assigned specular value is correct");
        equal(light.intensity, lightDefinition.intensity, "assigned intensity value is correct");
        equal(light.distance, lightDefinition.distance, "assigned distance is correct");
        equal(light.cutoff, lightDefinition.cutoff, "assigned cutoff angle is correct");
        equal(light.map_res, lightDefinition.map_res, "assigned map resolution is correct");
        equal(light.method, lightDefinition.method, "assigned light method is correct");
        equal(light.areaCeiling, lightDefinition.areaCeiling, "assigned area ceiling is correct");
        equal(light.areaFloor, lightDefinition.areaFloor, "assigned area floor is correct");
        equal(light.areaAxis, lightDefinition.areaAxis, "assigned area axis is correct");

      });

      test( "set properties through setters", function() {
        expect( 10 );

        var light = new Light();

        light.setType(LightDefinition.LightTypes.SPOT);
        light.setDiffuse([ 9, 7, 1 ]);
        light.setSpecular([ 12.0, 21.0, 53.0 ]);
        light.setIntensity(9.7);
        light.setDistance(123);
        light.setCutoff(5345);
        light.setMap_res(2054);
        light.setMethod(LightDefinition.LightingMethods.STATIC);
        light.setAreaCeiling(2006);
        light.setAreaFloor(1234);
        light.setAreaAxis([ 123, 234, 345 ]);

        equal(light.type, LightDefinition.LightTypes.SPOT, "set light type is correct");
        equal(light.diffuse, [ 9, 7, 1 ], "set diffuse value is correct");
        equal(light.specular, [ 12.0, 21.0, 53.0 ], "set specular value is correct");
        equal(light.intensity, 9.7, "set intensity value is correct");
        equal(light.distance, 123, "set distance is correct");
        equal(light.cutoff, 5345, "set cutoff angle is correct");
        equal(light.map_res, 2054, "set map resolution is correct");
        equal(light.method, LightDefinition.LightingMethods.STATIC, "set light method is correct");
        equal(light.areaCeiling, 2006, "set area ceiling is correct");
        equal(light.areaFloor, 1234, "set area floor is correct");
        equal(light.areaAxis, [ 123, 234, 345 ], "set area axis is correct");
      })

      test("functionality of onUpdate", function() {
        expect(1);
        var light = new Light();
        ok(light.hasOwnProperty("onUpdate"), "light has update handler");
      })

    };
  }
);