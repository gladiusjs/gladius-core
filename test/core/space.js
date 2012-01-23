/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null,
    TestComponent1 = null,
    TestComponent2 = null,
    TestComponent3 = null;

    module( 'core/Space', {
        setup: function () {
            stop();

            gladius.create( { debug: true }, function( instance ) {       
                engine = instance;
                
                TestComponent1 = engine.base.Component({
                	type: 'Apple'               
                },
                function( options ) {                	
                });

                TestComponent2 = engine.base.Component({
                	type: 'Apple'               
                },
                function( options ) {                	
                });

                TestComponent3 = engine.base.Component({
                	type: 'Orange'               
                },
                function( options ) {                	
                });

                
                start();
            });
        },

        teardown: function () {
            engine = null;
        }
    });

    test( 'Construction', function () {
        expect( 2 );

        var space = new engine.core.Space();
        ok(
                space,
                'New space is constructed.'
        );
        ok(
                space.size === 0,
                'Initial size is 0.'
        );
    });

    test( 'Entity', function() {
        expect( 5 );

        var space = new engine.core.Space();

        ok(
                space.size === 0,
                'Initial space size is 0.'
        );

        var entity = new space.Entity({ name: 'TestEntity' });

        ok(
                entity,
                'New entity is constructed.'
        );
        equal(
                entity.manager,
                space,
                'Entity manager is the space.'
        );
        ok(
                space.size === 1,
                'Size after entity creation is 1.'
        );

        space.remove( entity );

        ok(
                space.size === 0,
                'Size afer entity removal is 0.'
        );
    });

    test( 'Add a component to an entity', function() {
        expect( 9 );

        var space = new engine.core.Space();
        var entity = new space.Entity();
        var component = new TestComponent1();

        entity.add( component );

        equal(
                1,
                entity.size,
                'Entity has size 1'
        );
        ok(
                entity.contains( component.type ),
                'Entity contains component of correct type'
        );
        equal(
                component,
                entity.find( component.type ),
                'Can find component in entity'
        );
        equal(
                entity.find( component.type ).owner,
                entity,
                'Owner is set correctly'
        );

        var previousComponent = entity.remove( component.type );

        equal(
                component,
                previousComponent,
                'Component and removed component are the same'
        );
        ok(
                !previousComponent.owner,
                'Removed component has no owner'
        );
        equal(
                entity.size,
                0,
                'Entity size is 0 after removal'
        );
        ok(
                !entity.contains( component.type ),
                'Entity does not contain component of removed type'
        );
        ok(
                !entity.find( component.type ),
                'Cannot find component of type in entity'
        );
    });

    test( 'Add multiple components, same type', function() {
        expect( 2 );

        var space = new engine.core.Space();
        var entity = new space.Entity();

        // These components are both of type 'Apple'
        var component1 = new TestComponent1();
        var component2 = new TestComponent2();

        entity.add( component1 );
        var previousComponent = entity.add( component2 );

        equal(
                previousComponent,
                component1,
                'Removed component is component1'
        );
        equal(
                entity.size,
                1,
                'Entity has size 1 after adding component2'
        );
    });

    test( 'Add multiple components, different types', function() {
        expect( 7 );

        var space = new engine.core.Space();
        var entity = new space.Entity();

        // These components have different types, 'Apple' and 'Orange'
        var component1 = new TestComponent1();
        var component2 = new TestComponent3();

        entity.add( component1 );
        var previousComponent = entity.add( component2 );

        ok(
                !previousComponent,
                'No previous component is returned upon adding the second component'
        );
        equal(
                entity.size,
                2,
                'Entity size is 2 after adding both components'
        );
        equal(
                entity.find( component1.type ),
                component1,
                'Can find component1'
        );
        equal(
                entity.find( component2.type ),
                component2,
                'Can find component2'
        );

        previousComponent = entity.remove( component1.type );

        equal(
                entity.size,
                1,
                'Entity has size 1 after removing a component'
        );
        equal(
                entity.find( component2.type ),
                component2,
                'Can find component2 after removing component1'
        );
        ok(
                !entity.find( component1.type ),
                'Cannot find component1'
        );
    });

}());
