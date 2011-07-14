(function ( window, document, CubicVR, Paladin ) {

/*
function Game() {
    
    Paladin.init();
    var scene = new Paladin.Scene();
    Paladin.graphics.pushScene( scene );
    
    var camera = new Paladin.Entity();
    camera.spatial.position = [0, 0, 0];
    var cameraComponent = new Paladin.component.Camera();
    camera.addComponent( cameraComponent );
    camera.setParent( scene );
    scene.graphics.bindCamera( cameraComponent.camera );    // FIXME
    
    var box = new Paladin.Entity();
    box.spatial.position = [-1, 0, 0];
    var mesh = new Paladin.graphics.Mesh( {
        primitives: [ {
            type: 'box',
            size: 0.5,
            material: {
                color: [1, 0, 0]
            }
        } ],
        finalize: true
    } );
    box.addComponent( new Paladin.component.Model ( {
        mesh: mesh
    } ) );
    box.setParent( scene );
    cameraComponent.camera.target = box.spatial.position;
    
    this.run = function () {
        Paladin.run();
    };
};    
*/
    

function Game() {

    Paladin.init( {debug: true} );

    var scene = new Paladin.Scene();
    Paladin.graphics.pushScene( scene );

    var keysDown = {};
    
    var shipEntity = this.entity = new Paladin.Entity({
      parent: scene,
      children: [
        new Paladin.Entity({
          parent: shipEntity,
          components: [
            new Paladin.component.Camera({
              targeted: false,
              position: [0, 0.5, -0.5],
              rotation: [0, 180, 0]
            }) //camera
          ], //components
          init: function ( entity ) {
            var cameraComponent = entity.getComponents('graphics', 'camera');
            cameraComponent.camera.rotation[1] = 180;
            cameraComponent.camera.position[1] = 18;
            cameraComponent.camera.position[2] = -40;

            scene.setActiveCamera( cameraComponent );

            var cameraRoll = 0;
            Paladin.tasker.add( {
              callback: function ( task ) {
                if ( keysDown['a'] ) {
                  shipEntity.spatial.rotation[1] += 1;
                  cameraRoll = Math.min(10, cameraRoll+1);
                }
                else if ( keysDown['d'] ) {
                  shipEntity.spatial.rotation[1] -= 1;
                  cameraRoll = Math.max(-10, cameraRoll-1);
                }
                else {
                  cameraRoll -= cameraRoll*.1;
                }
                cameraComponent.camera.rotation[2] = cameraRoll;
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
      

      components: [
        new Paladin.component.Model( {
          mesh: new Paladin.graphics.Mesh( { 
            loadFrom: "ship-main.xml",
            finalize: true
          })
        }) // XXX mesh.clean()
      ],
      

     /*
      components: [
        new Paladin.component.Model( {
          mesh: new Paladin.graphics.Mesh( {
            primitives: [ {
              type: 'box',
              size: 0.5,
              material: {
                color: [1, 0, 1]
              }
            }],
            finalize: true
          })
        })
      ],
           */
          
      init: function ( entity ) {
        var accel = 0.01;
        var shipFlyingTask = Paladin.tasker.add( {
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
        var mesh = new Paladin.graphics.Mesh( {
            primitives: [ {
                type: 'box',
                size: 0.5 + Math.random(),
                material: {
                  color: [Math.random(), Math.random(), Math.random()]
                }
            } ],
            finalize: true
        } );

        var box = new Paladin.Entity();
        box.addComponent( new Paladin.component.Model( {
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

    var rotationTask = Paladin.tasker.add( {
        callback: function( task ) {
          for ( var i=0, l=boxes.length; i<l; ++i) {
            boxes[i].spatial.rotation[0] += .1;
            boxes[i].spatial.rotation[1] += .2;
            boxes[i].spatial.rotation[2] += .3;
          }
        }
    } );
    
    this.run = function () {
      Paladin.run();
    };

    window.foo = scene.graphics;

};

document.addEventListener('DOMContentLoaded', function (e) {
    var game = new Game();
    game.run();
}, false);

})(window, document, CubicVR, Paladin);
