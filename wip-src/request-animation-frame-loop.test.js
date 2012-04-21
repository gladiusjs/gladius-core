define(
    [ "request-animation-frame-loop" ],
    function( RequestAnimationFrameLoop ) {
      return function() {

        module( "RequestAnimationFrameLoop", {
          setup: function() {},
          teardown: function() {}
        });
        
        asyncTest( "construct a new loop without a callback", function() {
          expect( 11 );
          
          var loop = new RequestAnimationFrameLoop();
          var counter = 2;
          function testCallback() {
            counter -= 1;
            ok( true, "callback invoked (" + counter + ")" );
            ok( loop.R_RUNNING === loop.runState, "runState is correct" );
            ok( loop.L_STARTED === loop.loopState, "loopState is correct" );
            if( 0 === counter ) {
              loop.suspend();
              start();
            }
            return counter > 0;
          }
          
          ok( loop, "a new object is returned" );
          ok( loop instanceof RequestAnimationFrameLoop,
              "loop has corrct type" );
          equal( loop.runState, loop.R_IDLE, "initial runState is correct" );
          equal( loop.loopState, loop.L_PAUSED,
              "initial loopState is correct" );
          raises( function() {
            loop.resume();
          }, Error, "exception thrown for undefined callback" );
          loop.callback = testCallback;
          loop.resume();
          
        });
        
        asyncTest( "construct a new loop with a callback", function() {
          expect( 6 );
          
          var counter = 2;
          function testCallback() {
            counter -= 1;
            ok( true, "callback invoked (" + counter + ")" );
            equal( loop.runState, loop.R_RUNNING, "runState is correct" );
            equal( loop.loopState, loop.L_STARTED, "loopState is correct" );            
            if( 0 ===  counter ) {
              loop.suspend();
              start();
            }
          }
          
          var loop = new RequestAnimationFrameLoop( testCallback );
          loop.resume();          
        });
        
        asyncTest( "suspend and resume", function() {
          expect( 4 );
          
          var counter = 2;
          function testCallback() {
            counter -= 1;
            ok( true, "callback invoked (" + counter + ")" );
            if( 1 === counter ) {
              loop.suspend();              
              equal( loop.L_PAUSED, loop.loopState, 
                  "loopState is correct after suspend" );
              loop.resume();
              equal( loop.L_STARTED, loop.loopState, 
                  "loopState is correct after resume" );
            } else if( 0 === counter ) {
              loop.suspend();
              start();
            }
          }
          
          var loop = new RequestAnimationFrameLoop( testCallback );
          loop.resume();
        });
        
      };
    }
);