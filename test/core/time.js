/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'core/Time', {
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

    test( 'Value', function() {
        expect( 1 );

        var time = new engine.Time();
        ok(
            time.value,
            'Time value is set'
        );
    });

    asyncTest( 'Normal update', function() {
        expect( 1 );

        var time = new engine.Time(),
            value = time.value,
            delay = 10;

        setTimeout( function() {
            time.update();
            ok(
                time.value >= value + delay,
                'New time after setTimeout is at least ' + delay + ' after initial value'
            );
            start();
        }, delay );
    });

    asyncTest( 'Suspend and resume', function() {
        expect( 2 );
        
        var time = new engine.Time(),
            value = time.value,
            delay = 10;
        
        time.suspend();
        setTimeout( function() {
            time.update();
            ok(
                time.value === value,
                'Time value is unchanged after update'
            );
            time.resume();
            setTimeout( function() {
                time.update();
                ok(
                    time.value >= value + delay,
                    'Time value is updated'
                );
                start();
            }, delay );
        }, delay );
    });
    
    asyncTest( 'Delta', function() {
        expect( 1 );
        
        var time = new engine.Time(),
            value = time.value,
            delay = 10;
        
        setTimeout( function() {
            time.update();
            equal(
                time.value - value,
                time.delta,
                'Delta captures the difference in update times'
            );
        }, delay );
    });

}());
