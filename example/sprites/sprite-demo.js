/*global console */

var engine;

document.addEventListener("DOMContentLoaded", function(e) {

  var canvas = document.getElementById("test-canvas");

  var game = function(engineInstance) {

    // Save the engine in the global scope so that Bitwall Model can inherit
    // from it.  A future refactoring will make this unnecessary.
    engine = engineInstance;

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
          position : math.Vector3(1, 1, 2)
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

      var moveSpeed = 0.001;    // move distance per millisecond
      var animationFrameTime = 0.2 / moveSpeed;
      var animationTimer = 0;      
      var direction = 1;
      var actions = [ 'walk-front', 'walk-back' ];
      var currentAction = 0;    // index into actions array

      // set up a task to do the animation
      var task = new engine.scheduler.Task({
        schedule : {
          phase : engine.scheduler.phases.UPDATE
        },
        callback : function() {
          
          var delta = engine.scheduler.simulationTime.delta;    // time delta from previous frame
          var maxWalk = 1;  // maximum walk distance for sprite
          var directionChanged = false;          
          
          // update direction and animation if sprite has moved too far
          var position = bitwall.find( 'Transform' ).position;
          if( Math.abs( position[2] ) > maxWalk ) {
              position = [0, 0, direction * maxWalk];   // reset our position to maxWalk              
              currentAction = (++ currentAction) % 2;   // flip the walk animation
              bitwall.find( 'Model' ).currentAction = actions[currentAction];
              
              direction *= -1;
              directionChanged = true;
          }
          // update sprite position
          bitwall.find( 'Transform' ).position = math.vector3.add(
                  position,
                  [0, 0, direction * delta * moveSpeed]
          );
          
          // update the timer sprite animation
          animationTimer += delta;
          if( directionChanged ) {
              // reset the animation if we've changed direction
              bitwall.find('Model').updateAction();  
              animationTimer = 0;
          } else {
              // advance the animation to the correct state before we render
              while( animationTimer >= animationFrameTime ) {
                  bitwall.find('Model').updateAction();
                  animationTimer -= animationFrameTime;
              }
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
