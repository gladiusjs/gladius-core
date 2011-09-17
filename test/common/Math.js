/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

  var engine = null;

  module( 'common/Math', {
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

  test( 'Math is available', function() {
    expect( 2 );

    ok(
        math,
        'Math found'
    );
    ok(
        math.ARRAY_TYPE,
        'Found ARRAY_TYPE'
    );
  });

  test( 'Vector2', function() {
    expect( 4 );
    
    var vec2 = new math.Vector2( 1, 2 );
    ok(
        vec2,
        'Construct a Vector2 instance'
    );
    ok(
        vec2 instanceof math.ARRAY_TYPE,
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

  test( 'Vector2 type', function() {
    expect( 1 );

    var vec1 = new math.Vector2( 1, 1 );
    ok(
        Math.sqrt( 2 ) === math.vector2.length( vec1 ),
        'Length of [1, 1]'
    );
  });

  test( 'Vector2 equality', function() {
    expect( 2 );

    var vec1 = new math.Vector2( 1, 1 );
    var vec2 = new math.Vector2( 1, 1 );
    var vec3 = new math.Vector2( 2, 3 );

    ok(
        math.vector2.equal( vec1, vec2 ),
        'Two identical vectors are equal'
    );
    ok(
        !math.vector2.equal( vec1, vec3 ),
        'Two different vectors are not equal'
    );
  });

  test( 'Vector2 operations', function() {
    expect( 6 );

    var vec1 = new math.Vector2( 1, 1 );
    var vec2 = new math.Vector2( 1, 1 );
    var vec3 = new math.Vector2( 2, 3 );
    ok(
        Math.sqrt( 2 ) === math.vector2.length( vec1 ),
        'Length of [1, 1]'
    );
    ok(
        math.vector2.equal( vec1, vec2 ),
        'Two identical vectors are equal'
    );
    ok(
        !math.vector2.equal( vec1, vec3 ),
        'Two different vectors are not equal'
    );
    
    var vec4 = new math.Vector2( 2, 2 );
    ok(
        math.vector2.equal( vec4, math.vector2.add( vec1, vec2 ) ),
        'Vector addition'
    );

    var vec5 = new math.Vector2( 1, 2 );
    ok(
        math.vector2.equal( vec5, math.vector2.subtract( vec3, vec2 ) ),
        'Vector subtraction'
    );

    math.vector2.iadd( vec1, vec2 );
    ok(
        math.vector2.equal( vec1, vec4 ),
        'In-place add'
    );
  });

  test( 'Vector2 constants', function() {
    expect( 4 );

    deepEqual(
        math.vector2.x,
        new math.Vector2( 1.0, 0.0 ),
        'Vector2.x'
    );
    deepEqual(
        math.vector2.y,
        new math.Vector2( 0.0, 1.0 ),
        'Vector2.y'
    );
    deepEqual(
        math.vector2.zero,
        new math.Vector2( 0.0, 0.0 ),
        'Vector2.zero'
    );
    deepEqual(
        math.vector2.one,
        new math.Vector2( 1.0, 1.0 ),
        'Vector2.one'
    );
  });

  test( 'Vector3', function() {
    expect( 4 );
    
    var vec3 = new math.Vector3( 1, 2, 3 );
    ok(
        vec3,
        'Construct a Vector3 instance'
    );
    ok(
        vec3 instanceof math.ARRAY_TYPE,
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
    
    var vec4 = new math.Vector4( 1, 2, 3, 4 );
    ok(
        vec4,
        'Construct a Vector4 instance'
    );
    ok(
        vec4 instanceof math.ARRAY_TYPE,
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

}());
