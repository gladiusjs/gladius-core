define(
    [ "core/engine" ],
    function( Engine ) {
      return function() {

        module( "Engine", {
          setup: function() {},
          teardown: function() {}
        });

        asyncTest( "create a new engine", function() {
          expect( 14 );

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
          ok( engine.get, "get is exported" );
          ok( engine.loaders, "loaders are exposed" );
          ok( engine.loaders.text, "text loader is available" );
          ok( engine.loaders.procedural, "procedural loader is available" );
          ok( engine.core, "core extension is available" );
          ok( engine.findExtension( "core" ), "core extension is findable" );
          ok( engine.core.Transform, "transform is available" );
          ok( engine.core.Script, "script is available" );
        });

      };
    }
);