QUnit.config.autostart = false;

var testRequire = require.config({
  context: "test",
  baseUrl: "../wip-src"
});

testRequire(
    [
     "common/guid.test",
     "graph.test",
     "loop.test",
     "request-animation-frame-loop.test",
     "set-timeout-loop.test",
     "clock.test",
     "function-task.test",
     "dependency-scheduler.test"
     ],
     function( 
         guidTests,
         graphTests, 
         loopTests, 
         requestAnimationFrameLoopTests,
         setTimeoutLoopTests,
         clockTests,
         functionTaskTests,
         dependencySchedulerTests
     ) {
      QUnit.start();

      guidTests();
      graphTests();
      loopTests();
      requestAnimationFrameLoopTests();
      setTimeoutLoopTests();
      clockTests();
      functionTaskTests();
      dependencySchedulerTests();
    }
);