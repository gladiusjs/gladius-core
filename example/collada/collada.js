document.addEventListener("DOMContentLoaded", function (e) {

  var canvas = document.getElementById("test-canvas");

  var game = function (engine) {
    var space = new engine.core.Space();
    var math = engine.math;

    // This is our loader function, which currently uses CubicVR's collada
    // loader. The loader has not yet been factored into its own library, so 
    // this is still necessary.
    function colladaLoader(url, onsuccess, onfailure) {
      // This is a hack to make CubicVR available to the resource
      window.CubicVR = engine.graphics.target.context;

      // CubicVR wants the directory where the dae file resides.
      var dir = url.match(/.*\//i);

      try {
        var context = engine.graphics.target.context;
        var scene = context.loadCollada(url, dir);
        onsuccess(scene);
      }
      catch (e) {
        onfailure(e);
      }
    }

    var run = function () {

      var task = new engine.scheduler.Task({
        schedule: {
          phase: engine.scheduler.phases.UPDATE
        },
        callback: function () {}
      });

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
          new space.Entity({
            name: instance.names[0],
            components: [
              new engine.core.component.Transform({
                position: instance.positions[0],
                rotation: instance.rotations[0],
                scale:    instance.scales[0]
              }),
              new engine.graphics.component.Model(
                instance.meshes[0]),
            ]
          })// entity
        },
        onfailure: function (error) {
          console.log("error loading collada resource: " + error);
        }
      }],
      {
        // This will run the example once get() has finished loading our
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