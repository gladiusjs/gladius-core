document.addEventListener("DOMContentLoaded", function (e) {

  var canvas = document.getElementById("test-canvas");
  var resources = {};

  var game = function (engine) {
    var space;
    var math = engine.math;

    // This is our loader function, which currently uses CubicVR's collada
    // loader. The loader has not yet been factored into its own library, so 
    // this is still necessary.
    function colladaLoader(url, onsuccess, onfailure) {
      // This is a hack to make CubicVR available to the resource
      window.CubicVR = engine.graphics.target.context;

      try {
        var context = engine.graphics.target.context;
        var scene = context.loadCollada(url, "model");
        onsuccess(scene);
      } catch (e) {
        onfailure(e);
      }
    }

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

      // Start the engine!
      engine.run();
    };

    engine.core.resource.get(
        [{
          type: engine.core.resource.Collada,
          url: "model/cube.dae",
          load: colladaLoader,
          onsuccess: function (instance) {
            // We get a space full of entities back, when we really should get
            // a template. However, templates are not yet supported.
            space = instance.space;
          },
          onfailure: function (error) {
            console.log("error loading collada resource: " + error);
          }
        }],
        {
          // This will run the example once get() has finished loading our
          // resources.
          oncomplete: run
        }
    );
  };

  // Here we create a gladius instance asynchronously. The supplied callback,
  // game, is invoked when the instance is ready to use.
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