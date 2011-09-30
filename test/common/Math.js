/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;
    var math = null;

    module( 'common/Math', {
        setup: function () {
            stop();

            gladius.create( { debug: true }, function( instance ) {       
                engine = instance;
                math = engine.math;
                start();
            });
        },

        teardown: function () {
            engine = null;
            math = null;
        }
    });

    test( 'Basic', function() {
        expect( 2 );

        ok(
                math,
                'Math found'
        );
        ok(
                math.ARRAY_TYPE,
                'Found ARRAY_TYPE'
        );
    });

}());
