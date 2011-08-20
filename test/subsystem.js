/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, document: false, window: false, module: false,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

define( function( require ) {

  var p = require( 'paladin' ),
      paladin;

  module("Before initialization", {
    setup: function () {
      stop();

      p.create({
        graphics: {
          canvas: document.getElementById('test-canvas')
        }
      }, function () {
        // Call paladin create again, so that
        // numDummies returns 2.
        p.create({
          graphics: {
            canvas: document.getElementById('test-canvas')
          }
        }, function (instance) {
          paladin = instance;
          start();
        });
      });
    },

    teardown: function () {
      paladin = null;
    }
  });

  test("dummy subsystem was initialized after init", function () {
    expect(2);

    ok(paladin.subsystem.dummy.dummy() === true, "inner scope");
    // Since loading of tests is async, this test may not load
    // first, all we can guarantee is that numDummies() will
    // be greater than 1.
    ok(paladin.subsystem.dummy.numDummies() > 1, "outer scope");
  });

});
