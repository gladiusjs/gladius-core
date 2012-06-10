define(
    [ "core/engine",
      "base/extension"],
    function( Engine, Extension ) {
      return function() {

        module( "Engine", {
          setup: function() {},
          teardown: function() {}
        });

        asyncTest( "create a new engine", function() {
          expect( 16 );

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

          // TD we should really be testing that the clock that gets created
          // is the simulation clock or something like that.  Really, this needs
          // this probably needs the sorting out from issue #205 to happen        
          var simulationSpace = new engine.SimulationSpace();
          deepEqual( simulationSpace.clock._delegate, engine.simulationClock.signal, "simulation space uses simulation clock" );

          var realSpace = new engine.RealSpace();
          equal( realSpace.clock._delegate, engine.realClock.signal, "real space uses realtime clock" );
        });

      };
    }
);