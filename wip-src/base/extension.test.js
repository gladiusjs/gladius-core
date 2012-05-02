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

        test( "construct a new extension", function() {
          expect( 6 );
          
          var myExtension = new Extension({
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
          ok( myExtension.hasOwnProperty( "components" ),
              "has components" );
          equal( Object.keys( myExtension["components"] ).length, 2,
              "correct number of components" );
          ok( myExtension.hasOwnProperty( "resources" ),
              "has resources" );
          equal( Object.keys( myExtension["resources"] ).length, 2,
              "correct number of resources" );

        });

      };
    }
);