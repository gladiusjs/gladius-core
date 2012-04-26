QUnit.config.autostart = false;

require.config({
  baseUrl: "../wip-src",
  paths: {
    // Test path
    test: "../wip-test",
    
    // RequireJS plugins, used to load tests
    text: "../external/requirejs-plugins/lib/text",
    json: "../external/requirejs-plugins/src/json",
    "json-minify": "../external/JSON.minify/minify.json"
  }
});

require( ["json!test/unit-tests.json"], function( testNames ) {
  require( testNames, function() {
    QUnit.start();
    var testModules = Array.prototype.slice.call( arguments );
    testModules.forEach( function( testModule ) {
      testModule();
    });
  });
});