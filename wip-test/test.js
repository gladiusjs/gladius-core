QUnit.config.autostart = false;

var testRequire = require.config({
  context: "test",
  baseUrl: "../wip-src"
});

testRequire(
    [
     "graph.test",
     ],
     function( graphTests ) {
      QUnit.start();
      graphTests();
    }
);