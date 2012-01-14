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
 

  asyncTest( 'invoke load with a single non-existent resource', function() {
    expect(4);

    var resourcePath = "no-such-url-exists";
    
    function onprogress ( ) {
      ok( false, "progress should not be called for only 1 file");
    }

    function oncomplete ( result ) {
      // XXX should we have another callback or arg to signal that
      // something went wrong?
      ok( true, "single non-existent load completed");
      equal( Object.keys(result).length, 0, "result set is empty");

      start();
      // TD: test that cache has been appropriately modified
    }

    var resourceToLoad = {
      type: "engine.core.resource.json",
      source: resourcePath, 
      onsuccess: function( result ) {
        ok(false, "non-existent file should not have loaded successfully");
      },
      onfailure: function( error ) {
        ok(true, "non-existent file failed to load: " + error);
      }
    };
    
    var result = engine.core.resource.load([resourceToLoad], { 
      oncomplete: oncomplete, 
      onprogress: onprogress,
      cache: "myEmptyCache"});
      
    deepEqual(result, {}, "result set is empty after non-existent load started");
  });  


  asyncTest( 'load three uncached resource', function() {
    expect(12);

    var resourcePath = "assets/test-loadfile1.json";
    var resourcePath2 = "assets/test-loadfile2.json";
    var resourcePath3 = "assets/test-loadfile3.json";
    
    function onprogress ( ) {
      // TD (dmose): I'm not convinced that this API is very useful.  The
      // only simple granularity we can offer is calling back after each
      // file loads, and that progress updating could just be done on the 
      // onsuccess/onfailure handler for each file.  I'd like to talk to
      // bzbarsky, biesi, or someone else with experience with the gecko
      // webprogress stuff.  Or, even more ideally, a UX person.  Would
      // also be interesting to chat with experienced game devs here.
      
      // we need to either make a passing a test or kill this API
      // before landing on the develop branch
    }

    function oncomplete ( result ) {
      ok( true, "three uncached loads completed");
      equal( Object.keys(result).length, 3, "result set is right size" );

      var resources = [resourcePath, resourcePath2, resourcePath3];
      for ( var i = 0; i < resources.length; i++ ) {
        ok( result.hasOwnProperty(resources[i]),
          "result set has expected URL property " + resources[i] );
        deepEqual(result[resources[i]], {}, 
          "result set contains correct data for " + resources[i] );
      }

      start();
      // TD: test that cache has been appropriately modified
    }
    
    function makeResourceInfo(path) {
      var r = {
        type: "engine.core.resource.json",
        source: path, 
        onsuccess: function( result ) {
          deepEqual(result, {}, "empty JSON object should have been loaded");
        },
        onfailure: function( error ) {
          ok(false, "failed to load minimal JSON file: " + error);
        }
      };
      
      return r;
    }
    
    var resourcesToLoad = [
      makeResourceInfo(resourcePath),
      makeResourceInfo(resourcePath2),
      makeResourceInfo(resourcePath3)
    ];
    
    var result = engine.core.resource.load(resourcesToLoad, { 
      oncomplete: oncomplete, 
      onprogress: onprogress,
      cache: "myEmptyCache"});
      
    deepEqual(result, {}, "result set is empty after single uncached load started");
  });  


  // TD: test constructor type handling
  
  // TD: progress should not be called at 100% complete; get rid of onprogress
  // ok()
  
  // TD: ensure that we test that result is not populated before one of 
  // onprogress or oncomplete is called; refactor regular resources to
  // behave this way?

  // TD: test that passing in various edge cases and null for options
  // behaves appropriately
  
  // TD: test what happens when itemsToLoad contains dups
  
  // TD: test what happens when itemsToLoad is not an array.  duck-type as 
  // single object to load?
}());
