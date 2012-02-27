document.addEventListener( "DOMContentLoaded", function( e ){

    var canvas = document.getElementById( "test-canvas" );    
    var resources = {};

    var game = function( engine ) {
        var math = engine.math;

        var CubicVR = engine.graphics.target.context;
       
        var run = function() {

            // Make a new space for our entities
            var space = new engine.core.Space();

            canvas = engine.graphics.target.element;

            space.add( new engine.core.Entity({
                name: 'cube0',
                components: [
                    new engine.core.component.Transform({
                        position: math.Vector3( 0, 0, 0 ),
                        rotation: math.Vector3( 0, 0, 0 )
                    }),
                    new engine.graphics.component.Model({
                        mesh: resources.mesh,
                        material: resources.material
                    })
                ]
            }) );
            space.add( new engine.core.Entity({
                name: 'cube1',
                parent: space.find( 'cube0' ),
                components: [
                    new engine.core.component.Transform({
                        position: math.Vector3( 2, 2, 2 ),
                        rotation: math.Vector3( 0, 0, 0 ),
                        scale: math.Vector3( 0.5, 0.5, 0.5 )
                    }),
                    new engine.graphics.component.Model({
                        mesh: resources.mesh,
                        material: resources.material
                    })
                ]
            }) );  
            
            space.add( new engine.core.Entity({
                name: 'camera',
                components: [
                    new engine.core.component.Transform({
                        position: math.Vector3( 0, 0, 10 )
                    }),
                    new engine.graphics.component.Camera({
                        active: true,
                        width: canvas.width,
                        height: canvas.height,
                        fov: 60
                    }),
                    new engine.graphics.component.Light({ intensity: 50 })
                ]
            }));

            // aim the camera at cube0 
            space.find( 'camera' ).find( 'Camera' ).target = 
              space.find( 'cube0' ).find( 'Transform' ).position;

            var cube0 = space.find( 'cube0' );
            var cube1 = space.find( 'cube1' );
            var task = new engine.scheduler.Task({
                schedule: {
                    phase: engine.scheduler.phases.UPDATE
                },
                callback: function() {
                    var delta = engine.scheduler.simulationTime.delta/1000;
                    cube0.find( 'Transform' ).rotation = math.matrix4.add([
                        cube0.find( 'Transform' ).rotation,
                        [ math.TAU * delta * 0.1, math.TAU * delta * 0.2, 0 ]
                    ]);
                    cube1.find( 'Transform' ).rotation = math.matrix4.add([
                        cube1.find( 'Transform' ).rotation,
                        [ math.TAU * delta * 0.1, math.TAU * delta * 0.2, 0 ]
                    ]);                   
                }
            });
            
            // Start the engine!
            engine.run();

        };
        
        // load a mesh and a material to cover that mesh, both of which
        // are generated procedurally by JavaScript files.
        engine.core.resource.get(
            [
                {
                    type: engine.graphics.resource.Mesh,
                    url: 'procedural-mesh.js',                          
                    load: engine.core.resource.proceduralLoad,
                    onsuccess: function( mesh ) {
                        resources.mesh = mesh;
                    },
                    onfailure: function( error ) {
                    }
                },
                {
                    type: engine.graphics.resource.Material,
                    url: 'procedural-material.js',
                    load: engine.core.resource.proceduralLoad,
                    onsuccess: function( material ) {
                        resources.material = material;
                    },
                    onfailure: function( error ) {
                    }
                }
            ],
            {
                oncomplete: run
            }
        );

    };


    gladius.create(
            {
                debug: true,
                services: {
                    graphics: {
                        src: 'graphics/service',
                        options: {
                            canvas: canvas
                        }
                    }
                }
            },
            game
    );

});
