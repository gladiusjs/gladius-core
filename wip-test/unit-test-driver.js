QUnit.config.autostart = false;

require.config({
  baseUrl: "../wip-src",
  paths: {
    // Test path
    test: "../wip-test",
    external: "../external",
   
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
    
    test( "tests modules are valid", function() {
      expect( testModules.length );
      testModules.forEach( function( testModule ) {
        ok( typeof testModule === "function", "test module is a function" );
      });
    });
    
    testModules.forEach( function( testModule ) {
      testModule();
    });
  });
});
