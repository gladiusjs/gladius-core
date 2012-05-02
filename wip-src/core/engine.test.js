define(
    [ "core/engine" ],
    function( Engine ) {
      return function() {

        module( "Engine", {
          setup: function() {},
          teardown: function() {}
        });

        asyncTest( "create a new engine", function() {
          expect( 6 );

          var frameCounter = 0;
          function monitor( engine ) {
            ++ frameCounter;
            equal( frameCounter, engine.frame, "frame counter is correct" );
            engine.suspend();
            ok( !engine.isRunning(), "engine is not running" );
            start();
          }

          var engine = new Engine();
          engine.attach( monitor );
          ok( engine.realClock.isStarted(), "realtime clock is started" );
          ok( engine.simulationClock.isStarted(), 
          "simulation clock is started" );
          ok( !engine.isRunning(), "engine is not running" );
          engine.resume();
          ok( engine.isRunning(), "engine is running" );
        });

      };
    }
);