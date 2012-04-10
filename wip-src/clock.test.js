define(
    [ "clock" ],
    function( Clock ) {
      return function() {

        module( "Clock", {
          setup: function() {},
          teardown: function() {}
        });
        
        test( "construct a new clock", function() {
          expect( 5 );
          
          var clock = new Clock();
          
          equal( clock.idealFrameInterval, 1.0/30.0, 
              "default ideal frame interval is correct" );
          equal( clock.timeScale, 1.0, "default time scale is correct" );
          equal( clock.time, 0.0, "initial time is correct" );
          equal( clock.delta, 0.0, "initial delta is correct" );
          ok( !clock.isPaused(), "clock is not paused" );
        });
        
        test( "update", function() {
          expect( 4 );
          
          var clock = new Clock();
          
          clock.update( 10 );          
          equal( clock.time, 10.0, "time is correct" );
          equal( clock.delta, 10.0, "delta is correct" );
          clock.update( 5 );
          equal( clock.time, 15.0, "time is correct" );
          equal( clock.delta, 5.0, "delta is correct" );
        });
        
        test( "pause and resume", function() {
          expect( 4 );
          
          var clock = new Clock();
          
          clock.suspend();
          clock.update( 10 );
          equal( clock.time, 0.0, "time is unchanged after update" );
          equal( clock.delta, 0.0, "delta is unchanged after update" );
          clock.resume();
          clock.update( 5 );
          equal( clock.time, 5.0, "time is correct" );
          equal( clock.delta, 5.0, "delta is correct" );
        });
        
        test( "step", function() {
          expect( 4 );
          
          var clock = new Clock();
          
          clock.step( 1 );
          equal( clock.time, 0.0, "time is unchanged after step" );
          equal( clock.delta, 0.0, "delta is unchanged after step" );
          clock.suspend();
          clock.step( 2 );
          equal( clock.time, 2 * clock.idealFrameInterval, "time is correct" );
          equal( clock.delta, 2 * clock.idealFrameInterval, "delta is correct" );
        });
        
        test( "default step", function() {
          expect( 2 );
          
          var clock = new Clock();
          
          clock.suspend();
          clock.step();
          equal( clock.time, clock.idealFrameInterval, "time is correct" );
          equal( clock.delta, clock.idealFrameInterval, "delta is correct" );
        });
        
        test( "time scale update", function() {
          expect( 2 );
          
          var clock = new Clock();
          
          clock.timeScale = 10;
          clock.update( 1 );
          equal( clock.time, 10.0, "time is correct" );
          equal( clock.delta, 10.0, "delta is correct" );
        });
        
        test( "time scale step", function() {
          expect( 2 );
          
          var clock = new Clock();
          
          clock.timeScale = 10;
          clock.suspend();
          clock.step();
          equal( clock.time, 10.0 * clock.idealFrameInterval, 
              "time is correct" );
          equal( clock.delta, 10.0 * clock.idealFrameInterval, 
              "delta is correct" );
        });
        
        test( "ideal frame interval", function() {
          expect( 2 );
          
          var clock = new Clock();
          
          clock.idealFrameInterval = 1/60;
          
          clock.suspend();
          clock.step();
          equal( clock.time, 1/60, "time is correct" );
          equal( clock.delta, 1/60, "delta is correct" );
        });
        
        test( "reset", function() {
          expect( 2 );
          
          var clock = new Clock();

          clock.update( 10 );
          clock.reset();
          equal( clock.time, 0, "time is correct" );
          equal( clock.delta, 0, "delta is correct" );
        });

      };
    }
);        