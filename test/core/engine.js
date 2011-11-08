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
                window.guid,
                'window.guid is defined'
        );
        ok(
                window.guid(),
                'window.guid returns a value'
        );
    });

    test( 'graphics', function() {
        expect( 1 );

        ok(
                engine.graphics,
                'Engine has a graphics service'
        );
    });

}());
