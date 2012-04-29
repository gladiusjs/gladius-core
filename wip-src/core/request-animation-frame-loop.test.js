define(
    [ "core/request-animation-frame-loop" ],
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
            ok( loop.R_RUNNING === loop._runState, "_runState is correct" );
            ok( loop.L_STARTED === loop._loopState, "_loopState is correct" );
            if( 0 === counter ) {
              loop.suspend();
              start();
            }
            return counter > 0;
          }
          
          ok( loop, "a new object is returned" );
          ok( loop instanceof RequestAnimationFrameLoop,
              "loop has corrct type" );
          equal( loop._runState, loop.R_IDLE, "initial _runState is correct" );
          equal( loop._loopState, loop.L_PAUSED,
              "initial _loopState is correct" );
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
            equal( loop._runState, loop.R_RUNNING, "_runState is correct" );
            equal( loop._loopState, loop.L_STARTED, "_loopState is correct" );            
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
              equal( loop.L_PAUSED, loop._loopState, 
                  "_loopState is correct after suspend" );
              loop.resume();
              equal( loop.L_STARTED, loop._loopState, 
                  "_loopState is correct after resume" );
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