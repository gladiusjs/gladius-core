(function ( window, document, CubicVR, Paladin ) {

function Game() {

    Paladin.init( {debug: true} );

    var scene = new Paladin.Scene();

    var keysDown = {};

    function Ship() {
        var accel = 0.01;
        
        var entity = new Paladin.Entity();
        entity.setParent( scene );

        var camera = new Paladin.component.Camera();
        entity.addComponent( camera );

        var mesh = new Paladin.graphics.Mesh( {
            primitives: [ {
                type: 'box',
                size: 0.5,
                material: {
                    color: [1, 0, 1]
                }
            } ],
            finalize: true
        } );

        entity.addComponent( new Paladin.component.Model ( {
            mesh: mesh
        } ) );

        Paladin.tasker.add( {
          callback: function ( task ) {
            if ( keysDown['a'] ) {
              camera.spatial.rotation[1] += 1;
            }
            else if ( keysDown['d'] ) {
              camera.spatial.rotation[1] -= 1;
            }
          }
        } );

        entity.listen( {
            event: 'a-down',
            callback: function( parameters ) {
                keysDown['a'] = true;
            }
        } );
        entity.listen( {
            event: 'a-up',
            callback: function( parameters ) {
                keysDown['a'] = false;
            }
        } );
        entity.listen( {
            event: 'd-down',
            callback: function( parameters ) {
                keysDown['d'] = true;
            }
        } );
        entity.listen( {
            event: 'd-up',
            callback: function( parameters ) {
                keysDown['d'] = false;
            }
        } );


        camera.camera.targeted = false;
        camera.object.rotation = [0, 0, 0];
        camera.object.position = [0, 0, 0];

        var shipFlyingTask = Paladin.tasker.add( {
            callback: function ( task ) {
                var rotY = camera.object.rotation[1];
                
                var dirVec = [
                    Math.sin(rotY*Math.PI/180),
                    0,
                    Math.cos(rotY*Math.PI/180)
                ];

                dirVec = CubicVR.vec3.normalize(dirVec);

                camera.object.position[0] -= dirVec[0] * accel * task.dt;
                camera.object.position[2] -= dirVec[2] * accel * task.dt;

            }
        } );

    } //Ship

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
            mesh: mesh,
            position: [-50 + 100 * Math.random(), 
                       -5 + 10 * Math.random(),
                       -50 + 100 * Math.random()]
        } ) );        
        box.setParent( scene );
        
        boxes.push(box);
      
      })();
    } //for

    var rotationTask = Paladin.tasker.add( {
        callback: function( task ) {
          for ( var i=0, l=boxes.length; i<l; ++i) {
            boxes[i].spatial.rotation[0] += 0.1;
            boxes[i].spatial.rotation[1] += 0.2;
            boxes[i].spatial.rotation[2] += 0.3;
          }
        }
   
    } );

    var ship = new Ship();
    
    this.run = function () {
      Paladin.run();
    };

};

document.addEventListener('DOMContentLoaded', function (e) {
    var game = new Game();
    game.run();
}, false);

})(window, document, CubicVR, Paladin);
