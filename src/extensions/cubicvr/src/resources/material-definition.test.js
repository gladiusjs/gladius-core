if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define(
  [ "resources/material-definition" ],
  function( MaterialDefinition ) {
    return function() {

      module( "MaterialDefinition", {
        setup: function() {},
        teardown: function() {}
      });

      var basicTex = [enums.texture.map.REFLECT,
        enums.texture.map.SPECULAR,
        enums.texture.map.NORMAL,
        enums.texture.map.BUMP];

      test( "material definition exposes cubicvr enumerations", function() {
        expect( 4 );

        equal( MaterialDefinition.MapTypes.REFLECT, 1, "point material type is correct" );
        equal( MaterialDefinition.MapTypes.SPECULAR, 2, "directional material type is correct" );
        equal( MaterialDefinition.MapTypes.NORMAL, 3, "spot material type is correct" );
        equal( MaterialDefinition.MapTypes.BUMP, 4, "area material type is correct" );
      });

      test( "create a new material definition, test default values", function() {
        expect( 11 );

        var materialDefinition = new MaterialDefinition();

        //TODO: Finish this list of attributes that are present
        deepEqual(materialDefinition.diffuse, [ 1.0, 1.0, 1.0 ], "default diffuse value is correct");
        deepEqual(materialDefinition.specular, [ 0.1, 0.1, 0.1 ], "default specular value is correct");
        deepEqual(materialDefinition.color, [ 1, 1, 1 ], "default color value is correct");
        deepEqual(materialDefinition.ambient, [ 0, 0, 0 ], "default ambient value is correct");
        equal(materialDefinition.name, null, "default name value is correct");
        equal(materialDefinition.visible, true, "default visibility is correct");
        equal(materialDefinition.friction, 0.3, "default friction is correct");
        equal(materialDefinition.collision, true, "default collision is correct");
        equal(materialDefinition.opacity, 1.0, "default opacity is correct");
        equal(materialDefinition.shininess, 1.0, "default shininess is correct");
        equal(materialDefinition.max_smooth, 60.0, "default max_smooth is correct");
        equal(materialDefinition.env_amount, 0.75, "default env_amount is correct");
        equal(materialDefinition.morph, false, "default morph is correct");
        equal(materialDefinition.color_map, false, "default color_map is correct");
        deepEqual(materialDefinition.uvOffset, [ 0, 0 ], "default uv offset is correct");
        equal(materialDefinition.noFog, false, "default fog value is correct");

      });

      test( "create a new material definition, test assigned values", function() {
        expect(11);

        var data = {
          "material_type" : MaterialDefinition.MaterialTypes.DIRECTIONAL,
          "diffuse" : [ 2, 3, 4 ],
          "specular" : [ 4.0, 3.0, 2.0 ],
          "intensity" : 2.7,
          "distance" : 16,
          "cutoff" : 932,
          "map_res" : 1025,
          "method" : MaterialDefinition.MaterialingMethods.GLOBAL,
          "areaCeiling" : 2001,
          "areaFloor" : 1998,
          "areaAxis" : [17, 27, 113]
        };

        var materialDefinition = new MaterialDefinition(data);

        equal(materialDefinition.material_type, MaterialDefinition.MaterialTypes.DIRECTIONAL, "assigned material type is correct");
        deepEqual(materialDefinition.diffuse, [ 2, 3, 4 ], "assigned diffuse value is correct");
        deepEqual(materialDefinition.specular, [ 4.0, 3.0, 2.0 ], "assigned specular value is correct");
        equal(materialDefinition.intensity, 2.7, "assigned intensity value is correct");
        equal(materialDefinition.distance, 16, "assigned distance is correct");
        equal(materialDefinition.cutoff, 932, "assigned cutoff angle is correct");
        equal(materialDefinition.map_res, 1025, "assigned map resolution is correct");
        equal(materialDefinition.method, MaterialDefinition.MaterialingMethods.GLOBAL, "assigned material method is correct");
        equal(materialDefinition.areaCeiling, 2001, "assigned area ceiling is correct");
        equal(materialDefinition.areaFloor, 1998, "assigned area floor is correct");
        deepEqual(materialDefinition.areaAxis, [ 17, 27, 113 ], "assigned area axis is correct");
      });

    };
  }
);