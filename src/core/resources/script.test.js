define(
  [ "core/resources/script" ],
  function( Script ) {
    return function() {

      module( "Script", {
        setup: function() {},
        teardown: function() {}
      });

      test( "create a new script", function() {
        expect(2);

        var data = "function add( a, b ){return a + b;}";
        var script = new Script(data);

        equal(typeof script, "function", "script is a function");
        equal(script(1,2), 3, "script works properly as a function");

      });

      test( "create script with empty string", function(){
        expect(1);
        var data = "";
        raises(function(){
          new Script(data);
        }, Error, "empty script creation throws an exception");
      });

      test( "create script with no args", function(){
        expect(1);
        raises(function(){
          new Script();
        }, Error, "script creation with no parameters throws an exception");
      });

    };
  }
);