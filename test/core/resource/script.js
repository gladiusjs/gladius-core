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

        engine.core.resource.get([{
            url: 'javascript://function%20add(%20a,%20b%20)%20%7B%20return%20a%20+%20b;%20%7D%20',
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
