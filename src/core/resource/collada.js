/*jshint white: false, strict: false, plusplus: false, onevar: false,
 nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */
define(function (require) {

  return function (engine) {

    var Collada = new engine.base.Resource({
      type: 'Collada'
    },

    function constructCollada(scene) {

      var space = new engine.core.Space();
      this.space = space;

      // CubicVR magic
      scene.evaluate(0);
      var objects = scene.sceneObjects;
      var cvrMesh;

      for (var i = 0; i < objects.length; i++) {
        var object = objects[i];

        // Some objects in the collada scene, such as cameras aren't 
        // meshes, so we can skip anything without a cvr object.
        if (object.obj) {
          cvrMesh = object.obj;

          // convert degrees to radians since
          // cubicVR uses degrees, gladius uses radians
          var rotation = object.rotation;
          rotation[0] *= Math.PI / 180;
          rotation[1] *= Math.PI / 180;
          rotation[2] *= Math.PI / 180;

          new space.Entity({
            name: cvrMesh.name,
            components: [
            new engine.core.component.Transform({
              position: object.position,
              rotation: rotation,
              scale: object.scale
            }), new engine.graphics.component.Model({
              mesh: {
                _cvr: {
                  mesh: cvrMesh
                }
              }
            })]
          });
        }
      }
    });
    return Collada;
  };
});