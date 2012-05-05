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

          var entity = new Entity( "MyEntity", [component1, component2] );
          ok( entity.hasComponent( "Component1" ), "has component" );
          ok( entity.hasComponent( "Component2" ), "has component" );
        });

        test( "create a new entity with broken dependencies", function() {
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

          raises( function() {
            var entity = new Entity( "MyEntity", [component2, component1] );
          }, Error, "exception thrown for broken dependency" );
        });

      };
    }
);