/*global deepEqual,expect,module,ok,Paladin,start,stop,test,window */
(function ( window, document, undefined, Paladin ) {

    var game, scene, camera, model, task;
     
    module("graphics", {
      setup: function graphics_setup() {

        function Game() {

          Paladin.init({
            graphics: {
              canvas: document.getElementById('test-canvas')
            }
          });

          scene = new Paladin.Scene( { fov: 60 } );
          camera = new Paladin.component.Camera({ targeted: false });
          var entity = new Paladin.Entity();
          var mesh = new Paladin.graphics.Mesh( {
            primitives: [ {
              type: 'box',
              size: 0.5,
              material: {
                color: [1, 0, 1]
              }
            }],
            finalize: true
          });
          model = new Paladin.component.Model({
            mesh: mesh,
            position: [0, 0, 0],
            rotation: [0, 0, 0]
          });

          entity.addComponent( model );
          entity.addComponent( camera );
          entity.setParent( scene );

          // XXXdmose these should all be done in the initializers
          model.object.position = [3, 6, 9];
          model.object.rotation = [15, 30, 45];
          camera.camera.position = [1, 2, 3];
          camera.camera.rotation = [10, 20, 30];

          task = Paladin.tasker.add({
            callback: function () {
              model.object.rotation[0] += 1;
            }
          });

          this.run = function () {
            Paladin.run();
          };
        }

        game = new Game();
      },
      teardown: function graphics_teardown ( ) {
        Paladin.tasker.terminate();

        // XXXdmose commented out because qunit/Paladin concurrency model
        // interactions horking us.  There are likely bad hidden consequences
        // of this waiting to bite us.
        //
        // force as much to be GCed as we can
        //game = scene = camera = model = null;
      }
    });
       
    test( "Scene rendering", function () {
      expect( 1 );
      Paladin.graphics.pushScene( scene );
      game.run();
      stop();

      // XXX would be nice to have something more deterministic/less racy
      // than setTimeout for this
      setTimeout( function () { 
                    ok( scene.graphics.frames > 0, "Scene has rendered several times" );
                    start();
                }, 500 );
    });
    
    test( "Camera setup", function () {
      expect( 3 );
      scene.setActiveCamera( camera );
      ok( scene.graphics.camera === camera.camera, "Camera is correct" );
      deepEqual( camera.camera.position, [1, 2, 3], "Initial camera position" );
      deepEqual( camera.camera.rotation, [10, 20, 30], "Initial camera rotation" );
    });

    test( "Model setup", function () {
      expect( 2 );
      deepEqual( model.object.position, [3, 6, 9], "Initial model position" );
      deepEqual( model.object.rotation, [15, 30, 45], "Initial model rotation" );
    });

})( window, document, undefined, Paladin );
