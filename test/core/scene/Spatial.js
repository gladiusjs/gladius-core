/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global paladin: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

  var engine = null;

  module( 'core/scene/Spatial', {
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

  test( 'Construction', function () {
    expect( 3 );

    var spatial = new engine.scene.Spatial();
    ok(
        spatial,
        'Construct a new spatial object'
    );
    same(
        spatial.position,
        new engine.math.Vector3( 0, 0, 0 ),
        'Default position is (0, 0, 0)'
    );
    same(
        spatial.rotation,
        new engine.math.Vector3( 0, 0, 0 ),
        'Default rotation is (0, 0, 0)'
    );
  });

  test( 'Assign position', function() {
    expect( 2 );

    var spatial = new engine.scene.Spatial();
    var newPosition = new engine.math.Vector3( 1, 2, 3 );
    spatial.position = newPosition;
    same(
        spatial.position,
        newPosition,
        'Spatial position is the same as new position'
    );
    newPosition[0] = 4;
    ok(
        1 === spatial.position[0],
        'Spatial position unchanged'
    );
  });

  test( 'Assign rotation', function() {
    expect( 2 );

    var spatial = new engine.scene.Spatial();
    var newRotation = new engine.math.Vector3( 1, 2, 3 );
    spatial.rotation = newRotation;
    same(
        spatial.rotation,
        newRotation,
        'Spatial rotation is the same as new rotation'
    );
    newRotation[0] = 4;
    ok(
        1 === spatial.rotation[0],
        'Spatial rotation unchanged'
    );
  });

}());
