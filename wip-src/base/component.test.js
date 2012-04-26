define(
    [ "base/component" ],
    function( Component ) {
      return function() {

        module( "Component", {
          setup: function() {},
          teardown: function() {}
        });
        
        test( "create a new component type", function() {
          expect( 0 );
          
          var type = "TestType";
          var provider = "TestProvider";
          var dependsOn = ["Foo", "Bar"];
          
          var TestComponent = function() {
            Component.call( this, type, provider, dependsOn );
          };
          TestComponent.prototype = new Component();
          TestComponent.prototype.constructor = TestComponent;
          
          var testComponent = new TestComponent();
          
          ok( testComponent instanceof Component, 
              "component has correct base" );
          equal( testComponent.type, type, "type is correct" );
          equal( testComponent.provider, provider, "provider is correct" );
          equal( testComponent.dependsOn, dependsOn, 
              "dependencies are correct" );
          ok( "handleEvent" in testComponent, "has event handler" );
          ok( "handleQueuedEvent" in testComponent,
              "has queued event handler" );
        });
        
      };
    }
);