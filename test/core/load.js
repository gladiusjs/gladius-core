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

    function onprogress ( ) {
      // TD: no start here means tests will hang, so it's probably impossible
      // for the ok() below to ever fire, but just in case...
      ok( false, "progress should not be called for 100% completion");
    }

    function oncomplete ( result ) {
      start();
      ok( true, "empty load completed");
      deepEqual(result, {}, "result set is empty after empty load done");
      
      // TD: test that cache has not been modified
    }

    var result = engine.core.resource.load([], { 
      oncomplete: oncomplete, 
      onprogress: onprogress,
      cache: "myEmptyCache"});
      
    deepEqual(result, {}, "result set is empty after empty load initiated");
  });


  asyncTest( 'invoke load with a single uncached resource', function() {
    expect(6);

    var resourcePath = "assets/test-loadfile1.json";
    
    function onprogress ( ) {
      ok( false, "progress should not be called for only 1 file");
    }

    function oncomplete ( result ) {
      ok( true, "single uncached load completed");
      ok( result.hasOwnProperty(resourcePath),
          "result set has correct URL property");
          
      deepEqual(result[resourcePath], {}, 
        "result set contains correct data");
        
      equal( Object.keys(result).length, 1, "result set is right size");
              
      start();
      // TD: test that cache has not been modified
    }

    var resourceToLoad = {
      type: "engine.core.resource.json",
      source: resourcePath, 
      onsuccess: function( result ) {
        deepEqual(result, {}, "empty JSON object should have been loaded");
      },
      onfailure: function( error ) {
        ok(false, "failed to load minimal JSON file: " + error);
      }
    };
    
    var result = engine.core.resource.load([resourceToLoad], { 
      oncomplete: oncomplete, 
      onprogress: onprogress,
      cache: "myEmptyCache"});
      
    deepEqual(result, {}, "result set is empty after single uncached load started");
  });  
 
  // TD: load group of resources
   
  // TD: progress should not be called at 100% complete; get rid of onprogress
  // ok()
  
  // TD: ensure that we test that result is not populated before one of 
  // onprogress or oncomplete is called; refactor regular resources to
  // behave this way?
  
  // TD: test that loading a bogus resource returns an error and completes
  
  // TD: test that passing in various edge cases and null for options
  // behaves appropriately
  
  // TD: test what happens when itemsToLoad contains dups
  
  // TD: test what happens when itemsToLoad is not an array.  duck-type as 
  // single object to load?
}());
