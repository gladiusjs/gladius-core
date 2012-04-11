QUnit.config.autostart = false;

var testRequire = require.config({
  context: "test",
  baseUrl: "../wip-src"
});

testRequire(
    [
     "graph.test",
     "loop.test",
     "request-animation-frame-loop.test",
     "set-timeout-loop.test",
     "clock.test"
     ],
     function( graphTests, 
         loopTests, 
         requestAnimationFrameLoopTests,
         setTimeoutLoopTests,
         clockTests ) {
      QUnit.start();

      graphTests();
      loopTests();
      requestAnimationFrameLoopTests();
      setTimeoutLoopTests();
      clockTests();
    }
);