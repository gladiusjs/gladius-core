/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global paladin: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

  var engine = null;

  module( 'core/Entity', {
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
    expect( 1 );

    var entity = new engine.Entity();
    ok(
        entity,
        'New entity is constructed.'
    );
  });

  test( 'Id', function() {
    expect( 3 );

    var entity1 = new engine.Entity();
    var entity2 = new engine.Entity();
    entity1.init();
    entity2.init();
    ok(
        entity1.id === 1,
        'Entity id is 1'
    );
    ok(
        entity2.id === 2,
        'Entity id is 2'
    );
    ok(
        entity1.id != entity2.id,
        'Entity1 and entity2 have different ids'
    );
  });

}());
