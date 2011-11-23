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

    test( 'Scene awareness', function() {
        expect( 1 );
        var scene1 = new engine.core.Scene(),
            scene2 = new engine.core.Scene();
        equal( engine.graphics.scenes.length, 2, 'subsystem grabbed created scenes' );
    });

}());
