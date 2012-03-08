/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false,
  KeyboardEvent: false, equal: false */

(function() {

    var engine = null;
    var lang;

    module( 'core/lang', {
        setup: function () {
            stop();

            gladius.create( { debug: true }, function( instance ) {       
                engine = instance;
                lang = engine.lang;
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

   // createTestKbdEvent is a partially implemented polyfill of sorts,
   // create to avoid excessively ugliness in the keyboard testing code.
   // It currently fails on WebKit-based browsers because of (at least)
   // WebKit bugs 16735 and 13368, but possibly also because of bugs in the
   // partial implementation that this tests.
   //
   // Events created this way are expected to be fragile; using them for
   // anything other than automated testing is discouraged. 
   test( 'createTestKbdEvent', function() {
     expect( 7 );
     
     var e = lang.createTestKbdEvent( "keydown",
                                       true,
                                       true,
                                       document.defaultView,
                                       'A',
                                       'A',
                                       0, // location
                                       "", // modifiersList
                                       false, // repeat
                                       ""); // localeArg
     ok( e instanceof KeyboardEvent, "created event is a KeyboardEvent");
     equal( e.type, "keydown", "type set to 'keydown'" );
     equal( e.bubbles, true, "bubbles set to true" );
     equal( e.cancelable, true, "cancelable set to true" );
     equal( e.view, window, "view set to window" );
     
     // depracted de facto standard: Webkit real: pass,
     // Webkit synthetic: fail, Firefox: pass
     equal( e.keyCode, 65, "keyCode property set");
     equal( e.charCode, 0, "charCode property set");

   });
}());
