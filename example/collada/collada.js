document.addEventListener("DOMContentLoaded", function (e) {

  var canvas = document.getElementById("test-canvas");
  var resources = {};

  var game = function (engine) {
      var space;
      var math = engine.math;

      function colladaLoader(url, onsuccess, onfailure) {
        // XXX figure out why this is necessary
        window.CubicVR = engine.graphics.target.context;

        try {
          var context = engine.graphics.target.context;
          var scene = context.loadCollada(url, "model");
          onsuccess(scene);
        } catch (e) {
          onfailure(e);
        }
      }

      //
      var CubicVR = engine.graphics.target.context;
      CubicVR.setGlobalAmbient([1, 1, 1]);

      //
      var run = function () {

          canvas = engine.graphics.target.element;

          var camera = new space.Entity({
            name: 'camera',
            components: [
            new engine.core.component.Transform({
              position: math.Vector3(3, 3, 3)
            }), new engine.graphics.component.Camera({
              active: true,
              width: canvas.width,
              height: canvas.height,
              fov: 60
            })]
          });
          camera.find('Camera').target = math.Vector3(0, 0, 0);

          var task = new engine.scheduler.Task({
            schedule: {
              phase: engine.scheduler.phases.UPDATE,
            },
            callback: function () {}
          });

          // Start the engine!
          engine.run();
        };

      engine.core.resource.get([{
        type: engine.core.resource.Collada,
        url: "model/cube.dae",
        load: colladaLoader,
        onsuccess: function (instance) {
          space = instance.space;
        },
        onfailure: function (error) {
          console.log("error loading collada resource: " + error);
        }
      }], {
        oncomplete: run
      });
    };

  gladius.create({
    debug: true,
    services: {
      graphics: {
        src: 'graphics/service',
        options: {
          canvas: canvas
        }
      }
    }
  }, game);

});