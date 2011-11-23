/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'core/Component', {
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

    test( 'Construction', function () {
        expect( 3 );

        var TestComponent = function( options ) {
        };
        TestComponent.prototype = new engine.core.Component({
            type: 'Test'
        });
        TestComponent.prototype.constructor = TestComponent;

        var testComponent = new TestComponent();
        same(
                testComponent.type,
                'Test',
                'TestComponent has correct type.'        
        );
        same(
                testComponent.depends,
                {},
                'TestComponent depends is correct.'
        );
        ok(
                !testComponent.owner,
                'Component owner is not set'
        );

    });

}());
