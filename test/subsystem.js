/*global text,expect,ok,module,notEqual,Paladin,test,window*/
(function (window, document, undefined, Paladin) {

  var paladin;

  module("Before initialization");

  test("dummy subsystem exists", function () {
    expect(1);
    notEqual(Paladin.subsystem.get('dummy'), undefined);
  });

  module("Before initialization", {
    setup: function () {
      paladin = new Paladin();
    }
  });

  test("dummy function exists", function () {
    expect(1);
    ok(paladin.dummy.dummy instanceof Function);
  });

  test("dummy subsystem was initialized after init", function () {
    expect(2);
    ok(paladin.dummy.dummy() === true, "inner scope");
    ok(paladin.dummy.numDummies() === 2, "outer scope");
  });

})(window, document, undefined, Paladin);
