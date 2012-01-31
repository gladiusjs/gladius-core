/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global module: false, gladius: false, stop: false, start: false,
  expect: false, asyncTest: false, ok: false, deepEqual: false, equal: false,
  raises: false, test: false */

(function() {
  var engine = null;
  var MyCustomResource = null;
  var makeGetRequest = null;
  

  module('core/resource/get', {

    setup : function() {
      stop();

      gladius.create({
        debug : true
      }, function oncreate(instance) {
        engine = instance;
        
        // Make a custom resource type
        MyCustomResource = new engine.base.Resource({
            type: 'MyCustomResourceType'
          },
          function( data ) {
            this.value = data;
          }
        );
        
        makeGetRequest = function( url ) {
            var resourceConstructor = MyCustomResource;
            var request = {
              type: resourceConstructor,
              url: url,
              onsuccess: function(instance) {
                deepEqual(instance, {}, "empty JSON object should have been loaded");
              },
              onfailure: function(error) {
                ok(false, "failed to load minimal JSON file: " + error);
              }
            };

            return request;
        };

        start();
      });
    },
    teardown : function() {
      engine = null;
    }
  });

  asyncTest( 'invoke get with an empty list', function() {
    expect(3);

    function oncomplete () {
      equal( arguments.length, 0, 'oncomplete passes no arguments' );
      ok( true, "empty get completed");
      start();
    }

    var result = engine.core.resource.get( [], { 
      oncomplete: oncomplete
    });
    
    equal( result, undefined, 'result is undefined' );
  });
  
  asyncTest( 'get a single resource', function() {
    expect(4);
    
    function oncomplete() {
      equal( arguments.length, 0, 'oncomplete passes no arguments' );
      ok( true, "get completed");                         
      start();
    }

    var resourceToLoad = {
      type: MyCustomResource,
      url: "assets/test-loadfile1.json", 
      onsuccess: function( instance ) {
        deepEqual(instance.value, {}, "empty JSON object should have been loaded");
      },
      onfailure: function( error ) {
        ok(false, "failed to load minimal JSON file: " + error);
      }
    };
    
    var result = engine.core.resource.get( [resourceToLoad], { 
      oncomplete: oncomplete
    });
    
    equal( result, undefined, 'result is undefined' );
  });  
/*

  asyncTest( 'get a single non-existent resource', function() {
    expect(2);

    function oncomplete () {
      ok( true, "single non-existent get completed");
      start();
    }

    var resourceToLoad = {
      type: MyCustomResource,
      url: "no-such-url-exists", 
      onsuccess: function( result ) {
        ok(false, "non-existent data should not have loaded successfully");
      },
      onfailure: function( error ) {
        ok(true, "failed to get non-existent data: " + error);
      }
    };
    
    engine.core.resource.get( [resourceToLoad], { 
      oncomplete: oncomplete 
    });
  });  


  asyncTest( 'get three resources', function() {
    expect(4);
    
    function oncomplete () {
      ok( true, "get completed");
      start();
    }
    
    var resourcesToLoad = [
      makeGetRequest("assets/test-loadfile1.json"),
      makeGetRequest("assets/test-loadfile2.json"),
      makeGetRequest("assets/test-loadfile3.json")
    ];
    
    engine.core.resource.get( resourcesToLoad, { 
      oncomplete: oncomplete
    });
  });
 
  test( 'get duplicate resources', function() {
      expect(1);
      
      function oncomplete() {
          ok( false, 'oncomplete should not be invoked' );
      }

      var resourceToLoad = {
        type: MyCustomResource,
        url: "assets/test-loadfile1.json", 
        onsuccess: function( result ) {
          ok( false, 'onsuccess should not be invoked' );
        },
        onfailure: function( error ) {
          ok( false, 'onfailure should not be invoked' );
        }
      };
      
      raises( function() {
          engine.core.resource.get( [resourceToLoad, resourceToLoad], { 
              oncomplete: oncomplete
          });
      }, function( exception ) {
          return exception.message == "duplicate resource passsed";
      }, 'get throws an exception');
  });
*/  
  // TD: write a test for the default loader; should handle xhr and data URI?

  // TD: onfailure is invoked when loader fails
  // TD: onfailure is invoked when loader returns undefined
  // TD: onfailure is invoked when resource constructor fails
  // TD: default load function can be overridden per get request
  // TD: default load function can be overridden per get invocation  


}());
