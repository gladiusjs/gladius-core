define(
    [ "engine" ],
    function( Engine ) {
      return function() {

        module( "Engine", {
          setup: function() {},
          teardown: function() {}
        });
        
        test( "create a new engine", function() {
          expect( 0 );
          
          var engine = new Engine();
        });
        
      };
    }
);    