/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global paladin: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

  var engine = null,
      TestComponent1 = null,
      TestComponent2 = null,
      TestComponent3 = null;

  module( 'core/Entity', {
    setup: function () {
      stop();

      paladin.create( { debug: true }, function( instance ) {       
          engine = instance;

          TestComponent1 = function( options ) {
          };
          TestComponent1.prototype = new engine.Component({
              type: 'One',
              depends: [],
              provides: []
          });
          TestComponent1.prototype.constructor = TestComponent1;
          TestComponent2 = function( options ) {
          };
          TestComponent2.prototype = new engine.Component({
              type: 'One',
              depends: [],
              provides: []
          });
          TestComponent2.prototype.constructor = TestComponent2;
          TestComponent3 = function( options ) {
          };
          TestComponent3.prototype = new engine.Component({
              type: 'Two',
              depends: [],
              provides: []
          });
          TestComponent3.prototype.constructor = TestComponent3;

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

  test( 'Add a component to an entity', function() {
    expect( 4 );

    var scene = new engine.Scene();
    var entity = new scene.Entity();
    var component = new TestComponent1();

    entity.add( component );
    equal(
        1,
        entity.size,
        'Entity has size 1'
    );
    ok(
        entity.contains( component.type ),
        'Entity contains component of correct type'
    );
    equal(
        component,
        entity.find( component.type ),
        'Can find component in entity'
    );
    equal(
        entity.find( component.type ).owner,
        entity,
        'Owner is set correctly'
    );
  });

}());
