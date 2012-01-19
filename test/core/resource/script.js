/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false,
  asyncTest: false, same: false */

(function() {

    var engine = null;

    module( 'core/resource/Script', {
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

    asyncTest( '?', function () {
        expect( 1 );

        engine.core.resource.Script({
            url: 'assets/test-script.json',
            onsuccess: function( instance ) {
                same(
                    3,
                    instance.run( 1, 2 ),
                    'Function runs and returns correct value'
                );
                start();
            }
        });

    });

}());
