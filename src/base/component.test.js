define(
    [ "base/component" ],
    function( Component ) {
      return function() {

        module( "Component", {
          setup: function() {},
          teardown: function() {}
        });
        
        test( "create a new component type", function() {
          expect( 6 );
          
          var type = "TestType";
          var provider = {
              name: "provider object"
          };
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
        
        test( "handler called for owner changed", function() {
          expect( 4 );
          
          var newOwner = 1;
          var type = "TestType";
          var provider = {
              name: "provider object"
          };
          
          var TestComponent = function() {
            Component.call( this, type, provider );
          };
          TestComponent.prototype = new Component();
          TestComponent.prototype.constructor = TestComponent;
          TestComponent.prototype.onComponentOwnerChanged = function( event ) {
            ok( event.type = "ComponentOwnerChanged", 
                "owner changed event handler invoked" );
            equal( event.data.previous, null, "previous owner is correct" );
            equal( event.data.current, newOwner, "current owner is correct" );
          };
          
          var testComponent = new TestComponent();
          deepEqual( testComponent.dependsOn, [], "depends on is empty list" );
          testComponent.setOwner( newOwner );
          
        });
        
      };
    }
);