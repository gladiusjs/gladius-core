if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define(
  [ "resources/mesh", "services/target"  ],
  function( Mesh, Target ) {
    return function() {

      module( "Mesh", {
        setup: function() {
          var canvasElement = document.getElementById("test-canvas");
          this.target = new Target( canvasElement );
          this.service = {
            target: this.target
          }},
        teardown: function() {}
      });

      test( "cubicVR mesh exists", function() {
        expect( 1 );

        var mesh = new Mesh(this.service);
        ok(mesh.hasOwnProperty("_cubicVRMesh"), "mesh is wrapping a cubic VR mesh");
      });
    };
  }
);