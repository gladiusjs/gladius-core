/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'graphics/resource/Mesh', {
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

    asyncTest( 'Simple Cube', function () {
        expect( 1 );

        engine.graphics.resource.Mesh({
            script: engine.graphics.script.mesh.cube,
            onsuccess: function( instance ) {
                ok( true );
                start();
            }
        });

    });

}());
