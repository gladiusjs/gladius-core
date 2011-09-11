/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global paladin: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

  var engine = null;

  module( 'core/Component', {
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
    expect( 0 );

    var TestComponent = function( options ) {

        var _owner = null;
        Object.defineProperty( this, 'owner', {
            get: function() {
                return _owner;
            },
            set: function( value ) {
                if( value != _owner )
                    _owner = value;
            }
        });

    };
    TestComponent.prototype = new engine.Component({
        type: 'Test',
        depends: [],
        provides: ['Test']
    });
    TestComponent.prototype.constructor = TestComponent;

    var testComponent = new TestComponent();
    same(
        testComponent.type,
        'Test',
        'TestComponent has correct type.'        
    );
    same(
        testComponent.depends,
        [],
        'TestComponent depends is correct.'
    );
    same(
        testComponent.provides,
        ['Test'],
        'TestComponent provides is correct.'
    );
    testComponent.owner = 0;
    same( testComponent.owner,
          0,
          'TestComponent has owner 0.'
    );

  });

}());
