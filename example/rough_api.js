function Game() {

    Paladin.init( {debug: true} );

    var scene = new Paladin.component.Scene();
    
    var camera = new Paladin.component.Camera();
    camera.setSpatial( new Paladin.component.Spatial( [0, 0, 0] ) );
    camera.setParent( scene );
    
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
    var box = new Paladin.Entity();
    box.spatial = new Paladin.component.Spatial( [-1, 0, -1] );
    box.model = new Paladin.component.Model( {
        mesh: mesh 
    } );
    box.model.setSpatial( box.spatial );
    box.model.setParent( scene );
    
    camera.setTarget( box.spatial.position );
    
    var rotationTask = Paladin.tasker.add( {
        callback: function( task ) {
            box.spatial.rotation[0] += 0.1;
            box.spatial.rotation[1] += 0.2;
            box.spatial.rotation[2] += 0.3;
        }
    } );
    
    box.listen( {
        event: 'wheel-up',
        callback: function( parameters ) {
            camera.spatial.position = [ camera.spatial.position[0], camera.spatial.position[1], camera.spatial.position[2] + 1 ];
        }
    } );
    box.listen( {
        event: 'wheel-down',
        callback: function( parameters ) {
            camera.spatial.position = [ camera.spatial.position[0], camera.spatial.position[1], camera.spatial.position[2] - 1 ];
        }
    } );
    box.listen( {
        event: 'escape-up',
        callback: function( parameters ) {
            if( rotationTask.run )
                rotationTask.suspend();
            else
                rotationTask.resume();
        }
    } );

    this.run = function () {
      Paladin.run();
    };

    Paladin.graphics.pushScene(scene);

    window.foo = scene.render;

};
