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
            engine.terminate();
            engine = null;
        }
    });
    
    test( 'Real and simulated time', function() {
        expect( 2 );
        
        ok(
            engine.scheduler.realTime,
            'Scheduler provides a timer for real time'
        );
        
        ok(
            engine.scheduler.simulationTime,
            'Scheduler provides a timer for simulation time'
        );
        
    });

    asyncTest( 'Schedule a task', function () {
        expect( 0 );

        var counter = 0;               

        var task = new engine.scheduler.Task({
            callback: function() {
                ok(
                    task.active,
                    'Task is active'
                );
                ok(
                    !task.scheduled,
                    'Task is not scheduled while it is running'
                );

                if( ++ counter >= 10 ) {
                    ok( true, 'Counter value is correct' );
                    setTimeout( function() {
                        ok(
                            !task.active && !task.scheduled,
                            'Task is inactive and not scheduled'
                        );
                    });

                    start();
                    return this.COMPLETE;
                }
            }
        });

    });

    /* TODO
    asyncTest( 'Task priority', function() {
    });
    */

}());
