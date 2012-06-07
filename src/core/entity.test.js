define(
    [ "core/entity" ],
    function( Entity ) {
      return function() {

        module( "Entity", {
          setup: function() {},
          teardown: function() {}
        });

        test( "create a new entity without parameters", function() {
          expect( 5 );

          var entity = new Entity();
          ok( entity.hasOwnProperty( "id" ), "has an id" );
          equal( entity.size, 0, "no components" );
          equal( entity.tags.length, 0, "no tags" );
          equal( entity.parent, null, "no parent" );
          equal( entity.space, null, "no space" );
        });

        test( "create a new entity with a name", function() {
          expect( 1 );

          var entity = new Entity( "MyEntity" );
          equal( entity.name, "MyEntity", "name is correct" );
        });

        test( "create a new entity with some tags", function() {
          expect( 3 );

          var entity = new Entity( "MyEntity", [], ["Tag1", "Tag2"] );
          equal( entity.tags.length, 2, "correct number of tags" );
          ok( entity.tags.indexOf( "Tag1" ) >= 0, "tag is present" );
          ok( entity.tags.indexOf( "Tag2" ) >= 0, "tag is present" );
        });

        test( "create a new entity with a parent", function() {
          expect( 1 );

          var entity = new Entity( "MyEntity", [], [], 123 );
          equal( entity.parent, 123, "parent is correct" );
        });

        test( "create a new entity with some components", function() {
          expect( 3 );

          var component1 = {
              type: "Component1",
              dependsOn: [],
              setOwner: function() {}
          };
          var component2 = {
              type: "Component2",
              dependsOn: ["Component1"],
              setOwner: function() {}
          };

          var entity = new Entity( "MyEntity", [component1, component2] );
          ok( entity.hasComponent( "Component1" ), "has component" );
          ok( entity.hasComponent( "Component2" ), "has component" );
          equal(entity.size, 2, "entity size is 2");
        });

        test( "create with or add broken dependencies", function() {
          expect( 2 );

          var component1 = {
              type: "Component1",
              dependsOn: ["Component2"],
              setOwner: function() {}
          };
          var component2 = {
              type: "Component2",
              dependsOn: ["Component3"],
              setOwner: function() {}
          };

          raises( function() {
            var entity = new Entity( "MyEntity", [component2, component1] );
          }, Error, "exception thrown for creating broken dependencies" );

          var entity = new Entity( "MyEntity", []);
          raises( function() {
            entity.addComponent(component2);
          }, Error, "exception thrown for adding broken dependency");
        });

        test( "create with dependencies out of order", function() {
          expect( 1 );

          var component1 = {
            type: "Component1",
            dependsOn: ["Component2"],
            setOwner: function() {}
          };
          var component2 = {
            type: "Component2",
            dependsOn: [],
            setOwner: function() {}
          };

          var entity = new Entity( "MyEntity", [component1, component2] );

          ok(entity, "entity created properly");
        });

        test( "breaking dependencies in existing object", function() {
          expect( 1 );

          var component1 = {
            type: "Component1",
            dependsOn: [],
            setOwner: function() {}
          };
          var component2 = {
            type: "Component2",
            dependsOn: ["Component1"],
            setOwner: function() {}
          };

          var entity = new Entity( "MyEntity", [component1, component2] );
          raises( function() {
            entity.removeComponent("Component1");
          }, Error, "exception thrown for breaking dependency" );
        });

        test("addComponent adds a component successfully", function(){
          expect( 4 );

          var entity = new Entity( "MyEntity", [] );
          entity.onEntityComponentAdded = function(){
            ok(true, "entity component added event handler was called");
          };
          entity.addComponent(
          {
            type: "Component1",
            dependsOn: [],
            setOwner: function() {ok(true, "setOwner was called");}
          });
          ok("Component1" in entity._components, "component was added");
          equal(entity.size, 1, "size was incremented");
        });

        test("removeComponent removes a component successfully", function(){
          expect( 5 );

          var entity = new Entity( "MyEntity", [] );
          entity.addComponent(
            {
              type: "Component1",
              dependsOn: [],
              //This will get called twice- once when the component is added, and once when it is removed
              setOwner: function() {ok(true, "setOwner was called");}
            });
          entity.onEntityComponentRemoved = function(){
            ok(true, "entity component removed event handler was called");
          };
          entity.removeComponent("Component1");
          ok(!("Component1" in entity._components), "component was removed");
          equal(entity.size, 0, "size was decremented");
        });

        test("setParent sets the parent successfully", function(){
          expect(9);

          var childEntity = new Entity("childEntity", []);


          var firstParentEntity = new Entity("firstParentEntity", []);
          firstParentEntity.onChildEntityRemoved = function(event){
            equal(event.data, childEntity,
              "first parent's onChildEntityRemoved handler called with the child");
          };
          firstParentEntity.onChildEntityAdded = function(event){
            equal(event.data, childEntity,
              "first parent's onChildEntityAdded handler called with the child");
          };

          var secondParentEntity = new Entity("secondParentEntity", []);
          secondParentEntity.onChildEntityAdded = function(event){
            equal(event.data, childEntity,
              "second parent's onChildEntityAdded handler called with the child");
          };

          childEntity.onEntityParentChanged = function(event){
            equal(event.data.previous, null,
              "child's onEntityParentChanged handler called, previous parent is undefined");
            equal(event.data.current, firstParentEntity,
              "child's onEntityParentChanged handler called, current parent is correct");
          };

          //This should trigger the changed parent handler on the child and the
          //added child handler on first parent
          childEntity.setParent(firstParentEntity);
          equal(childEntity.parent,
            firstParentEntity,
            "child's parent is set to the first entity");

          childEntity.onEntityParentChanged = function(event){
            equal(event.data.previous, firstParentEntity,
              "child's onEntityParentChanged handler called, previous parent is correct");
            equal(event.data.current, secondParentEntity,
              "child's onEntityParentChanged handler called, current parent is correct");
          };

          //This should trigger the removed child handler on the first parent,
          //the changed parent handler on the child, and
          //the added child handler on the second parent
          childEntity.setParent(secondParentEntity);
          equal(childEntity.parent, secondParentEntity, "child's parent is set to the second entity");

        });

        test("setSpace sets the space successfully", function(){
          expect(7);

          var entity = new Entity("entity", []);

          var space = {name:"SomeSpace"};
          var space2 = {name:"SomeOtherSpace"};

          entity.onEntitySpaceChanged = function(event){
            equal(event.data.previous, null,
              "entity's space changed handler called, previous space is correct");
            equal(event.data.current, space,
              "entity's space changed handler called, previous space is correct");
          };

          entity.setSpace(space);
          equal(entity.space, space, "entity's space was set correctly");

          entity.onEntitySpaceChanged = function(event){
            equal(event.data.previous, space,
              "entity's space changed handler called, previous space is correct");
            equal(event.data.current, space2,
              "entity's space changed handler called, previous space is correct");
          };

          entity.setSpace(space2);
          equal(entity.space, space2, "entity's space was re-set correctly");

          entity.onEntitySpaceChanged = null;
          entity.active = true;

          entity.setSpace();

          equal(entity.active, false, "removing an entity's space sets active to false");

        });

        test("setActive sets the entity's active status properly", function(){
          expect(7);

          var entity = new Entity("entity", []);
          var space = {name:"SomeSpace"};

          entity.setSpace(space);

          entity.onEntityActivationChanged = function(event){
            equal(event.data, true,
              "entity's activation changed handler called with correct value of true");
          };
          entity.setActive(true);
          equal(entity.active, true, "entity.active set to true");

          entity.onEntityActivationChanged = function(event){
            equal(event.data, false,
              "entity's activation changed handler called with correct value of false");
          };
          entity.setActive(false);
          equal(entity.active, false, "entity.active set to false");

          entity.setSpace();

          entity.onEntityActivationChanged = function(event){
            equal(event.data, false,
              "entity's activation changed handler called with correct value of true");
          };
          entity.setActive(false);
          equal(entity.active, false, "entity.active set to false");

          raises(function(){
            entity.setActive(true);
          }, Error, "exception raised for trying to set a space-less entity to be active");

        });

        test("find component works properly", function(){
          expect(2);
          var component = {
            type: "Component",
            dependsOn: [],
            setOwner: function(){}
          };
          var entity = new Entity("entity", [component]);
          equal(entity.findComponent("NonExistent"), null,
            "find component returns null for nonexistent components");
          equal(entity.findComponent("Component"), component,
            "find component returns found component properly");
        });

        test("has component works properly", function(){
          expect(6);
          var component = {
            type: "Component",
            dependsOn: [],
            setOwner: function(){}
          };
          var component2 = {
            type: "Component2",
            dependsOn: [],
            setOwner: function(){}
          };
          var entity = new Entity("entity", [component, component2]);

          equal(entity.hasComponent(), true,
            "has component returns true when no argument is given");
          equal(entity.hasComponent([]), true,
            "has component returns true when an empty array is given");
          equal(entity.hasComponent("Component"), true,
            "has component returns true when given component exists");
          equal(entity.hasComponent("Nonexistent"), false,
            "has component returns false when given component does not exist");
          equal(entity.hasComponent(["Component2", "Component"]), true,
            "has component returns true when all given components exist");
          equal(entity.hasComponent(["Component2", "Component", "Nonexistent"]), false,"" +
            "has component returns false when any of the given components don't exist");
        });
      };
    }
);