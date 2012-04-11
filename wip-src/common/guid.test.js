define(
    [ "common/guid" ],
    function( guid ) {
      return function() {

        module( "guid", {
          setup: function() {},
          teardown: function() {}
        });
        
        test( "generate new guids", function() {
          expect( 2 );
          
          var guid1 = guid();
          var guid2 = guid();
          
          equal( guid1.length, 36, "guid is correct length" );
          notEqual( guid1, guid2, "guids are not the same" );
        });
        
      };
    }
);