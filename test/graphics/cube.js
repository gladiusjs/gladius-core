document.addEventListener( "DOMContentLoaded", function( e ){

  var canvas = document.getElementById( "test-canvas" );

  gladius.create({
        debug: true,
        services: {
            graphics: {
                src: 'graphics/service',
                options: {
                    canvas: canvas
                }
            }
        }
    }, function( instance ) {       
        var engine = instance;

        var scene = new engine.core.Space(),
            cameraEntity = new scene.Entity(),
            modelEntity = new scene.Entity();

        canvas = engine.graphics.target.element;

        var cameraComponent = new engine.graphics.component.Camera({
          active: true,
          width: canvas.width,
          height: canvas.height,
          fov: 60 
        });
        cameraEntity.add( new engine.core.component.Transform({
            position: [1, 1, 1]
        }));
        cameraEntity.add( cameraComponent );
        cameraComponent.target = [.2, 0, 0];
        
        modelEntity.add( new engine.core.component.Transform({
            position: [0, 0, 0]
        }));

        var resources = {};
        function onResourceSuccess(){
            if( resources.mesh && resources.material ){
                var modelComponent = new engine.graphics.component.Model({
                    mesh: resources.mesh,
                    material: resources.material,
                    onready: function( instance ) {
                        modelEntity.add( instance );
                        // engine.graphics.render();
                        engine.run();
                        setTimeout( function() {
                            engine.run();
                            ok( engine.graphics.renderedFrames > 2, "Graphics task is rendering" );
                            start();
                        }, 500 );
                    }
                });
            } //if
        } //onResourceSuccess

        var meshResource = engine.graphics.resource.Mesh({
            script: engine.graphics.script.mesh.cube,
            onsuccess: function( mesh ) {
                resources[ "mesh" ] = mesh;
                onResourceSuccess();
            }
        });

        var materialResource = engine.graphics.resource.Material({
            script: engine.graphics.script.material.sample,
            onsuccess: function( material ) {
                resources[ "material" ] = material;
                onResourceSuccess();
            }
        });

    });

}, false );
