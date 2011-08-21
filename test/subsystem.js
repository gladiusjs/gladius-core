/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global paladin: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

  var p;

  module("Before initialization", {
    setup: function () {
      stop();

      paladin.create({
        graphics: {
          canvas: document.getElementById('test-canvas')
        }
      }, function () {
        // Call paladin create again, so that
        // numDummies returns 2.
        paladin.create({
          graphics: {
            canvas: document.getElementById('test-canvas')
          }
        }, function (instance) {
          p = instance;
          start();
        });
      });
    },

    teardown: function () {
      p = null;
    }
  });

  test("dummy subsystem was initialized after init", function () {
    expect(2);

    ok(p.subsystem.dummy.dummy() === true, "inner scope");
    // Since loading of tests is async, this test may not load
    // first, all we can guarantee is that numDummies() will
    // be greater than 1.
    ok(p.subsystem.dummy.numDummies() > 1, "outer scope");
  });

}());
