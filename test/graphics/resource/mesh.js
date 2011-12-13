/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'graphics/resource/Mesh', {
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

    asyncTest( 'Simple Cube', function () {
        expect( 1 );

        engine.graphics.resource.Mesh({
            script: engine.graphics.script.mesh.cube,
            onComplete: function( instance ) {
                ok( true );
                start();
            }
        });

    });

}());
