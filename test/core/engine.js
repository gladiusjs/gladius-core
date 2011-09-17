/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'Engine', {
        setup: function () {
            stop();

            gladius.create( { debug: true }, function( instance ) {       
                engine = instance;
                start();
            });
        },

        teardown: function () {
            engine = null;
        }
    });

    test( 'GUID', function() {
        expect( 2 );

        ok(
                engine.nextGUID === 1,
                'First GUID is 1.'
        );
        ok(
                engine.nextGUID === 2,
                'Second GUID is 2.'
        );
    });

}());
