/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'core/Thread', {
        setup: function () {
            stop();

            gladius.create( { debug: true }, function( instance ) {       
                engine = instance;
                engine.run();
                start();
            });
        },

        teardown: function () {
            engine = null;
        }
    });

    asyncTest( 'Basic', function () {
        expect( 1 );        

        engine.threadPool.dispatch({
            callable: function( a, b ) {
                return a + b;
            },
            parameters: [ 1, 2 ],
            onComplete: function( result ) {
                equal(
                    3,
                    result,
                    'Result is 3'
                );
                start();
            }
        });
    });

}());
