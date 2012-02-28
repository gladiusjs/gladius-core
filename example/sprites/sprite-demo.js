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


      // XXX the animation time of 10 is totally random.  It should actually
      // be something sane, probably picked to interact with the
      // simulationTime.delta as well as the speed that the spritesheet
      // includes factored in.  I suspect this code is gonna want some
      // optimization too.
      var animationTime = 200;
      var animationTimer = 0;      
      var direction = 1;
      var actions = [ 'walk-front', 'walk-back' ];
      var currentAction = 0;

      // set up a task to do the animation
      var task = new engine.scheduler.Task({
        schedule : {
          phase : engine.scheduler.phases.UPDATE
        },
        callback : function() {
          
          var delta = engine.scheduler.simulationTime.delta / 1000;
          var maxWalk = 1;
          var directionChanged = false;
          animationTimer += engine.scheduler.simulationTime.delta;
          
          var position = bitwall.find( 'Transform' ).position;
          if( Math.abs( position[2] ) > maxWalk ) {
              position = [0, 0, direction * maxWalk];
              direction *= -1;
              currentAction = (++ currentAction) % 2;
              bitwall.find( 'Model' ).currentAction = actions[currentAction];
              directionChanged = true;
          }
          bitwall.find( 'Transform' ).position = math.vector3.add(
                  position,
                  [0, 0, direction * delta * 1]
          );
          
          if( directionChanged ) {
              bitwall.find('Model').updateAction();  
              animationTimer = 0;
          } else {
              while( animationTimer >= animationTime ) {
                  bitwall.find('Model').updateAction();
                  animationTimer -= animationTime;
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
