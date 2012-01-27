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
    expect(4);

    function oncomplete ( result, errors ) {
      start();
      ok( true, "empty load completed");
      deepEqual(result, {}, "result set is empty after empty load done");
      deepEqual(errors, {}, "error set is empty after empty load done");
      // TD: test that cache has not been modified
    }

    var result = engine.core.resource.load([], { 
      oncomplete: oncomplete, 
      cache: "myEmptyCache"});
      
    deepEqual(result, {}, "result set is empty after empty load initiated");
  });


  asyncTest( 'invoke load with a single uncached resource', function() {
    expect(7);

    var resourcePath = "assets/test-loadfile1.json";
    
    function oncomplete ( result, errors ) {
      ok( true, "single uncached load completed");
      ok( result.hasOwnProperty(resourcePath),
          "result set has correct URL property");
          
      deepEqual(result[resourcePath], {}, 
        "result set contains correct data");
        
      equal( Object.keys(result).length, 1, "result set is right size" );
              
      deepEqual( errors, {}, "error set is empty after successful load" );              
      start();
      // TD: test that cache has not been modified
    }

    var resourceToLoad = {
      type: "engine.core.resource.json",
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
      
    deepEqual(result, {}, "result set is empty after single uncached load started");
  });  
 

  asyncTest( 'invoke load with a single non-existent resource', function() {
    expect(6);

    var resourcePath = "no-such-url-exists";
    
    function oncomplete ( result, errors ) {

      ok( true, "single non-existent load completed");
      equal( Object.keys(result).length, 0, "result set is empty");

      equal( Object.keys(errors).length, 1, "non-existent load failed" );

      ok( errors.hasOwnProperty(resourcePath),
          "result set has correct URL property");
      
      start();
      // TD: test that cache has been appropriately modified
    }

    var resourceToLoad = {
      type: "engine.core.resource.json",
      url: resourcePath, 
      onsuccess: function( result ) {
        ok(false, "non-existent file should not have loaded successfully");
      },
      onfailure: function( error ) {
        ok(true, "non-existent file failed to load: " + error);
      }
    };
    
    var result = engine.core.resource.load([resourceToLoad], { 
      oncomplete: oncomplete, 
      cache: "myEmptyCache"});
      
    deepEqual(result, {}, "result set is empty after non-existent load started");
  });  


  function makeResourceInfo(path) {
    var r = {
      type: "engine.core.resource.json",
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
    expect(13);

    var resourcePath = "assets/test-loadfile1.json";
    var resourcePath2 = "assets/test-loadfile2.json";
    var resourcePath3 = "assets/test-loadfile3.json";
    
    function oncomplete ( result, errors ) {
      ok( true, "three uncached loads completed");
      equal( Object.keys(result).length, 3, "result set is right size" );

      var resources = [resourcePath, resourcePath2, resourcePath3];
      for ( var i = 0; i < resources.length; i++ ) {
        ok( result.hasOwnProperty(resources[i]),
          "result set has expected URL property " + resources[i] );
        deepEqual(result[resources[i]], {}, 
          "result set contains correct data for " + resources[i] );
      }

      deepEqual(errors, {}, "no errors were returned");

      start();
      // TD: test that cache has been appropriately modified
    }
    
    var resourcesToLoad = [
      makeResourceInfo(resourcePath),
      makeResourceInfo(resourcePath2),
      makeResourceInfo(resourcePath3)
    ];
    
    var result = engine.core.resource.load(resourcesToLoad, { 
      oncomplete: oncomplete, 
      cache: "myEmptyCache"});
      
    deepEqual(result, {}, "result set is empty after single uncached load started");
  });  

  // TD: test what happens when itemsToLoad contains dups & 
  // non-canonicalized dups

  // TD: test that passing in various edge cases and null for options
  // behaves appropriately

  // TD: test that when itemsToLoad is not an array an exception is raised  
  
  // TD: ensure that we test that result is not populated before one of 
  // oncomplete is called
}());
