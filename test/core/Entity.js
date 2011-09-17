/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'core/Entity', {
        setup: function () {
            stop();

            gladius.create( { debug: true }, function( instance ) {       
                engine = instance;
                start();
            });
        },

        teardown: function () {
            engine = null;
        }
    });

    test( 'Construction', function() {
        expect( 1 );

        var entity = new engine.core.Entity();
        ok(
                entity,
                'New entity is constructed.'
        );
    });

    test( 'Id', function() {
        expect( 2 );

        var entity1 = new engine.core.Entity();
        ok(
                entity1.id === 1,
                'First entity id is 1.'
        );

        var entity2 = new engine.core.Entity();
        ok(
                entity2.id === 2,
                'Second entity id is 2.'
        );
    });

}());
