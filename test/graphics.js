/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global paladin: false, document: false, window: false, setTimeout: false,
 module, test, expect, ok, notEqual, QUnit, stop, start, asyncTest, deepEqual */

(function() {

    var p, scene, camera, model, task;

    module("graphics", {
      setup: function graphics_setup() {
        stop();

        paladin.create({
          graphics: {
            canvas: document.getElementById('test-canvas')
          }
        }, function (instance) {
          p = instance;

          scene = new p.Scene( { fov: 60 } );
          camera = new p.component.Camera({
            targeted: false,
            position: [1, 2, 3],
            rotation: [10, 20, 30]
          });
          var entity = new p.Entity();
          var mesh = new p.graphics.Mesh( {
            primitives: [ {
              type: 'box',
              size: 0.5,
              material: {
                color: [1, 0, 1]
              }
            }],
            finalize: true
          });
          model = new p.component.Model({
            mesh: mesh,
            position: [3, 6, 9],
            rotation: [15, 30, 45]
          });

          entity.addComponent( model );
          entity.addComponent( camera );
          entity.setParent( scene );

          /*
          task = p.tasker.add({
            callback: function () {
              model.object.rotation[0] += 1;
            }
          });
          */

          start();
        });

      },
      teardown: function graphics_teardown ( ) {
        p.tasker.terminate();

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
      p.graphics.pushScene( scene );
      p.run();
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
      deepEqual( camera.object.position, [1, 2, 3], "Initial camera position" );
      deepEqual( camera.object.rotation, [10, 20, 30], "Initial camera rotation" );
    });

    test( "Model setup", function () {
      expect( 2 );
      deepEqual( model.object.position, [3, 6, 9], "Initial model position" );
      deepEqual( model.object.rotation, [15, 30, 45], "Initial model rotation" );
    });

}());
