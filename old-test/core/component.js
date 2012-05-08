/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false,
  same: false */

(function() {

    var engine = null;

    module( 'base/Component', {
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

        var TestComponent = engine.base.Component({
          type: 'Test'
        },
        function( options ) {
        });

        var testComponent = new TestComponent();
        same(
                testComponent.type,
                'Test',
                'TestComponent has correct type.'        
        );
        same(
                testComponent.depends,
                [],
                'TestComponent depends is correct.'
        );
        ok(
                !testComponent.owner,
                'Component owner is not set'
        );

    });

}());
