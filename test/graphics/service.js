/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'graphics/service', {
        setup: function () {
            stop();

            var canvas = document.createElement( "canvas" );
            canvas.width = 300;
            canvas.height = 300;
            document.getElementById( "canvas-container" ).appendChild( canvas );

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
              }, function( instance ) {       
                  engine = instance;
                  start();
            });
        },

        teardown: function () {
            engine = null;
        }
    });

    test( 'Construction', function() {
        expect( 1 );
        ok( engine.graphics, 'graphics subsystem exists' );
    });

    test( 'Space awareness', function() {
        expect( 1 );
        var scene1 = new engine.core.Space(),
            scene2 = new engine.core.Space();
        equal( engine.graphics.scenes.length, 2, 'subsystem grabbed created scenes' );
    });

    asyncTest( 'Test render', function() {
        expect( 1 );
        var scene = new engine.core.Space(),
            cameraEntity = new scene.Entity(),
            modelEntity = new scene.Entity();

        canvas = engine.graphics.target.element;

        var cameraComponent = new engine.graphics.component.Camera({
          active: true,
          width: canvas.width,
          height: canvas.height,
          fov: 60
        });
        cameraEntity.add( cameraComponent );

        modelEntity.add( new engine.core.component.Transform({
            position: [0, 0, 0]
        }));

        var modelComponent = new engine.graphics.component.Model({
          mesh: {
            script: engine.graphics.script.mesh.cube
          },
          material: {
            script: engine.graphics.script.material.sample
          },
          onsuccess: function( instance ) {
            modelEntity.add( instance );
            engine.graphics.render();
            engine.run();
            setTimeout( function() {
              engine.run();
              ok( engine.graphics.renderedFrames > 2, "Graphics task is rendering" );
              start();
            }, 500 );
          }
        });

    });


}());
