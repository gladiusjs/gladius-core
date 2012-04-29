define(
    [ "core/timer" ],
    function( Timer ) {
      return function() {

        module( "Timer", {
          setup: function() {
            this.delegateApi = {
                subscribe: function() {},
                unsubscribe: function() {}
            };
            
            this.delegateMock = sinon.mock( this.delegateApi );
          },
          teardown: function() {}
        });
        
        test( "create a new timer", function() {
          expect( 9 );
          
          var dataString = "Hello world!";
          
          var delegateApi = this.delegateApi;
          var delegateMock = this.delegateMock;
          delegateMock.expects( "subscribe" ).once();
          delegateMock.expects( "unsubscribe" ).once();
          
          function callback( data ) {
            ok( true, "callback invoked" );
            equal( data, dataString, "data is correct" );
          }
          
          var timer = new Timer( delegateApi, 10, callback, dataString );
          equal( timer.elapsed, 0, "initial elapsed time is correct" );
          ok( timer.isStarted(), "timer is started" );
          
          timer.update( 1 );
          equal( timer.elapsed, 1, "elapsed is correct" );
          
          timer.update( 15 );
          equal( timer.elapsed, 16, "elapsed is correct" );
          ok( !timer.isStarted(), "timer is paused" );
          ok( delegateMock.verify(), "delegate invocations verified" );
          
          timer.reset();
          ok( timer.isStarted(), "timer is started" );
        });
        
      };
    }
);