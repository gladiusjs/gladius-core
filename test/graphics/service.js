/*jshint white: false, strict: false, plusplus: false, onevar: false,
 nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
 test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false,
 asyncTest: false, equal: false */

( function() {

  var engine = null;

  module('graphics/service', {
    setup : function() {
      stop();

      var canvas = document.getElementById("test-canvas");
      gladius.create({
        debug : true,
        services : {
          graphics : {
            src : 'graphics/service',
            options : {
              canvas : canvas
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

  function createCubeMesh() {
    var point = 0.5;

    var meshData = {
            points:   [
                [ point, -point,  point],
                [ point,  point,  point],
                [-point,  point,  point],
                [-point, -point,  point],
                [ point, -point, -point],
                [ point,  point, -point],
                [-point,  point, -point],
                [-point, -point, -point]
                      ],
            faces:    [
                [0, 1, 2, 3],
                [7, 6, 5, 4],
                [4, 5, 1, 0],
                [5, 6, 2, 1],
                [6, 7, 3, 2],
                [7, 4, 0, 3]
                      ],
            uv:       [
                [ [0, 1], [1, 1], [1, 0], [0, 0] ],
                [ [0, 1], [1, 1], [1, 0], [0, 0] ],
                [ [0, 1], [1, 1], [1, 0], [0, 0] ],
                [ [0, 1], [1, 1], [1, 0], [0, 0] ],
                [ [0, 1], [1, 1], [1, 0], [0, 0] ],
                [ [0, 1], [1, 1], [1, 0], [0, 0] ]
                      ],
            uvmapper: {
                projectionMode: "cubic",
                scale: [1, 1, 1]
                      }
        };
 
    return new engine.graphics.resource.Mesh(meshData);
  }


  test('Construction', function() {
    expect(1);
    ok(engine.graphics, 'graphics subsystem exists');
  });


  asyncTest('Test render', function() {
    expect(1);
    var scene = new engine.core.Space(), 
        cameraEntity = new scene.Entity(), 
        modelEntity = new scene.Entity();

    var canvas = engine.graphics.target.element;

    var cameraComponent = new engine.graphics.component.Camera({
      active : true,
      width : canvas.width,
      height : canvas.height,
      fov : 60
    });
    cameraEntity.add(new engine.core.component.Transform({
      position : [1, 1, 1]
    }));
    cameraEntity.add(cameraComponent);
    cameraComponent.target = [0.2, 0, 0];

    modelEntity.add(new engine.core.component.Transform({
      position : [0, 0, 0]
    }));


    var modelComponent = new engine.graphics.component.Model({
      mesh : createCubeMesh(),
      material : new engine.graphics.resource.Material({ color : [1, 0.2, 0] } )
    });

    cameraEntity.add(new engine.graphics.component.Light({ intensity : 50 }));

    modelEntity.add(modelComponent);
    engine.graphics.render();
    engine.run();
    setTimeout(function() {
      engine.run();
      ok(engine.graphics.renderedFrames > 2, "Graphics task is rendering");
      start();
    }, 500);
  });
}());
