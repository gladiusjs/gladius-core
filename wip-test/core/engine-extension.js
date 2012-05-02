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
          expect( 5 );
          
          var extensionName = "testExtension";
          
          var MyService = function() {
            ok( true, "service constructor invoked" );
          };
          var MyComponent = function() {
            throw new Error( "component constructor invoked" );
          };
          var MyResource = function() {
            throw new Error( "resource constructor invoked" );
          };
          
          var myExtension = new Extension( extensionName, {
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
          
          ok( engine.hasExtension( extensionName ), "engine has extention" );
          var extension = engine.findExtension( extensionName );
          ok( extension.myService instanceof MyService, 
              "service instance is correct" );
          equal( extension.MyComponent, MyComponent, 
              "component constructor is correct" );
          equal( extension.MyResource, MyResource, 
              "resource constructor is correct" );
        });
        
        test( "check for missing extension", function() {
          expect( 1 );
          
          var engine = new Engine();
          ok( !engine.hasExtension( "FakeExtension" ), 
              "missing extension is not found" );
        });
        
      };
    }
);    