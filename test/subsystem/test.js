(function (window, document, undefined, Paladin) {
  var paladin;

  module("Paladin dummy subsystem", {
    setup: function () {
      paladin = new Paladin();
    },
    teardown: function () {
      delete paladin;
    },
  });

  test("dummy subsystem exists", function () {
    expect(1);
    notEqual(paladin.Subsystem.get('dummy'), undefined);
  });

  test("start function exists", function () {
    expect(2);
    var dummy = paladin.Subsystem.get('dummy');
    notEqual(dummy.start, undefined);
    equal(typeof(dummy.start), "function");
  });

  test("stop function exists", function () {
    expect(2);
    var dummy = paladin.Subsystem.get('dummy');
    notEqual(dummy.stop, undefined);
    equal(typeof(dummy.stop), "function");
  });

  test("Accessible from Paladin class and paladin object", function () {
    expect(1);
    equal(paladin.Subsystem.get('dummy'), Paladin.Subsystem.get('dummy')); 
  });

  test("Initialization is successful", function () {
    expect(1);
    paladin.Subsystem.start('dummy');
    equal(paladin.Subsystem.get('dummy').dummy(), true);
  });

  test("Destruction is successful", function () {
    expect(1);
    paladin.Subsystem.stop('dummy');
    equal(paladin.Subsystem.get('dummy').dummy(), false);
  });

})(window, document, undefined, Paladin);
