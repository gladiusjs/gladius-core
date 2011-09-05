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
    expect( 2 );

    ok(
        engine.math,
        'Math found'
    );
    ok(
        engine.math.ARRAY_TYPE,
        'Found ARRAY_TYPE'
    );
  });

  test( 'Vector2', function() {
    expect( 4 );
    
    var vec2 = new engine.math.Vector2( 1, 2 );
    ok(
        vec2,
        'Construct a Vector2 instance'
    );
    ok(
        vec2 instanceof engine.math.ARRAY_TYPE,
        'vec2 is an instance of ARRAY_TYPE'
    );
    ok(
        2 === vec2.length,
        'vec2 has length 2'
    );
    ok(
        vec2[0] === 1 && vec2[1] === 2,
        'vec2 elements are [1, 2]'
    );
  });

  test( 'Vector2 operations', function() {
    expect( 1 );

    var vec2 = new engine.math.Vector2( 1, 1 );
    ok(
        Math.sqrt( 2 ) === engine.math.vector2.length( vec2 ),
        'Length of [1, 1]'
    );
  });

  test( 'Vector3', function() {
    expect( 4 );
    
    var vec3 = new engine.math.Vector3( 1, 2, 3 );
    ok(
        vec3,
        'Construct a Vector3 instance'
    );
    ok(
        vec3 instanceof engine.math.ARRAY_TYPE,
        'vec3 is an instance of ARRAY_TYPE'
    );
    ok(
        3 === vec3.length,
        'vec3 has length 3'
    );
    ok(
        vec3[0] === 1 && vec3[1] === 2 && vec3[2] === 3,
        'vec3 elements are [1, 2, 3]'
    );
  });

  test( 'Vector4', function() {
    expect( 4 );
    
    var vec4 = new engine.math.Vector4( 1, 2, 3, 4 );
    ok(
        vec4,
        'Construct a Vector4 instance'
    );
    ok(
        vec4 instanceof engine.math.ARRAY_TYPE,
        'vec4 is an instance of ARRAY_TYPE'
    );
    ok(
        4 === vec4.length,
        'vec4 has length 4'
    );
    ok(
        vec4[0] === 1 && vec4[1] === 2 && vec4[2] === 3 && vec4[3] === 4,
        'vec4 elements are [1, 2, 3, 4]'
    );
  });

  test( 'Constants', function() {
    expect( 1 );

    ok(
        engine.math.x[0] === 1.0 && engine.math.x[1] === 0.0 && engine.math.x[2] === 0.0 && engine.math.x[3] === 0.0,
        'x'
    );
  });

}());
