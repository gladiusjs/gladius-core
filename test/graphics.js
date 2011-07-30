/*global deepEqual,expect,module,ok,Paladin,start,stop,test,window */
(function ( window, document, Paladin, undefined ) {

    var paladin, scene, camera, model, task;
     
    module("graphics", {
      setup: function graphics_setup() {

        paladin = new Paladin({
          graphics: {
            canvas: document.getElementById('test-canvas')
          }
        });

        scene = new paladin.Scene( { fov: 60 } );
        camera = new paladin.component.Camera({ 
          targeted: false,
          position: [1, 2, 3],
          rotation: [10, 20, 30]
        });
        var entity = new paladin.Entity();
        var mesh = new paladin.graphics.Mesh( {
          primitives: [ {
            type: 'box',
            size: 0.5,
            material: {
              color: [1, 0, 1]
            }
          }],
          finalize: true
        });
        model = new paladin.component.Model({
          mesh: mesh,
          position: [3, 6, 9],
          rotation: [15, 30, 45]
        });

        entity.addComponent( model );
        entity.addComponent( camera );
        entity.setParent( scene );

        /*
        task = paladin.tasker.add({
          callback: function () {
            model.object.rotation[0] += 1;
          }
        });
        */

      },
      teardown: function graphics_teardown ( ) {
        paladin.tasker.terminate();

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
      paladin.graphics.pushScene( scene );
      paladin.run();
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

})( window, window.document, Paladin );
