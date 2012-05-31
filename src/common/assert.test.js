if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define(
    [ "common/assert" ],
    function( assert ) {
      return function() {

        module( "assert", {
          setup: function() {},
          teardown: function() {}
        });

        test( "assert with true expression", function() {
          expect( 0 );

          assert( true );
        });

        test( "assert with false expression", function() {
          expect( 1 );

          raises( function() {
            assert( false, "false" );
          }, function( exception ) {
            return exception.message === "false";
          }, "exception thrown for false assertion has correct message" );
        });

      };
    }
);