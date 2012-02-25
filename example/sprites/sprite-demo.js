/*global console */

var engine;

document.addEventListener("DOMContentLoaded", function(e) {

  // TODOs
  // * instead of rotation, use walk-back and walk-front with transforms & scaling

  var canvas = document.getElementById("test-canvas");

  var game = function(engineInstance) {

    // Save the engine in the global scope so that Bitwall Model can inherit
    // from it.  A future refactoring will make this unnecessary.
    engine = engineInstance;

    // convenience vars
    var CubicVR = engine.graphics.target.context;
    var math = engine.math;
    var bitwallModel;
       
    var run = function() {

      // somewhere to put our entities
      var space = new engine.core.Space();
      
      // a entity to hold the bitwall model
      var bitwall = new space.Entity({
        name : 'walking-thug',
        components : [new engine.core.component.Transform({
          position : math.Vector3(0, 0, 0),
          rotation : math.Vector3(0, 0, 0)
        }), bitwallModel]
      });

      // set up a camera with a light so that we can actually see the
      // rotating  bitwall
      var camera = new space.Entity({
        name : 'camera',
        components : [new engine.core.component.Transform({
          position : math.Vector3(0, 0, 2)
        }), new engine.graphics.component.Camera({
          active : true,
          width : canvas.width,
          height : canvas.height,
          fov : 60
        }), new engine.graphics.component.Light({
          intensity : 2
        })]
      });
      camera.find('Camera').target = math.Vector3(0, 0, 0);


      // XXX the animation time of 10 is totally random.  It should actually
      // be something sane, probably picked to interact with the
      // simulationTime.delta as well as the speed that the spritesheet
      // includes factored in.  I suspect this code is gonna want some
      // optimization too.
      var animationTime = 10;
      var animationTimer = 0;

      // set up a task to do the animation
      var task = new engine.scheduler.Task({
        schedule : {
          phase : engine.scheduler.phases.UPDATE
        },
        callback : function() {
          
          // rotate the whole entity
          var delta = engine.scheduler.simulationTime.delta / 1000;
          bitwall.find('Transform').rotation = 
            math.matrix4.add([bitwall.find('Transform').rotation, 
                              [0, math.TAU * delta * 0.1, 0]]);

          // update the animation timer, as well as the animation if it's time
          if(!animationTimer) {
            bitwall.find('Model').updateAction();

            // reset the timer
            animationTimer = animationTime;

          } else {
            --animationTimer;
          }
        }
      });

      // Start the engine!
      engine.run();

    };

  
    // We may be sharing a copy of require.js with Gladius if we're developing
    // If so, this next line guarantees that we have a configuration of
    // require.js that loads things relative to this directory 
    var localRequire = require.config({context: "local", baseUrl: "."});

    // pull in the bitwall-model code, and once we've got it, load our sprite,
    // and run the game!
    localRequire(['bitwall-model'], function ( BitwallModel ) {
      
      bitwallModel = new BitwallModel({
        spriteURL: 'thug1.sprite',
        action: 'walk-front'
      });
      
      // initialize the model, and the 
      bitwallModel.init(function() {
        run();
      });
      
    });

  };

  gladius.create({
    debug : true,
    services : {
      graphics : {
        src : 'graphics/service',
        options : {
          canvas : canvas
        }
      }
    }
  }, game);

});
