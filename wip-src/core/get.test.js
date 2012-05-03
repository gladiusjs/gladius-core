define(
  [ "core/get" ],
  function( get ) {
    return function() {

      module( "get", {
        setup: function() {
          // Make a custom resource type
          this.MyCustomResource = function( data ) {
            return JSON.parse( data );
          };

          // Make a text resource type
          this.MyTextResource = function( data ) {
            return data;
          };

          this.makeGetRequest = function makeGetRequest ( url, expectedObj ) {
            var resourceConstructor = this.MyCustomResource;
            var request = {
              type: resourceConstructor,
              url: url,
              onsuccess: function(instance) {
                deepEqual(instance.value, expectedObj,
                  "object expected for this resource was loaded");
              },
              onfailure: function(error) {
                ok(false, "failed to load minimal JSON file: " + error);
              }
            };

            return request;
          };

        },
        teardown: function() {}
      });

      asyncTest( 'invoke get with an empty list', function() {
        expect(3);

        function oncomplete () {
          equal( arguments.length, 0, 'oncomplete passes no arguments' );
          ok( true, "empty get completed");
          start();
        }

        var result = get( [], {
          oncomplete: oncomplete
        });

        equal( result, undefined, 'result is undefined' );
      });

      asyncTest( 'get invoked without oncomplete succeeds', function() {
        expect( 1 );

        var resourceToLoad = {
          type: this.MyCustomResource,
          url: "assets/test-loadfile1.json",
          onsuccess: function( instance ) {
            ok(true, "get invoked without oncomplete succeeded");
            start();
          },
          onfailure: function( error ) {
            ok(false, "failed to load minimal JSON file: " + error);
            start();
          }
        };

        get( [resourceToLoad] );
      });
    };
  }
);