define(
    [ "base/extension" ],
    function( Extension ) {
      return function() {

        module( "Extension", {
          setup: function() {
            this.MyService = function() {};
            this.MyComponent = function() {};
            this.MyResource = function() {};
          },
          teardown: function() {}
        });

        test( "construct an extension without a name", function() {
          expect( 1 );

          raises( function() {
            new Extension();
          }, Error, "exception raised for missing name" );
        });

        test( "construct an empty extension", function() {
          expect( 7 );

          var extensionName = "testExtension";

          var myExtension = new Extension( extensionName );

          equal( myExtension.name, extensionName, "extension has a name" );

          ok( myExtension.hasOwnProperty( "services" ), 
          "has services" );
          equal( Object.keys( myExtension["services"] ).length, 0, 
          "correct number of services" );
          ok( myExtension.hasOwnProperty( "components" ), 
          "has components" );
          equal( Object.keys( myExtension["components"] ).length, 0, 
          "correct number of components" );
          ok( myExtension.hasOwnProperty( "resources" ), 
          "has resources" );
          equal( Object.keys( myExtension["resources"] ).length, 0, 
          "correct number of resources" );
        });

        test( "construct a new extension", function() {
          expect( 18 );

          var myExtension = new Extension( "myExtension", {
            services: {
              "Service1": this.MyService,
              "Service2": this.MyService
            },
            components: {
              "Component3": this.MyComponent,
              "Component4": this.MyComponent
            },
            resources: {
              "Resource5": this.MyResource,
              "Resource6": this.MyResource
            }
          });

          ok( myExtension.hasOwnProperty( "services" ), 
          "has services" );
          equal( Object.keys( myExtension["services"] ).length, 2, 
          "correct number of services" );
          ok( myExtension["services"].hasOwnProperty( "Service1" ),
          "service is defined" );
          ok( myExtension["services"].hasOwnProperty( "Service2" ),
          "service is defined" );
          equal( myExtension["services"]["Service1"], this.MyService, 
          "service is correct" );
          equal( myExtension["services"]["Service2"], this.MyService,
          "service is correct" );

          ok( myExtension.hasOwnProperty( "components" ),
          "has components" );
          equal( Object.keys( myExtension["components"] ).length, 2,
          "correct number of components" );
          ok( myExtension["components"].hasOwnProperty( "Component3" ),
          "component is defined" );
          ok( myExtension["components"].hasOwnProperty( "Component4" ),
          "component is defined" );
          equal( myExtension["components"]["Component3"], this.MyComponent, 
          "component is correct" );
          equal( myExtension["components"]["Component4"], this.MyComponent,
          "component is correct" );

          ok( myExtension.hasOwnProperty( "resources" ),
          "has resources" );
          equal( Object.keys( myExtension["resources"] ) .length, 2,
          "correct number of resources" );
          ok( myExtension["resources"].hasOwnProperty( "Resource5" ),
          "resource is defined" );
          ok( myExtension["resources"].hasOwnProperty( "Resource6" ),
          "resource is defined" );
          equal( myExtension["resources"]["Resource5"], this.MyResource, 
          "resource is correct" );
          equal( myExtension["resources"]["Resource6"], this.MyResource,
          "resource is correct" );
        });

        test( "construct an extension with nested components and resources", 
            function() {
          expect( 20 );

          var myExtension = new Extension( "myExtension", {
            services: {
              "Service1": {
                service: this.MyService,
                components: {
                  "Component3": this.MyComponent
                },
                resources: {
                  "Resource5": this.MyResource
                }
              },
              "Service2": {
                service: this.MyService,
                components: {
                  "Component4": this.MyComponent
                },
                resources: {
                  "Resource6": this.MyResource
                }
              }
            }
          });

          ok( myExtension.hasOwnProperty( "services" ), 
          "has services" );
          equal( Object.keys( myExtension["services"] ).length, 2, 
          "correct number of services" );

          ok( myExtension["services"].hasOwnProperty( "Service1" ),
          "service is defined" );
          ok( myExtension["services"]["Service1"].hasOwnProperty( "service" ),
          "service is defined" );
          ok( myExtension["services"]["Service1"].hasOwnProperty( "components" ),
          "components is defined" );
          ok( myExtension["services"]["Service1"].hasOwnProperty( "resources" ),
          "resources is defined" );
          equal( myExtension["services"]["Service1"]["service"], this.MyService, 
          "service is correct" );
          ok( myExtension["services"]["Service1"]["components"].hasOwnProperty( "Component3" ), 
          "component is defined" );
          equal( myExtension["services"]["Service1"]["components"]["Component3"], 
              this.MyComponent, "component is correct" );
          ok( myExtension["services"]["Service1"]["resources"].hasOwnProperty( "Resource5" ), 
          "resource is defined" );
          equal( myExtension["services"]["Service1"]["resources"]["Resource5"], 
              this.MyResource, "resource is correct" );

          ok( myExtension["services"].hasOwnProperty( "Service2" ),
          "service is defined" );
          ok( myExtension["services"]["Service2"].hasOwnProperty( "service" ),
          "service is defined" );          
          ok( myExtension["services"]["Service2"].hasOwnProperty( "components" ),
          "components is defined" );
          ok( myExtension["services"]["Service2"].hasOwnProperty( "resources" ),
          "resources is defined" );          
          equal( myExtension["services"]["Service2"]["service"], this.MyService, 
          "service is correct" );
          ok( myExtension["services"]["Service2"]["components"].hasOwnProperty( "Component4" ), 
          "component is defined" );
          equal( myExtension["services"]["Service2"]["components"]["Component4"], 
              this.MyComponent, "component is correct" );
          ok( myExtension["services"]["Service2"]["resources"].hasOwnProperty( "Resource6" ), 
          "resource is defined" );
          equal( myExtension["services"]["Service2"]["resources"]["Resource6"], 
              this.MyResource, "resource is correct" );
        });

      };
    }
);