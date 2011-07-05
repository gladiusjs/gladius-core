(function (window, document, undefined, Paladin) {
  module("Paladin dummy subsystem", {
    setup: function () {
    },
    teardown: function () {
    }
  });

  test("dummy subsystem exists", function () {
    expect(1);
    notEqual(Paladin.subsystem.get('dummy'), undefined);
  });

  test("start function exists", function () {
    expect(1);
    var dummy = Paladin.subsystem.get('dummy');
    ok(dummy.start instanceof Function);
  });

  test("dummy function exists", function () {
    expect(1);
    var dummy = Paladin.subsystem.get('dummy');
    ok(dummy.dummy instanceof Function);
  });

  test("dummy subsystem was initialized after init", function () {
    expect(1);
    Paladin.init();
    var dummy = Paladin.subsystem.get('dummy');
    ok(dummy.dummy() === true);
  });

})(window, document, undefined, Paladin);
