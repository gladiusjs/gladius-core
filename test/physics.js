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
    });

    var body2 = new paladin.physics.Body({
      aabb: [[-2, -2, -2], [1, 1, 1]],
    });

    var body3 = new paladin.physics.Body({
      aabb: [[5, 5, 5], [6, 6, 6]],
    });

    ok( body1.testCollision( body2 ), "overlapping objects collide" );
    ok( !body1.testCollision( body3 ), "non-overlapping objects don't collide" );
  });

  test("Universe", function () {
    var body1 = new paladin.physics.Body({
      aabb: [[-3, -3, -3], [1, 1, 1]],
    });

    var body2 = new paladin.physics.Body({
      aabb: [[-2, -2, -2], [1, 1, 1]],
    });

    var body3 = new paladin.physics.Body({
      aabb: [[5, 5, 5], [6, 6, 6]],
    });

    var universe = new paladin.physics.Universe();

    var collisions = universe.advance();
    ok( collisions.length === 0, "no collisions yet");

    universe.addBody( body1 );
    universe.addBody( body2 );
    universe.addBody( body3 );

    collisions = universe.advance(1);
    ok( collisions.length === 1, "a collision!" );
    console.log( collisions.length );

    body2.setAcceleration([20, 0, 0]);
    collisions = universe.advance(.1);
    ok( collisions.length === 1, "a collision still!" );

    collisions = universe.advance(1);
    ok( collisions.length === 0, "no more collisions" );
  });

})(window, document, undefined, Paladin);
