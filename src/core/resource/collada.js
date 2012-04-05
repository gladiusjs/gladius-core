/*jshint white: false, strict: false, plusplus: false, onevar: false,
 nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */
define(function (require) {

  return function (engine) {

    var Collada = new engine.base.Resource({
      type: 'Collada'
    },

    function constructCollada(scene) {

      // Resets animations to the beginning of the animation sequence.
      scene.evaluate(0);
      var objects = scene.sceneObjects;
      var cvrMesh;
      
      this.meshes = [];
      this.names = [];
      this.positions = [];
      this.rotations = [];
      this.scales = [];
      
      for (var i = 0; i < objects.length; i++) {
        var object = objects[i];

        // Some objects in the collada scene, such as cameras aren't 
        // meshes, so we can skip anything without a cvr object.
        if (object.obj) {
          cvrMesh = object.obj;

          // Convert degrees to radians since
          // CubicVR uses degrees and Gladius uses radians.
          var rotation = object.rotation;
          rotation[0] *= Math.PI / 180;
          rotation[1] *= Math.PI / 180;
          rotation[2] *= Math.PI / 180;
          
          this.meshes.push({
            mesh: {
              _cvr: {
                mesh: cvrMesh
              }
            }
          });

          this.names.push( cvrMesh.name );
          this.positions.push( object.position);
          this.rotations.push( rotation );
          this.scales.push( object.scale); 
        }
      }
    });
    return Collada;
  };
});