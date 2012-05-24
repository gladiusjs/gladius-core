define(
    [ "core/space", "core/clock", "core/entity" ],
    function( Space, Clock, Entity ) {
      return function() {

        module( "Space", {
          setup: function() {},
          teardown: function() {}
        });
        
        test("Constructing a space with new clock", function(){
          expect(6);
          var clock = new Clock();
          var mySpace = new Space(clock);
          
          ok(mySpace.id, "space has an id");
          equal(mySpace.size, 0, "space has no entities");
          deepEqual(mySpace._entities, {}, "entity object is empty");
          deepEqual(mySpace._nameIndex, {}, "nameIndex object is empty");
          deepEqual(mySpace._tagIndex, {}, "tagIndex object is empty");
          ok(mySpace.clock instanceof Clock);
        });

        test("Constructing a space without a clock", function(){
          expect(6);

          // test construction without a clock;
          var mySpace = new Space();

          //TODO: Figure out why calling new Space without a parameter works at
          // all in any case, and determine what should be done in the case when
          //one isn't passed in, because it just breaks right now
          ok(mySpace.clock instanceof Clock);
        });

        test("Add entities works normally", function(){
          expect(8);
          var clock = new Clock();
          var mySpace = new Space(clock);

          var entityDupe1 = new Entity("duplicate", [], ["uniqueTag1", "commonTag"]);
          var entityDupe2 = new Entity("duplicate", [], ["uniqueTag2", "commonTag"]);
          var uniqueNameEntity = new Entity("unique", [], ["commonTag"]);
          var emptyEntity = new Entity();

          mySpace.add(emptyEntity);
          equal(mySpace.size, 1, "empty entity added properly");

          mySpace.add(uniqueNameEntity);
          equal(mySpace.findNamed("unique"), uniqueNameEntity, "single entity added properly");

          mySpace.add(entityDupe1);
          mySpace.add(entityDupe2);
          equal(mySpace.findAllNamed("duplicate").length, 2,
            "make sure that multiple colliding names are shoved into an array");
          equal(mySpace.findNamed("duplicate").tags[0], "uniqueTag1",
            "make sure that findNamed returns the first of duplicate names");

          deepEqual(mySpace.findAllTagged("commonTag"), [uniqueNameEntity, entityDupe1, entityDupe2],
            "find all tagged returns the correct items");

          equal(mySpace.findTagged("uniqueTag1"), entityDupe1,
            "find tagged returns the first of multiple entities with the same tag");

          var parentEntity = new Entity("parent", [], []);
          var childEntity = new Entity("child", [], [], parentEntity);

          mySpace.add(parentEntity);
          equal(mySpace.findNamed("child"), childEntity,
            "space recursively adds child entities");

          mySpace.remove(parentEntity);
          equal(mySpace.findNamed("child"), null,
            "space recursively removes child entities");


          //Find entities with a given component type
        });
               
      };
    }
);