/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global paladin: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

  var engine = null;

  module( 'core/scene/Node', {
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

    var node = new engine.scene.Node();
    ok(
        node,
        'Node is constructed'
    );
  });

  test( 'Set parent', function() {
    expect( 4 );

    var node1 = new engine.scene.Node();
    var node2 = new engine.scene.Node();

    node2.parent = node1;
    
    ok(
        node2.parent === node1,
        'Node 1 is the parent of node 2'
    );
    ok(
        node1.children.indexOf( node2 ) != -1,
        'Node 2 is a child of node 1'
    );

    node2.parent = null;

    ok(
        node2.parent === null,
        'Node 2 has no parent'
    );
    ok(
        node1.children.indexOf( node2 ) === -1,
        'Node 2 is not a child of node 1'
    );
  });

}());
