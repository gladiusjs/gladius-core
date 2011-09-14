/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global paladin: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

  var engine = null;

  module( 'core/Scene', {
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
    expect( 2 );

    var scene = new engine.Scene();
    ok(
        scene,
        'New scene is constructed.'
    );
    ok(
        scene.size === 0,
        'Initial size is 0.'
    );
  });

  test( 'Entity', function() {
    expect( 5 );

    var scene = new engine.Scene();

    ok(
        scene.size === 0,
        'Initial scene size is 0.'
    );

    var entity = new scene.Entity({ name: 'TestEntity' });

    ok(
        entity,
        'New entity is constructed.'
    );
    ok(
        entity.manager === scene,
        'Entity manager is the scene.'
    );
    ok(
        scene.size === 1,
        'Size after entity creation is 1.'
    );

    scene.remove( entity );
   
    ok(
        scene.size === 0,
        'Size afer entity removal is 0.'
    );
  });

}());
