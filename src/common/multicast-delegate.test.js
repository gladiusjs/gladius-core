define(
    [ "common/multicast-delegate" ],
    function( MulticastDelegate ) {
      return function() {

        module( "MulticastDelegate", {
          setup: function() {},
          teardown: function() {}
        });
        
        test( "create a new delegate", function() {
          expect( 2 );
          
          var delegate = new MulticastDelegate();
          equal( typeof delegate, "function", "delegate is a function" );
          equal( delegate.size, 0, "initial size is correct" );
        });
        
        test( "add a callback", function() {
          expect( 4 );
          
          var dataString = "Hello world!";
          
          function callback( data ) {
            ok( true, "callback invoked" );
            equal( data, dataString, "data is correct" );
          }
          
          var delegate = new MulticastDelegate();
          delegate.subscribe( callback );
          equal( delegate.size, 1, "size is correct" );
          var count = delegate( dataString );
          equal( count, 1, "dispatch count is correct" );
        });
        
        test( "remove a callback", function() {
          expect( 3 );
          
          var callbackInvoked = false;
          
          function callback() {
            callbackInvoked = true;
          }
          
          var delegate = new MulticastDelegate();
          delegate.subscribe( callback );
          delegate.unsubscribe( callback );
          equal( delegate.size, 0, "delegate is correct size" );
          var count = delegate();
          equal( count, 0, "dispatch count is correct" );
          equal( callbackInvoked, false, "callback not invoked" );
        });
        
      };
    }
);      