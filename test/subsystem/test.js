(function (window, document, Paladin) {
  var paladin;

  module("Paladin dummy subsystem", {
    setup: function () {
      paladin = new Paladin();
    },
    teardown: function () {
      delete paladin;
    },
  });

  test("Accessible from Paladin class and paladin object", function () {
    expect(1);
    equals(paladin.Subsystem.get('dummy'), Paladin.Subsystem.get('dummy')); 
  });

})(window, document, Paladin);
