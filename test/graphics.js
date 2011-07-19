(function ( window, document, undefined, Paladin ) {

  document.addEventListener('DOMContentLoaded', function (e) {

    Paladin.init({
      graphics: {
        canvas: document.getElementById('test-canvas')
      }
    });

    var scene = new Paladin.Scene( { fov: 60 } ),
        camera = new Paladin.component.Camera({ targeted: false }),
        entity = new Paladin.Entity()
        mesh = new Paladin.graphics.Mesh( {
          primitives: [ {
            type: 'box',
            size: 0.5,
            material: {
            color: [1, 0, 1]
            }
          }],
          finalize: true
        }),
        model = new Paladin.component.Model({
          mesh: mesh,
          position: [0, 0, 0],
          rotation: [0, 0, 0]
        });

    entity.addComponent( model );
    entity.addComponent( camera );
    entity.setParent( scene );

    model.object.rotation = [0, 45, 45];
    camera.camera.position = [0, 0, 1];

    Paladin.tasker.add({
      callback: function ( task ) {
        model.object.rotation[0] += 1;
      }
    });

    Paladin.run();

    module( "Scene setup" );

    test( "Scene rendering", function () {
      expect( 1 );
      stop();
      Paladin.graphics.pushScene( scene );
      ok( scene.graphics.frames > 0, "Scene has rendered several times" );
      setTimeout( start, 500 );
    });

    test( "Camera setup", function () {
      expect( 1 );
      scene.setActiveCamera( camera );
      ok( scene.graphics.camera === camera.camera, "Camera is correct" );
    });

    test( "Model setup", function () {
    });


  }, false);


})( window, document, undefined, Paladin );
