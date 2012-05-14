if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define(
  [ "resources/material-definition" ],
  function( MaterialDefinition ) {
    return function() {

      module( "MaterialDefinition", {
        setup: function() {},
        teardown: function() {}
      });



    };
  }
);