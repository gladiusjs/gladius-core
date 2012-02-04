/*jshint white: false, strict: false, plusplus: false, onevar: false,
 nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define(function(require) {

  return function(engine) {

    var Collada = new engine.base.Resource({
      type : 'Collada'
    },

    // sceneObject
    function constructCollada(scene) {

      function FauxMesh(sceneObject) {
        this.isCollada = true;

        this._cvr = {};
        var _cvrMesh = sceneObject;
        this._cvr.mesh = _cvrMesh;

        this._cvr.mesh.rotation[0] *= Math.PI / 180;
        this._cvr.mesh.rotation[1] *= Math.PI / 180;
        this._cvr.mesh.rotation[2] *= Math.PI / 180;
      }


      scene.evaluate(0);
      // CubicVR magic

      var sceneObjects = scene.sceneObjects;

      var space = new engine.core.Space();

      for(var i = 0; i < sceneObjects.length; i++) {

        var sceneObject = sceneObjects[i];
        if(sceneObject.mesh && !sceneObject.mesh.obj) {
          continue;
        }

        var mesh = new FauxMesh(sceneObject);

        var entity = new space.Entity({
          name : "My Awesome Entity " + i,
          components : [new engine.core.component.Transform({
            rotation : mesh._cvr.mesh.rotation,
            position : mesh._cvr.mesh.position,
            scale : mesh._cvr.mesh.scale
          }), new engine.graphics.component.Model({
            mesh : mesh
          })]
        });
      }

      this.value = space;

    });
    return Collada;
  };
});
