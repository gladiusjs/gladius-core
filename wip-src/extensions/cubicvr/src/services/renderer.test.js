if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define(
  [ "services/renderer" ],
  function( Renderer ) {
    return function() {

      module( "Renderer", {
        setup: function() {},
        teardown: function() {}
      });

    };
  }
);