/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'graphics/service', {
        setup: function () {
            stop();

            gladius.create({
                  debug: true,
                  services: {
                      graphics: 'graphics/service'
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

        // This is very temporary until we have a way to render to multiple things
        var gl = CubicVR.init( document.getElementById( "test-canvas" ) ),
            canvas;
        if ( gl ) {
            canvas = new CubicVR.getCanvas();
        } //if

        engine.graphics.resource.Mesh({
            script: engine.graphics.script.mesh.cube,
            onComplete: function( instance ) {

                var cameraComponent = new engine.graphics.component.Camera();
                cameraEntity.add( cameraComponent );
                cameraComponent.active = true;

                modelEntity.add( new engine.graphics.component.Model({
                    mesh: instance
                }));

                modelEntity.add( new engine.core.component.Transform() );

                engine.graphics.render();

                ok( true );
                start();
            }
        });

    });

}());
