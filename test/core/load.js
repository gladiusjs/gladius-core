/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global module: false, gladius: false, stop: false, start: false,
  expect: false, asyncTest: false, ok: false, deepEqual: false, equal: false */

(function() {
  var engine = null;
  

  module('core/Load', {

    setup : function() {
      stop();

      gladius.create({
        debug : true
      }, function(instance) {
        engine = instance;
        start();
      });
    },
    teardown : function() {
      engine = null;
    }
  });

  asyncTest( 'invoke load with an empty list', function() {
    expect(3);

    function oncomplete () {
      equal( arguments.length, 0, 'oncomplete passes no arguments' );
      ok( true, "empty load completed");
      start();
      // TD: test that cache has not been modified
    }

    var result = engine.core.resource.load([], { 
      oncomplete: oncomplete, 
      cache: "myEmptyCache"});
    
    equal( result, undefined, 'result is undefined' );
  });


  asyncTest( 'invoke load with a single uncached resource', function() {
    expect(4);

    var resourcePath = "assets/test-loadfile1.json";
    var resourceConstructor = engine.core.resource.json;
    
    function oncomplete() {
      equal( arguments.length, 0, 'oncomplete passes no arguments' );
      ok( true, "single uncached load completed");                         
      start();
      // TD: test that cache has not been modified
    }

    var resourceToLoad = {
      type: resourceConstructor,
      url: resourcePath, 
      onsuccess: function( result ) {
        deepEqual(result, {}, "empty JSON object should have been loaded");
      },
      onfailure: function( error ) {
        ok(false, "failed to load minimal JSON file: " + error);
      }
    };
    
    var result = engine.core.resource.load([resourceToLoad], { 
      oncomplete: oncomplete, 
      cache: "myEmptyCache"});
    
    equal( result, undefined, 'result is undefined' );
  });  
 

  asyncTest( 'invoke load with a single non-existent resource', function() {
    expect(2);

    var resourcePath = "no-such-url-exists";
    var resourceConstructor = engine.core.resource.json;
    
    function oncomplete () {
      ok( true, "single non-existent load completed");
      start();
      // TD: test that cache has been appropriately modified
    }

    var resourceToLoad = {
      type: resourceConstructor,
      url: resourcePath, 
      onsuccess: function( result ) {
        ok(false, "non-existent file should not have loaded successfully");
      },
      onfailure: function( error ) {
        ok(true, "non-existent file failed to load: " + error);
      }
    };
    
    engine.core.resource.load([resourceToLoad], { 
      oncomplete: oncomplete, 
      cache: "myEmptyCache"});
  });  


  function makeResourceInfo(path) {
    var resourceConstructor = engine.core.resource.json;
    var r = {
      type: resourceConstructor,
      url: path,
      onsuccess: function(result) {
        deepEqual(result, {}, "empty JSON object should have been loaded");
      },
      onfailure: function(error) {
        ok(false, "failed to load minimal JSON file: " + error);
      }
    };

    return r;
  }


  asyncTest( 'load three uncached resource', function() {
    expect(4);

    var resourcePath = "assets/test-loadfile1.json";
    var resourcePath2 = "assets/test-loadfile2.json";
    var resourcePath3 = "assets/test-loadfile3.json";
    
    function oncomplete () {
      ok( true, "three uncached loads completed");
      start();
      // TD: test that cache has been appropriately modified
    }
    
    var resourcesToLoad = [
      makeResourceInfo(resourcePath),
      makeResourceInfo(resourcePath2),
      makeResourceInfo(resourcePath3)
    ];
    
    engine.core.resource.load(resourcesToLoad, { 
      oncomplete: oncomplete, 
      cache: "myEmptyCache"});
  });
  
  /*
  asyncTest( 'load duplicate resources using different non-normalized urls', function() {
     // Check that loading dups does not throw an error.
     // Check that only one load is done for a set of dups.
  });
  */

  // TD: test what happens when itemsToLoad contains dups & 
  // non-canonicalized dups

  // TD: test that passing in various edge cases and null for options
  // behaves appropriately

  // TD: test that when itemsToLoad is not an array an exception is raised  
  
  // TD: ensure that we test that result is not populated before one of 
  // oncomplete is called
}());
