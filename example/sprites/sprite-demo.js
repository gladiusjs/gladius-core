/*global Sprite, viking, console */

var engine;

document.addEventListener("DOMContentLoaded", function(e) {

  // TODOs
  // * hoist bitwall model into other file so we can iterate while andor uses
  // * instead of rotation, use walk-back and walk-front with transforms & scaling
  // * sort out the loading story
  // * make the animation speed sane

  var canvas = document.getElementById("test-canvas");

  var game = function(engineInstance) {

    // Save the engine in the global scope so that Bitwall Model can inherit
    // from it.  A future refactoring will fix this.
    engine = engineInstance;

    // convenience vars
    var CubicVR = engine.graphics.target.context;
    var math = engine.math;
       
    var thugAction = 'walk-front';

    var run = function() {

      // Make a new space for our entities
      var space = new engine.core.Space();

      // because we know the async require([]) of bitwall-model has already
      // loaded, we can get a handle to the returned constructor and instantiate
      var BitwallModel = require('../example/sprites/bitwall-model');
      var bitwall = new space.Entity({
        name : 'cube0',
        components : [new engine.core.component.Transform({
          position : math.Vector3(0, 0, 0),
          rotation : math.Vector3(0, 0, 0)
        }), new BitwallModel({
          sprite : viking.sprites.thug1
        })]
      });

      // set up a camera with a light so that we can actually see the
      // rotating sprite
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
            bitwall.find('Model').updateAction(thugAction);

            // reset the timer
            animationTimer = animationTime;

          } else {--animationTimer;
          }
        }
      });

      // Start the engine!
      engine.run();

    };
    function loadSprite() {
      viking.loadSprite('./thug1.sprite', {
        callback : run
      });
    }

    // XXX shouldn't require path contortions
    require(['../example/sprites/bitwall-model'], loadSprite);

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
