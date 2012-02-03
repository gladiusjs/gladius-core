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
        

        var PlayerComponent = engine.base.Component({
            type: 'Player'
        },
        function( options ) {

            options = options || {};
            var that = this;

            var onPlayerRotate = function( event ) {

            };

        });

        var run = function() {

            // Make a new space for our entities
            var space = new engine.core.Space();

            canvas = engine.graphics.target.element;

            var cube = new space.Entity({
                name: 'cube0',
                components: [
                    new engine.core.component.Transform({
                        position: math.Vector3( 0, 0, 0 ),
                        rotation: math.Vector3( 0, 0, 0 )
                    }),
                    new engine.graphics.component.Model({
                        mesh: resources.mesh,
                        material: resources.material
                    }),
                    new engine.input.component.Controller({
                        onKey: function(e) {
                            console.log(e);
                        }
                    })
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
                    new engine.graphics.component.Light({ intensity: 50 })
                ]
            });
            camera.find( 'Camera' ).target = math.Vector3( 0, 0, 0 );

            var task = new engine.scheduler.Task({
                schedule: {
                    phase: engine.scheduler.phases.UPDATE,
                },
                callback: function() {
                    var delta = engine.scheduler.simulationTime.delta/1000;
                       
                }
            });
            
            // Start the engine!
            engine.run();

        };
        
        engine.core.resource.get(
            [
                {
                    type: engine.graphics.resource.Mesh,
                    url: 'procedural-mesh.js',                          
                    load: engine.core.resource.proceduralLoad,
                    onsuccess: function( mesh ) {
                        resources['mesh'] = mesh;
                    },
                    onfailure: function( error ) {
                    }
                },
                {
                    type: engine.graphics.resource.Material,
                    url: 'procedural-material.js',
                    load: engine.core.resource.proceduralLoad,
                    onsuccess: function( material ) {
                        resources['material'] = material;
                    },
                    onfailure: function( error ) {
                    }
                },
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
                    },
                    input: {
                        src: 'input/service',
                        options: {
                            element: canvas
                        }
                    }
                }
            },
            game
    );

});
