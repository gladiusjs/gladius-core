define(
  [ "core/get", "core/loaders/procedural" ],
  function( get, proceduralLoader ) {
    return function() {

      module( "get", {
        setup: function() {
          // Make a custom resource type
          this.MyCustomResource = function( data ) {
            return JSON.parse( data );
          };

          this.makeGetRequest = function makeGetRequest ( url, expectedObj ) {
            var resourceConstructor = this.MyCustomResource;
            var request = {
              type: resourceConstructor,
              url: url,
              onsuccess: function(instance) {
                deepEqual(instance, expectedObj,
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

      asyncTest( 'get a single resource', function() {
        expect(5);

        var onsuccessCalled = false;

        function oncomplete() {
          equal( arguments.length, 0, 'oncomplete passes no arguments' );
          ok( true, "get completed");
          equal( onsuccessCalled, true, 'oncomplete called after onsuccess' );
          start();
        }

        var resourceToLoad = {
          type: this.MyCustomResource,
          url: "assets/test-loadfile1.json",
          onsuccess: function( instance ) {
            deepEqual(instance, {value: 1},
              "expected simple JSON object was loaded");
            onsuccessCalled = true;
          },
          onfailure: function( error ) {
            ok(false, "failed to load minimal JSON file: " + error);
          }
        };

        var result = get( [resourceToLoad], {
          oncomplete: oncomplete
        });

        equal( result, undefined, 'result is undefined' );
      });

      asyncTest( 'default loader can be overridden in get request', function() {
        expect( 2 );

        function oncomplete() {
          ok( true, "get completed");
          start();
        }

        var resourceToLoad = {
          type: String,
          url: "custom-url",
          load: function( url, onsuccess, onfailure ) {
            onsuccess( url );
          },
          onsuccess: function( instance ) {
            deepEqual(instance, "custom-url", "instance.value is set by custom loader");
          },
          onfailure: function( error ) {
            ok(false, "failed to invoke custom loader");
          }
        };

        get( [resourceToLoad], {
          oncomplete: oncomplete
        });
      });

      asyncTest( 'get a single non-existent resource', function() {
        expect(3);

        var onfailureCalled = false;

        function oncomplete () {
          ok( true, "single non-existent get completed");
          equal( onfailureCalled, true, "onfailure called before oncomplete");
          start();
        }

        var resourceToLoad = {
          type: this.MyCustomResource,
          url: "no-such-url-exists",
          onsuccess: function( result ) {
            ok(false, "non-existent data should not have loaded successfully");
          },
          onfailure: function( error ) {
            ok(true, "failed to get non-existent data: " + error);
            onfailureCalled = true;
          }
        };

        get( [resourceToLoad], {
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
          this.makeGetRequest("assets/test-loadfile1.json", {value: 1}),
          this.makeGetRequest("assets/test-loadfile2.json", {value: 2}),
          this.makeGetRequest("assets/test-loadfile3.json", {value: 3})
        ];

        get( resourcesToLoad, {
          oncomplete: oncomplete
        });
      });

      asyncTest( 'get duplicate resources', function() {
        expect(3);

        function oncomplete() {
          ok( true, 'oncomplete is invoked' );
          start();
        }

        var resourceToLoad = {
          type: this.MyCustomResource,
          url: "assets/test-loadfile1.json",
          onsuccess: function( result ) {
            ok( true, 'onsuccess is invoked' );
          },
          onfailure: function( error ) {
            ok( false, 'onfailure should not be invoked' );
          }
        };

        get( [resourceToLoad, resourceToLoad], {
          oncomplete: oncomplete
        });
      });

      asyncTest( 'procedurally load a simple resource', function() {
        expect( 2 );

        function oncomplete() {
          ok( true, "get completed");
          start();
        }

        var resourceToLoad = {
          type: String,
          url: "assets/reverse-text.js?value=Hello%20world",
          load: proceduralLoader,
          onsuccess: function( instance ) {
            deepEqual(instance, "dlrow olleH", "instance.value is generated by procedural algorithm");
          },
          onfailure: function( error ) {
            ok(false, "failed to invoke procedural loader");
          }
        };

        get( [resourceToLoad], {
          oncomplete: oncomplete
        });
      });
      
      asyncTest( 'procedurally load a simple resource with no parameters', function() {
        expect( 2 );
        
        function oncomplete() {
            ok( true, "get completed");                         
            start();
          }
        
          var resourceToLoad = {
            type: String,
            url: "assets/reverse-text.js",
            load: proceduralLoader,
            onsuccess: function( instance ) {
              deepEqual(instance, "", "instance is generated by procedural algorithm");
            },
            onfailure: function( error ) {
              ok(false, "failed to invoke procedural loader");
            }
          };
          
          get( [resourceToLoad], { 
            oncomplete: oncomplete
          });
    });

    };
  }
);