if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define(
  [ "components/light" ],
  function( Light ) {
    return function() {

      module( "Light", {
        setup: function() {},
        teardown: function() {}
      });

    };
  }
);