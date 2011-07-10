(function ( window, document, CubicVR, Paladin ) {

function Game() {

    Paladin.init( {debug: true} );

    var scene = new Paladin.component.Scene();

    var keysDown = {};

    function Ship() {
        var entity = new Paladin.Entity();
        var accel = 0.01;

        var camera = new Paladin.component.Camera();
        camera.setSpatial( new Paladin.component.Spatial( [0, 0, 0] ) );

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

        var model = new Paladin.component.Model( {
            mesh: mesh 
        } );

        var spatial = this.spatial = new Paladin.component.Spatial([0, 0, 0]);

        model.setParent(spatial);

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


        //camera.setTarget( spatial.position );
        camera.camera.targeted = false;
        camera.spatial.rotation = [0, 0, 0];
        camera.spatial.position = [0, 0, 0];
        camera.setParent( scene );

        var shipFlyingTask = Paladin.tasker.add( {
            callback: function ( task ) {
                var rotY = camera.spatial.rotation[1];
                
                var dirVec = [
                    Math.sin(rotY*Math.PI/180),
                    0,
                    Math.cos(rotY*Math.PI/180)
                ];

                dirVec = CubicVR.vec3.normalize(dirVec);

                camera.spatial.position[0] -= dirVec[0] * accel * task.dt;
                camera.spatial.position[2] -= dirVec[2] * accel * task.dt;

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
        box.spatial = new Paladin.component.Spatial( [-50 + 100 * Math.random(), 
                                                      -5 + 10 * Math.random(),
                                                      -50 + 100 * Math.random()] );
        box.model = new Paladin.component.Model( {
            mesh: mesh 
        } );
        box.model.setSpatial( box.spatial );
        box.model.setParent( scene );
        
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

    Paladin.graphics.pushScene(scene);

};

document.addEventListener('DOMContentLoaded', function (e) {
    var game = new Game();
    game.run();
}, false);

})(window, document, CubicVR, Paladin);
