define(
    [ "request-animation-frame-loop" ],
    function( RequestAnimationFrameLoop ) {
      return function() {

        module( "RequestAnimationFrameLoop", {
          setup: function() {},
          teardown: function() {}
        });
        
        asyncTest( "construct a new loop without a callback", function() {
          expect( 35 );
          
          var loop = new RequestAnimationFrameLoop();
          var counter = 10;
          function testCallback() {            
            ok( true, "callback invoked" );
            ok( loop.R_RUNNING === loop.runState, "runState is correct" );
            ok( loop.L_STARTED === loop.loopState, "loopState is correct" );
            if( 1 === counter ) {
              start();
            }
            return -- counter > 0;
          };
          
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
          expect( 30 );
          
          var counter = 10;
          function testCallback() {            
            ok( true, "callback invoked" );
            equal( loop.runState, loop.R_RUNNING, "runState is correct" );
            equal( loop.loopState, loop.L_STARTED, "loopState is correct" );
            if( 1 === counter ) {
              start();
            }
            return -- counter > 0;
          };
          
          var loop = new RequestAnimationFrameLoop( testCallback );
          loop.resume();          
        });
        
      };
    }
);