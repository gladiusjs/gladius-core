if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define(
    [ "common/extend" ],
    function( extend ) {
      return function() {

        module( "extend", {
          setup: function() {},
          teardown: function() {}
        });
        
        test( "extend an object", function() {
          expect( 4 );
          
          var object1 = {
              x: 0,
              y: "1"
          };
          var object2 = {
              z: "Hello world!"
          };
          
          extend( object1, object2 );
          equal( object1["x"], 0, "destination object has property x" );
          equal( object1["y"], "1", "destination object has property y" );
          equal( object1["z"], "Hello world!", 
              "desgination object has property z" );
          equal( object2["z"], object1["z"], "source object is intact" );
        });
        
        test( "extend with duplicate properties", function() {
          expect( 1 );
          
          var object1 = {
              x: 0,
              y: 1
          };
          var object2 = {
              y: 2,
              z: 3
          };
          
          extend( object1, object2 );
          equal( object1["y"], 1, "duplicate value is correct" );
        });
        
      };
    }
);