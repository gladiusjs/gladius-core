if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define(
  [ "components/light", "resources/light-definition", "services/target" ],
  function( Light, LightDefinition, Target ) {
    return function() {

      module( "Light", {
        setup: function() {
          var canvasElement = document.getElementById("test-canvas");
          this.target = new Target( canvasElement );
          this.service = {
            target: this.target
          }
        },
        teardown: function() {}
      });

      test( "create a light component without a definition", function() {
        expect( 11 );

        var light = new Light(this.service);

        equal(light.light_type, LightDefinition.LightTypes.POINT, "default light type is correct");
        deepEqual(light.diffuse, [ 1, 1, 1 ], "default diffuse value is correct");
        deepEqual(light.specular, [ 1.0, 1.0, 1.0 ], "default specular value is correct");
        equal(light.intensity, 1.0, "default intensity value is correct");
        equal(light.distance, 10, "default distance is correct");
        equal(light.cutoff, 60, "default cutoff angle is correct");
        equal(light.map_res, 512, "default map resolution is correct");
        equal(light.method, LightDefinition.LightingMethods.DYNAMIC, "default light method is correct");
        equal(light.areaCeiling, 40, "default area ceiling is correct");
        equal(light.areaFloor, -40, "default area floor is correct");
        deepEqual(light.areaAxis, [ 1, 1, 0 ], "default area axis is correct");
      });

      test( "create a light with a definition", function() {

        expect( 11 );

        var data = {
          "light_type" : LightDefinition.LightTypes.DIRECTIONAL,
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
        var light = new Light(this.service, lightDefinition);

        equal(light.light_type, lightDefinition.light_type, "assigned light type is correct");
        deepEqual(light.diffuse, lightDefinition.diffuse, "assigned diffuse value is correct");
        deepEqual(light.specular, lightDefinition.specular, "assigned specular value is correct");
        equal(light.intensity, lightDefinition.intensity, "assigned intensity value is correct");
        equal(light.distance, lightDefinition.distance, "assigned distance is correct");
        equal(light.cutoff, lightDefinition.cutoff, "assigned cutoff angle is correct");
        equal(light.map_res, lightDefinition.map_res, "assigned map resolution is correct");
        equal(light.method, lightDefinition.method, "assigned light method is correct");
        equal(light.areaCeiling, lightDefinition.areaCeiling, "assigned area ceiling is correct");
        equal(light.areaFloor, lightDefinition.areaFloor, "assigned area floor is correct");
        deepEqual(light.areaAxis, lightDefinition.areaAxis, "assigned area axis is correct");

      });

      test( "set properties through setters", function() {
        expect( 11 );

        var light = new Light(this.service);

        light.light_type = LightDefinition.LightTypes.SPOT;
        light.diffuse = [ 9, 7, 1 ];
        light.specular = [ 12.0, 21.0, 53.0 ] ;
        light.intensity = 9.7;
        light.distance = 123;
        light.cutoff = 5345;
        light.map_res = 2054;
        light.method = LightDefinition.LightingMethods.STATIC;
        light.areaCeiling = 2006;
        light.areaFloor = 1234;
        light.areaAxis = [ 123, 234, 345 ];

        equal(light.light_type, LightDefinition.LightTypes.SPOT, "set light type is correct");
        deepEqual(light.diffuse, [ 9, 7, 1 ], "set diffuse value is correct");
        deepEqual(light.specular, [ 12.0, 21.0, 53.0 ], "set specular value is correct");
        equal(light.intensity, 9.7, "set intensity value is correct");
        equal(light.distance, 123, "set distance is correct");
        equal(light.cutoff, 5345, "set cutoff angle is correct");
        equal(light.map_res, 2054, "set map resolution is correct");
        equal(light.method, LightDefinition.LightingMethods.STATIC, "set light method is correct");
        equal(light.areaCeiling, 2006, "set area ceiling is correct");
        equal(light.areaFloor, 1234, "set area floor is correct");
        deepEqual(light.areaAxis, [ 123, 234, 345 ], "set area axis is correct");
      });

      test("functionality of onUpdate", function() {
        expect(1);
        var light = new Light(this.service);
        ok(light.hasOwnProperty("onUpdate"), "light has update handler");
      });

      test("cubicVR light exists", function(){
        expect(1);
        var light = new Light(this.service);
        ok(light.hasOwnProperty("_cubicVRLight"), "light is wrapping a cubic VR light");
      });

    };
  }
);