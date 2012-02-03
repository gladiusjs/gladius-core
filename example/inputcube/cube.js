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
            type: 'Player',
            depends: 'Transform'    // We're going to do some rotation, so we should have a transform
        },
        function( options ) {

            options = options || {};
            var that = this;
            var service = engine.logic; // This is a hack so that this component will have its message queue processed

            this.onStartPlayerRotate = function( event ) {
                console.log( "onStartPlayerRotate" );
                console.log( event.type, event.data );
                
                // Do some fun stuff here, like rotate.
                // We depend on transform, so it's OK to poke at this.owner.find( 'Transform' )
            };
            
            this.onStopPlayerRotate = function( event ) {
                console.log( "onStopPlayerRotate" );
                console.log( event.type, event.data );
            };

            // Boilerplate component registration; Lets our service know that we exist and want to do things
            this.onComponentOwnerChanged = function( e ){
                if( e.data.previous === null && this.owner !== null ) {
                    service.registerComponent( this.owner.id, this );
                }

                if( this.owner === null && e.data.previous !== null ) {
                    service.unregisterComponent( e.data.previous.id, this );
                }
            };

            this.onEntityManagerChanged = function( e ) {
                if( e.data.previous === null && e.data.current !== null && this.owner !== null ) {
                    service.registerComponent( this.owner.id, this );
                }

                if( e.data.previous !== null && e.data.current === null && this.owner !== null ) {
                    service.unregisterComponent( this.owner.id, this );
                }
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
                                     console.log( e.type, e.data );
                                     if( this.owner ) {
                                         // If we have an owner, dispatch a game event for it to enjoy
                                         new engine.core.Event({
                                             type: e.data.state === 'down' ? 'StartPlayerRotate' : 'StopPlayerRotate',
                                             data: {
                                                 direction: e.data.code === 'A' ? 'left' : 'right'
                                             }
                                         }).dispatch( [this.owner] );
                                     }
                                 }
                             }),
                             new PlayerComponent()
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

                        }
                    },
                    logic: 'logic/game/service'
                }
            },
            game
    );

});
