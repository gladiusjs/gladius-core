/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'core/lang', {
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

    // Note: this is here to test the remove operation I added to
    //       Array.prototype.
    test( 'Array.length', function() {
        expect( 5 );

        var element = {};
        var array = [];

        ok( array.length === 0, 'Initial array length is 0' );
        array.push( element );
        ok( array.indexOf( element ) === 0, 'Index of pushed element is 0' );
        ok( array.length === 1, 'Array length after push is 1' );
        array.remove( array.indexOf( element ) );
        ok( array.length === 0, 'Array length after remove is 0' );
        ok( array.indexOf( element ) === -1, 'Element is not found in array' );
    });

}());
