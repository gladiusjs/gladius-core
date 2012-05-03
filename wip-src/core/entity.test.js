define(
    [ "core/entity" ],
    function( Entity ) {
      return function() {

        module( "Entity", {
          setup: function() {},
          teardown: function() {}
        });
        
        test( "create a new entity without parameters", function() {
          expect( 1 );
          
          var entity = new Entity();
          ok( entity.hasOwnProperty( "id" ), "has an id" );
        });
               
      };
    }
);