QUnit.config.autostart = false;

var testRequire = require.config({
  context: "test",
  baseUrl: "../wip-src"
});

testRequire(
    [
     "common/guid.test",
     "common/graph.test",
     "common/multicast-delegate.test",
     "loop.test",
     "request-animation-frame-loop.test",
     "set-timeout-loop.test",
     "clock.test",
     "function-task.test",
     "dependency-scheduler.test",
     "timer.test",
     "engine.test"
     ],
     function( 
         guidTests,
         graphTests,
         multicastDelegateTests,
         loopTests, 
         requestAnimationFrameLoopTests,
         setTimeoutLoopTests,
         clockTests,
         functionTaskTests,
         dependencySchedulerTests,
         timerTests,
         engineTests
     ) {
      QUnit.start();

      guidTests();
      graphTests();
      multicastDelegateTests();
      loopTests();
      requestAnimationFrameLoopTests();
      setTimeoutLoopTests();
      clockTests();
      functionTaskTests();
      dependencySchedulerTests();
      timerTests();
      engineTests();
    }
);