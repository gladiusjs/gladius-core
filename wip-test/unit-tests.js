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
     "clock.test"
     ],
     function( graphTests, 
         loopTests, 
         requestAnimationFrameLoopTests, 
         clockTests ) {
      QUnit.start();

      graphTests();
      loopTests();
      requestAnimationFrameLoopTests();
      clockTests();
    }
);