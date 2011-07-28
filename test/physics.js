/*global text,expect,ok,module,notEqual,Paladin,test,window,start,stop,console,asyncTest*/
(function (window, document, undefined, Paladin) {

  var paladin;

  module("physics", {
    setup: function () {

      paladin = new Paladin({
        graphics: {
          canvas: document.getElementById('test-canvas')
        },
      }); //Paladin

    },

    teardown: function () {
      paladin = null; // force as much to be GCed as we can
    }
  });

  test("Body object", function () {
    var body1 = new paladin.physics.Body({
      aabb: [[-3, -3, -3], [1, 1, 1]],
      position: [-1, -1, -1]
    });

    var body2 = new paladin.physics.Body({
      aabb: [[-2, -2, -2], [1, 1, 1]],
      position: [1, 1, 1]
    });

    var body3 = new paladin.physics.Body({
      aabb: [[5, 5, 5], [6, 6, 6]],
      position: [1, 1, 1]
    });

    ok( body1.testCollision( body2 ), "overlapping objects collide" );
    ok( !body1.testCollision( body3 ), "non-overlapping objects don't collide" );
  });

})(window, document, undefined, Paladin);
