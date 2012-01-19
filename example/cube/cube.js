document.addEventListener( "DOMContentLoaded", function( e ){

    var printd = function( div, str ) {
        document.getElementById( div ).innerHTML = str + '<p>';
    };
    var cleard = function( div ) {
        document.getElementById( div ).innerHTML = '';
    };

    var canvas = document.getElementById( "test-canvas" );    
    var resources = {};

    var game = function( engine ) {
        var math = engine.math;

        var CubicVR = engine.graphics.target.context;
       
        var run = function() {

            // Make a new space for our entities
            var space = new engine.core.Space();

            // Make some entities and arrange them
            var cubes = [];

            canvas = engine.graphics.target.element;

            cubes.push( new space.Entity({
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

            cubes.push( new space.Entity({
                name: 'cube1',
                parent: cubes[0],
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
            
            cubes.push( new space.Entity({
                name: 'cube2',
                parent: cubes[0],
                components: [
                    new engine.core.component.Transform({
                        position: math.Vector3( -2, 2, 2 ),
                        rotation: math.Vector3( 0, 0, 0 ),
                        scale: math.Vector3( 0.5, 0.5, 0.5 )
                    }),
                    new engine.graphics.component.Model({
                        mesh: resources.mesh,
                        material: resources.material
                    })
                ]
            }) ); 
            
            cubes.push( new space.Entity({
                name: 'cube2',
                parent: cubes[0],
                components: [
                    new engine.core.component.Transform({
                        position: math.Vector3( 2, -2, 2 ),
                        rotation: math.Vector3( 0, 0, 0 ),
                        scale: math.Vector3( 0.5, 0.5, 0.5 )
                    }),
                    new engine.graphics.component.Model({
                        mesh: resources.mesh,
                        material: resources.material
                    })
                ]
            }) );
            
            cubes.push( new space.Entity({
                name: 'cube2',
                parent: cubes[0],
                components: [
                    new engine.core.component.Transform({
                        position: math.Vector3( 2, 2, -2 ),
                        rotation: math.Vector3( 0, 0, 0 ),
                        scale: math.Vector3( 0.5, 0.5, 0.5 )
                    }),
                    new engine.graphics.component.Model({
                        mesh: resources.mesh,
                        material: resources.material
                    })
                ]
            }) );
            
            var light = new space.Entity({
                name: 'light',
                components: [
                    new engine.core.component.Transform({
                        position: math.Vector3( 0, 0, 0 )
                    }),
                    new engine.graphics.component.Light( resources.light )
                ]
            });
            
            var camera = new space.Entity({
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
                    new engine.graphics.component.Light( resources.light )
                ]
            });
            camera.find( 'Camera' ).target = math.Vector3( 0, 0, 0 );

            var task = new engine.scheduler.Task({
                schedule: {
                    phase: engine.scheduler.phases.UPDATE,
                },
                callback: function() {
                    var delta = engine.scheduler.simulationTime.delta/1000;
                    cubes[0].find( 'Transform' ).rotation = math.matrix4.add([
                        cubes[0].find( 'Transform' ).rotation,
                        [ math.TAU * delta * 0.1, math.TAU * delta * 0.2, 0 ]
                    ]);
                    cubes[1].find( 'Transform' ).rotation = math.matrix4.add([
                        cubes[1].find( 'Transform' ).rotation,
                        [ math.TAU * delta * 0.1, math.TAU * delta * 0.2, 0 ]
                    ]);
                }
            });
            
            // Start the engine!
            engine.run();

        };

        var expectedResources = 3;
        var registerResource = function( name, instance ) {
            resources[name] = instance;
            if( Object.keys( resources ).length === expectedResources ) {
                run();
            }
        };

        engine.graphics.resource.Mesh({
            script: engine.graphics.script.mesh.cube,
            onsuccess: function( instance ) {
                registerResource( 'mesh', instance );
            }
        });
        engine.graphics.resource.Material({
            script: engine.graphics.script.material.sample,
            onsuccess: function( instance ) {
                registerResource( 'material', instance );
            }
        });
        engine.graphics.resource.Light({
            script: engine.graphics.script.light.sample,
            onsuccess: function( instance ) {
                registerResource( 'light', instance );
            }
        });

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
