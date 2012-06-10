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
          expect( 6 );
          
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
          equal( engine[extensionName], extension, 
            "extension added as engine property" );
        });
        
        test( "check for missing extension", function() {
          expect( 1 );
          
          var engine = new Engine();
          ok( !engine.hasExtension( "FakeExtension" ), 
              "missing extension is not found" );
        });

        test( "register an extension with nested elements", function() {
          expect( 5 );

          var extensionName = "testExtension";

          var MyService = function() {
            ok( true, "service constructor invoked" );
          };
          var MyNestedComponent = function( service ) {
            ok( service instanceof MyService, "service is correct" );
          };
          var MyNestedResource = function( service ) {
            ok( service instanceof MyService, "service is correct" );
          };

          var myExtension = new Extension( extensionName, {
            services: {
              "myService": {
                service: MyService,
                components: {
                  "MyComponent": MyNestedComponent
                },
                resources: {
                  "MyResource": MyNestedResource
                }
              }
            }
          });

          var engine = new Engine();
          engine.registerExtension( myExtension );
          var testExtension = engine.findExtension( "testExtension" );

          ok( testExtension.hasOwnProperty( "MyComponent" ), "has component" );
          ok( testExtension.hasOwnProperty( "MyResource" ), "has resource" );

          var myComponent = new testExtension.MyComponent();
          var myResource = new testExtension.MyResource();
        });
        
        test( "additional properties of nested components and resources get " +
          "preserved when they are registered", function() {
          expect( 4 );
          
          var extensionName = "testExtension";
          
          var MyService = function() {
          };
          var MyNestedComponent = function( service ) {
          };
          MyNestedComponent.anExtraProperty = {name:"test"};
          MyNestedComponent.anExtraProperty2 = {name:"test2"};
          var MyNestedResource = function( service ) {
          };
          MyNestedResource.anExtraProperty = {name:"test"};
          MyNestedResource.anExtraProperty2 = {name:"test2"};
          var MyComponent = function( service ) {
          };
          
          var myExtension = new Extension( extensionName, {
            services: {
              "myService": {
                service: MyService,
                components: {
                  "MyNestedComponent": MyNestedComponent
                },
                resources: {
                  "MyNestedResource": MyNestedResource
                }
              }
            }
          });
          
          var engine = new Engine();
          engine.registerExtension( myExtension );
          var testExtension = engine.findExtension( "testExtension" );

          ok( testExtension.MyNestedComponent.hasOwnProperty( "anExtraProperty" ), "has first extra property" );
          ok( testExtension.MyNestedComponent.hasOwnProperty( "anExtraProperty2" ), "has second extra property" );
          ok( testExtension.MyNestedResource.hasOwnProperty( "anExtraProperty" ), "has first extra property" );
          ok( testExtension.MyNestedResource.hasOwnProperty( "anExtraProperty2" ), "has second extra property" );
        });


        
      };
    }
);    