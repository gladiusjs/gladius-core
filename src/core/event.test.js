define(
    [ "core/event" ],
    function( Event ) {
      return function() {

        module( "Event", {
          setup: function() {},
          teardown: function() {}
        });

        test( "create a new event", function() {
          expect( 11 );

          var eventType = "TestEvent";
          var eventData = "Hello world!";
          
          var handler = {
              handleEvent: function( event ) {
                ok( true, "handler invoked" );
                equal( event.type, eventType, "event type is correct" );
                equal( event.data, eventData, "event data is correct" );
              }
          };

          var event = new Event( eventType, eventData );
          equal( event.type, eventType, "event type is correct" );
          equal( event.data, eventData, "event data is correct" );
          event.dispatch( handler );
          event.dispatch( handler, handler );
        });

      };
    }
);