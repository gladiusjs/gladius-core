QUnit.config.autostart = false;

var testRequire = require.config({
  context: "test",
  baseUrl: "../wip-src"
});

testRequire(
    [
     "graph.test",
     "loop.test",
     "request-animation-frame-loop.test"     
     ],
     function( graphTests, loopTests, requestAnimationFrameLoopTests ) {
      QUnit.start();
      
      graphTests();
      loopTests();
      requestAnimationFrameLoopTests();
    }
);