define(
    [ "core/space", "core/clock", "core/entity" ],
    function( Space, Clock, Entity ) {
      return function() {

        module( "Space", {
          setup: function() {},
          teardown: function() {}
        });
 
        
        test("Constructing a space with new clock", function(){
          expect(3);
          var clock = new Clock();
          var mySpace = new Space(clock);
          
          ok(mySpace.id, "space has an id");
          equal(mySpace.size, 0, "space has no entities");
          ok(mySpace.clock instanceof Clock);
        });


        test("basic adding, removing, and finding entities works", function(){
          expect(8);
          var clock = new Clock();
          var mySpace = new Space(clock);

          var entityDupe1 = new Entity("duplicate", [], ["uniqueTag1"]);
          var entityDupe2 = new Entity("duplicate", [], []);
          var uniqueNameEntity = new Entity("unique", [], []);
          var emptyEntity = new Entity();
          var result = null;

          result = mySpace.add(emptyEntity);
          equal(mySpace.size, 1, "empty entity added properly");
          equal(result, mySpace, "add returns space instance");

          mySpace.add(uniqueNameEntity);
          equal(mySpace.findNamed("unique"), uniqueNameEntity,
            "single entity added properly");

          mySpace.add(entityDupe1);
          mySpace.add(entityDupe2);
          equal(mySpace.findAllNamed("duplicate").length, 2,
            "make sure that multiple colliding names are shoved into an array");
          equal(mySpace.findNamed("duplicate").tags[0], "uniqueTag1",
            "make sure that findNamed returns the first of duplicate names");

          result = mySpace.remove(uniqueNameEntity);
          equal(result, mySpace, "remove returns space instance");
          mySpace.remove(emptyEntity);
          mySpace.remove(entityDupe1);
          mySpace.remove(entityDupe2);
          equal(mySpace.size, 0,
            "removing all added entities results in empty space");

          raises(function() {
            mySpace.remove(uniqueNameEntity); // already removed
          }, "removing an entity that is not in a space should throw");
          
        });

        
        test("add and remove handle entities with children", function() {
          expect(2);
          var clock = new Clock();
          var mySpace = new Space(clock);          
          
          var parentEntity = new Entity("parent", [], []);
          var childEntity = new Entity("child", [], [], parentEntity);

          mySpace.add(parentEntity);
          equal(mySpace.findNamed("child"), childEntity,
            "space recursively adds child entities");

          mySpace.remove(parentEntity);
          equal(mySpace.findNamed("child"), null,
            "space recursively removes child entities");
        });


        test("finding tagged entities", function() {
          expect(6);
          var clock = new Clock();
          var mySpace = new Space(clock);          

          var entity1 = new Entity("entity1", [], ["tag1"]);
          var entity2 = new Entity("entity2", [], ["tag2", "tag1"]);
          
          equal(mySpace.findTagged("tag1"), null, 
            "findTagged should return null if no entities present");

          deepEqual(mySpace.findAllWith("tag1"), [], 
            "findAllTagged should return empty array if no entities present");
            
          mySpace.add(entity1);
          mySpace.add(entity2);

          // note that these tests enforce return in the order entities added
          deepEqual(mySpace.findTagged("tag1"), entity1, 
            "findTagged should return the first entity added of a given type");
          deepEqual(mySpace.findAllTagged("tag1"), [entity1, entity2], 
            "findAllTagged should return all entities of a given type in order");

          equal(mySpace.findTagged("NoSuchTag"), null, 
            "findTagged should return null if no entities of given type present");
          deepEqual(mySpace.findAllTagged("NoSuchTag"), [], 
            "findAllTagged should return [] if no entities of given type present");
        });
                
        
        test("finding entities with a type of component", function() {
          expect(6);
          var clock = new Clock();
          var mySpace = new Space(clock);          

          var component1 = {
              type: "Type1",
              dependsOn: [],
              setOwner: function() {}
          };

          var entity1 = new Entity("entity1", [component1], []);
          var entity2 = new Entity("entity2", [component1], []);

          equal(mySpace.findWith("Type1"), null, 
            "findWith should return null if no entities present");

          deepEqual(mySpace.findAllWith("Type1"), [], 
            "findAllWith should return empty array if no entities present");
            
          mySpace.add(entity1);
          mySpace.add(entity2);

          // note that these tests enforce return in the order entities added
          deepEqual(mySpace.findWith("Type1"), entity1, 
            "findWith should return the first entity added of a given type");
          deepEqual(mySpace.findAllWith("Type1"), [entity1, entity2], 
            "findAllWith should return all entities of a given type in order");

          equal(mySpace.findWith("NoSuchType"), null, 
            "findWith should return null if no entities of given type present");
          deepEqual(mySpace.findAllWith("NoSuchType"), [], 
            "findAllWith should return [] if no entities of given type present");
        });
               
      };
    }
);