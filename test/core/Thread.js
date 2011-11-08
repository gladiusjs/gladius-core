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

        var f = function() {
            return 2;
        }

        engine.threadPool.call({
            call: function() {
                return 2;
            },
            onComplete: function( result ) {
                same(
                    2,
                    result,
                    'Result is 2'
                );
                start();
            }
        });
    });

}());
