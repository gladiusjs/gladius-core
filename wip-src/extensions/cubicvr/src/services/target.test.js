if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define(
  [ "services/target" ],
  function( Target ) {
    return function() {

      module( "Target", {
        setup: function() {},
        teardown: function() {}
      });

    };
  }
);