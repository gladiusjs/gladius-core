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

    asyncTest( 'construct and load a script', function () {
        expect( 1 );            

        engine.core.resource.get([{
            url: 'assets/test-script.js',
            type: engine.core.resource.Script,
            onsuccess: function( instance ) {
                same(
                    3,
                    instance.run( 1, 2 ),
                    'Function runs and returns correct value'
                );
                start();
            }
        }],
        {
            oncomplete: function() {}
        });
    });
    
    asyncTest( 'construct and load a script from a javascript URI', function() {
        expect( 1 );
        
        var js = 'javascript://' + encodeURIComponent( 'function add( a, b ) { return a + b; }' );

        engine.core.resource.get([{
            url: js,
            type: engine.core.resource.Script,
            onsuccess: function( instance ) {
                same(
                    7,
                    instance.run( 3, 4 ),
                    'Function runs and returns correct value'
                );
                start();
            }
        }],
        {
            oncomplete: function() {}
        });        
    });

}());
