/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false,
  equal: false */

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

    test( 'new Entity creation', function() {
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



}());
