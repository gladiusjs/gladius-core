(function ( window, document, CubicVR, Paladin ) {

function Game() {

    var paladin = new Paladin( {debug: true} );

    var scene = new paladin.Scene();
    paladin.graphics.pushScene( scene );

    var keysDown = {};
    
    var shipEntity = this.entity = new paladin.Entity({
      parent: scene,
      children: [
        new paladin.Entity({
          parent: shipEntity,
          components: [
            new paladin.component.Camera({
              targeted: false,
              position: [0, 10, -20],
              rotation: [0, 180, 0]
            }), //camera
            new paladin.component.Model( {
              mesh: new paladin.graphics.Mesh( { 
                loadFrom: "ship-main.xml",
                finalize: true
              })
            }) // XXX mesh.clean()
          ], //components
          init: function ( entity ) {
            var cameraComponent = entity.getComponents('graphics', 'camera');
            scene.setActiveCamera( cameraComponent );

            var shipModel = entity.getComponents('graphics', 'model');

            var cameraRoll = 0;
            paladin.tasker.add( {
              callback: function ( task ) {
                if ( keysDown['a'] ) {
                  shipEntity.spatial.rotation[1] += 1 * task.dt/20;
                  cameraRoll = Math.min(10, cameraRoll+1);
                }
                else if ( keysDown['d'] ) {
                  shipEntity.spatial.rotation[1] -= 1 * task.dt/20;
                  cameraRoll = Math.max(-10, cameraRoll-1);
                }
                else {
                  cameraRoll -= cameraRoll*.1 * task.dt/20;
                }
                entity.spatial.rotation[2] = -cameraRoll;
                shipModel.object.rotation[2] = -cameraRoll*5;
                
              }
            } );

          }
        }),
      ], //children
      listeners: {
        'a-up': function ( params ) {
          keysDown['a'] = false;
        },
        'a-down': function ( params ) {
          keysDown['a'] = true;
        },
        'd-up': function ( params ) {
          keysDown['d'] = false;
        },
        'd-down': function ( params ) {
          keysDown['d'] = true;
        }
      },
      
      init: function ( entity ) {
        var accel = 0.01;
        var shipFlyingTask = paladin.tasker.add( {
            callback: function ( task ) {
                var rotY = entity.spatial.rotation[1];
                
                var dirVec = [
                    Math.sin(rotY*Math.PI/180),
                    0,
                    Math.cos(rotY*Math.PI/180)
                ];

                dirVec = CubicVR.vec3.normalize(dirVec);

                entity.spatial.position[0] += dirVec[0] * accel * task.dt;
                entity.spatial.position[2] += dirVec[2] * accel * task.dt;

            }
        } );
      }
    });
    

    var boxes = [];
    for (var i=0; i<100; ++i) {
      (function () {
        var mesh = new paladin.graphics.Mesh( {
            primitives: [ {
                type: 'box',
                size: 0.5 + Math.random(),
                material: {
                  color: [Math.random(), Math.random(), Math.random()]
                }
            } ],
            finalize: true
        } );

        var box = new paladin.Entity();
        box.addComponent( new paladin.component.Model( {
            mesh: mesh
        } ) );
        box.spatial.position = [-50 + 100 * Math.random(), 
                                -5 + 10 * Math.random(),
                                -50 + 100 * Math.random()];
        box.spatial.rotation = [Math.random() * 360,
                                Math.random() * 360,
                                Math.random() * 360];
        box.setParent( scene );
        
        boxes.push(box);
      
      })();
    } //for

    var rotationTask = paladin.tasker.add( {
        callback: function( task ) {
          for ( var i=0, l=boxes.length; i<l; ++i) {
            boxes[i].spatial.rotation[0] += .1;
            boxes[i].spatial.rotation[1] += .2;
            boxes[i].spatial.rotation[2] += .3;
          }
        }
    } );
    
    this.run = function () {
      paladin.run();
    };

    window.foo = scene.graphics;

};

document.addEventListener('DOMContentLoaded', function (e) {
    var game = new Game();
    game.run();
}, false);

})(window, document, CubicVR, Paladin);
