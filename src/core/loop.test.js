define(
    [ "core/loop" ],
    function( Loop ) {
      return function() {

        module( "Loop", {
          setup: function() {},
          teardown: function() {}
        });
        
        test( "construct new loop", function() {
          expect( 2 );
          
          var loop = new Loop();
          
          raises( function() {
            loop.resume();
          }, Error, "exception thrown for undefined callback" );
          
          raises( function() {
            loop._pump();
          }, Error, "exception thrown for no implementation in base prototype" );
        });
        
      };
    }
);