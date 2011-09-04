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
    expect( 4 );

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
    ok(
        engine.math.FLOAT_ARRAY_TYPE,
        'Found FLOAT_ARRAY_TYPE'
    );
  });

  test( 'Vector3', function() {
    expect( 3 );
    
    var vec3 = new engine.math.Vector3( 1, 2, 3 );
    ok(
        vec3,
        'Construct a Vector3 instance'
    );
    ok(
        vec3 instanceof engine.math.FLOAT_ARRAY_TYPE,
        'vec3 is an instance of FLOAT_ARRAY_TYPE'
    );
    ok(
        vec3[0] === 1 && vec3[1] === 2 && vec3[2] === 3,
        'vec3 elements are [1, 2, 3]'
    );
  });

}());
