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
     "preemptive-task.test"
     ],
     function( 
         guidTests,
         graphTests, 
         loopTests, 
         requestAnimationFrameLoopTests,
         setTimeoutLoopTests,
         clockTests,
         preemptiveTaskTests
     ) {
      QUnit.start();

      guidTests();
      graphTests();
      loopTests();
      requestAnimationFrameLoopTests();
      setTimeoutLoopTests();
      clockTests();
      preemptiveTaskTests();
    }
);