/*global gladius:false, module:false, expect:false, ok:false, stop:false, 
  test:false, start:false */
( function() {

  var engine = null;

  module('input/service', {
    setup : function() {
      stop();

      var canvas = document.getElementById("test-canvas");
      gladius.create({
        debug : true,
        services : {
          input : {
            src : 'input/service',
            options : {
            }
          }
        }
      }, function(instance) {
        engine = instance;
        start();
      });
    },
    teardown : function() {
      engine = null;
    }
  });

  test('Construction', function() {
    expect(3);
    ok(engine.input, 'input subsystem exists');

    var controller = new engine.input.component.Controller();
    ok( controller, "input Controller creation works" );
       
    var space = new engine.core.Space();
    var entity = space.Entity({
                               name: 'test',
                               components: [controller]
                              });
    ok( entity.find( 'Controller'), "controller can be embedded in Entity" );
  });
}());
