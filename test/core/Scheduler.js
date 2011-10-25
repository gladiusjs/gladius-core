/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'core/Scheduler', {
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

    test( '?', function () {
        expect( 0 );

        var counter = 0,
            start = Date.now(),
            end = null;

        var task = new engine.scheduler.Task({
            callback: function() {
                if( ++ counter >= 10 ) {
                    end = Date.now();
                    console.log( end - start );
                    return this.COMPLETE;
                }
            }
        });
    });

}());
