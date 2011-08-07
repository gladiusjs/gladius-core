/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, document: false, window: false, module: false,
  test: false, expect: false, ok: false, notEqual: false, QUnit: false */

define( function( require ) {

  var paladin = require( 'paladin' ),
      p;

  module("Before initialization");

  test("dummy subsystem exists", function () {
    QUnit.stop();
    paladin.create({}, function (paladin) {
      expect(1);
      notEqual(paladin.subsystem.dummy, undefined);
      QUnit.start();
    });
  });

  module("Before initialization", {
    setup: function () {
      QUnit.stop();
      p = paladin.create({
        graphics: {
          canvas: document.getElementById('test-canvas')
        }
      }, function () {
        QUnit.start();
      });
    }
  });

  test("dummy function exists", function () {
    expect(1);
    ok(p.subsystem.dummy.dummy instanceof Function);
  });

  test("dummy subsystem was initialized after init", function () {
    expect(2);
    ok(p.subsystem.dummy.dummy() === true, "inner scope");
    ok(p.subsystem.dummy.numDummies() === 2, "outer scope");
  });

});
