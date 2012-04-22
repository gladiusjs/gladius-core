if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define(
    [ "common/guid" ],
    function( guid ) {
      return function() {

        module( "guid", {
          setup: function() {},
          teardown: function() {}
        });
        
        test( "generate new guids", function() {
          expect( 3 );
          
          var guid1 = guid();
          var guid2 = guid();
          
          equal( typeof guid1, "string", "guid is correct type" );
          equal( guid1.length, 36, "guid is correct length" );          
          notEqual( guid1, guid2, "guids are not the same" );
        });
        
      };
    }
);