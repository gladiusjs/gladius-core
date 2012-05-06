QUnit.config.autostart = false;

require.config({
  baseUrl: "../src",
  paths: {
    "core-lib": "../lib",
    "base": "base",
    "common": "common",
    "core": "core",
    "tests": "../tests",
   
    // RequireJS plugins, used to load tests
    "text": "../lib/requirejs-plugins/lib/text",
    "json": "../lib/requirejs-plugins/src/json"
  }
});

require( ["json!tests/unit-tests.json"], function( testNames ) {
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
