define(
    [ "core/engine",
      "base/extension" ],
    function( Engine, Extension ) {
      return function() {

        module( "Core", {
          setup: function() {},
          teardown: function() {}
        });
        
        test( "register an extension", function() {
          expect( 0 );
          
          var MyService = function() {
            ok( true, "service constructor invoked" );
          };
          var MyComponent = function() {
            throw new Error( "component constructor invoked" );
          };
          var MyResource = function() {
            throw new Error( "resource constructor invoked" );
          };
          
          var myExtension = new Extension( "myExtension", {
            services: {
              "myService": MyService
            },
            components: {
              "MyComponent": MyComponent
            },
            resources: {
              "MyResource": MyResource
            }
          });
          
          var engine = new Engine();
          engine.registerExtension( myExtension );
        });
        
      };
    }
);    