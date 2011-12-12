/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'core/Timer', {
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

    test( 'Default start time', function() {
        expect( 1 );

        var timer = new engine.scheduler.Timer();
        ok(
            timer.time === 0,
            'Timer time is 0'
        );
    });
    
    test( 'Custom start time', function() {
        expect( 1 );
        
        var timer = new engine.scheduler.Timer({ start: 10 });
        ok(
            timer.time === 10,
            'Timer is 10'
        );
    });
    
    test( 'Start inactive', function() {
        expect( 1 );
        
        var timer = new engine.scheduler.Timer({ active: false });
        ok(
            !timer.active,
            'Timer is not active'
        );
    });

    test( 'Normal update', function() {
        expect( 1 );

        var timer = new engine.scheduler.Timer(),
            time = timer.time,
            delay = 10;

        timer.update( delay );
        ok(
            timer.time >= time + delay,
            'New time after setTimeout is at least ' + delay + ' after initial time'
        );            
    });

    test( 'Suspend and resume', function() {
        expect( 2 );
        
        var timer = new engine.scheduler.Timer({ origin: 0 }),
            time = timer.time,
            delay = 10;
        
        timer.suspend();
        timer.update( delay );
        
        ok(
            timer.time === time,
            'Timer time is unchanged after update'
        );

        timer.resume();
        timer.update( delay );
        ok(
            timer.time >= time + delay,
            'Timer time is updated'
        );
    });
    
    test( 'Delta', function() {
        expect( 2 );
        
        var timer = new engine.scheduler.Timer(),
            time = timer.time,
            delay = 10;
        
        equal(
            0,
            timer.delta,
            'Initial delta is 0'
        );
        
        timer.update( delay );
        equal(
            timer.time - time,
            timer.delta,
            'Delta captures the difference in update times'
        );
        
    });
    
    test( 'Tick update', function() {
        expect( 1 );
        
        var tick = new engine.Delegate(),
            timer = new engine.scheduler.Timer({ 
                tick: tick 
            }),
            time = timer.time,
            delay = 10;
        
        tick( delay );
        equal(
            timer.time - time,
            timer.delta,
            'Timer is updated by tick event'
        );
    });

}());
