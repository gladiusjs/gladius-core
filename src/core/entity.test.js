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
          equal(entity.size, 2, "entity size is 2")
        });

        test( "create with or add broken dependencies", function() {
          expect( 2 );

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

          raises( function() {
            var entity = new Entity( "MyEntity", [component2, component1] );
          }, Error, "exception thrown for creating broken dependencies" );

          var entity = new Entity( "MyEntity", []);
          raises( function() {
            entity.addComponent(component2);
          }, Error, "exception thrown for adding broken dependency")
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
          entity.onEntityComponentAdded = function(){ok(true, "entity component added event handler was called")};
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
          entity.onEntityComponentRemoved = function(){ok(true, "entity component removed event handler was called")};
          entity.removeComponent("Component1");
          ok(!("Component1" in entity._components), "component was removed");
          equal(entity.size, 0, "size was decremented");
        });

        test("setParent sets the parent successfully", function(){
          expect(9);

          var childEntity = new Entity("childEntity", []);


          var firstParentEntity = new Entity("firstParentEntity", []);
          firstParentEntity.onChildEntityRemoved = function(child){
            equal(child, childEntity,
              "first parent's onChildEntityRemoved handler called with the child");
          };
          firstParentEntity.onChildEntityAdded = function(child){
            equal(child, childEntity,
              "first parent's onChildEntityAdded handler called with the child")
          };

          var secondParentEntity = new Entity("secondParentEntity", []);
          secondParentEntity.onChildEntityAdded = function(child){
            equal(child, childEntity,
              "second parent's onChildEntityAdded handler called with the child")
          };

          childEntity.onEntityParentChanged = function(previous, current){
            equal(previous, undefined,
              "child's onEntityParentChanged handler called, previous parent is undefined");
            equal(current, firstParentEntity,
              "child's onEntityParentChanged handler called, current parent is correct")
          };

          //This should trigger the changed parent handler on the child and the
          //added child handler on first parent
          childEntity.setParent(firstParentEntity);
          equal(childEntity.parent,
            firstParentEntity,
            "child's parent is set to the first entity");

          childEntity.onEntityParentChanged = function(previous, current){
            equal(previous, firstParentEntity,
              "child's onEntityParentChanged handler called, previous parent is correct");
            equal(current, secondParentEntity,
              "child's onEntityParentChanged handler called, current parent is correct")
          };

          //This should trigger the removed child handler on the first parent,
          //the changed parent handler on the child, and
          //the added child handler on the second parent
          childEntity.setParent(secondParentEntity);
          equal(childEntity.parent, secondParentEntity, "child's parent is set to the second entity");

        });

        test("setSpace sets the space successfully", function(){
          expect(2);

          var entity = new Entity("entity", []);
          entity.onEntitySpaceChanged = new function(){ok(true, "entity's onEntitySpaceChanged handler called")};

          var space = {name:"SomeSpace"};

          entity.setSpace(space);
          equal(entity.space, space, "entity's space was set correctly");
        });

        test("setActive sets the entity to be active properly", function(){
          expect(2);

          var entity = new Entity("entity", []);
          entity.onEntityActivationChanged = new function(){ok(true, "entity's onEntitySpaceChanged handler called")};

          var space = {name:"SomeSpace"};

          entity.setSpace(space);
          equal(entity.space, space, "entity's space was set correctly");
        });

//        function onChildEntityRemoved( event )
//        onChildEntityAdded
//        handleEvent
//        hasComponent
//        setActive
//        findComponent
      };
    }
);