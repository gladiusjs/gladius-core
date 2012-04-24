QUnit.config.autostart = false;

require.config({
  baseUrl: "../wip-src",
  paths: {
    test: "../wip-test"
  }
});

require( ["test/unit-tests"], function( testNames ) {
  require( testNames, function() {
    QUnit.start();
    var testModules = Array.prototype.slice.call( arguments );
    testModules.forEach( function( testModule ) {
      testModule();
    });
  });
});