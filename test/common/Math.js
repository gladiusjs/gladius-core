/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global paladin: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

  var engine = null;

  module( 'Math', {
    setup: function () {
      stop();

      paladin.create( { debug: true }, function( instance ) {       
          engine = instance;
          start();
      });
    },

    teardown: function () {
      engine = null;
    }
  });

  test( 'Math is available', function() {
    expect( 3 );

    ok(
        engine.math,
        'Math found'
    );
    ok(
        engine.math.Vector3,
        'Found Vector3'
    );
    ok(
        engine.math.Matrix4,
        'Found Matrix4'
    );
  });

/*
  test( 'Vector3', function() {
  });
*/

}());
