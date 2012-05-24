define(
    [ "core/space", "core/clock" ],
    function( Space, Clock ) {
      return function() {

        module( "Space", {
          setup: function() {},
          teardown: function() {}
        });
        
        test("Constructing a space", function(){
          expect(-1);

          // test construction without a clock;          
          var mySpace = new Space();
          
          okay(mySpace.id, "space has an id");
          equal(mySpace.size, 0, "space has no entities");
          deepEqual(mySpace._entities, {}, "entity object is empty");
          deepEqual(mySpace._nameIndex, {}, "nameIndex object is empty");
          deepEqual(mySpace._tagIndex, {}, "tagIndex object is empty");
          okay(mySpace.clock instanceof Clock);
          // TD test signal is same as simulation with no args to constructor
        });
               
      };
    }
);