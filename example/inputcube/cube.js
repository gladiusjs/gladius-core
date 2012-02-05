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
            var _Xrotate = 0;
            var _Yrotate = 0;
            var _speed = 1;

            this.onStartPlayerYRotate = function( event ) {
                _Yrotate = event.data.direction;
            };

            this.onStopPlayerYRotate = function( event ) {
                _Yrotate = 0;
            };

            this.onStartPlayerXRotate = function( event ) {
                _Xrotate = event.data.direction;
            };

            this.onStopPlayerXRotate = function( event ) {
                _Xrotate = 0;
            };
            
            this.onStartFastRotate = function( event ) {
                _speed = 10;
            };
            
            this.onStopFastRotate = function( event ) {
                _speed = 1;
            }
            
            this.onUpdate = function( event ) {
                var transform = this.owner.find( 'Transform' );
                var delta = service.time.delta;
                if( _Yrotate !== 0 ) {
                    transform.rotation = math.matrix4.add([
                                                           transform.rotation,
                                                           [ 0, _Yrotate * math.TAU * delta/10000 * _speed, 0 ]
                                                           ]);
                }
                if( _Xrotate !== 0 ) {
                    transform.rotation = math.matrix4.add([
                                                           transform.rotation,
                                                           [ _Xrotate * math.TAU * delta/10000 * _speed, 0, 0 ]
                                                           ]);
                }
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
                                     if( this.owner ) {
                                         // If we have an owner, dispatch a game event for it to enjoy
                                         var rotate;
                                         switch( e.data.code ) {
                                         case 'A':
                                             new engine.core.Event({
                                                 type: e.data.state === 'down' ? 'StartPlayerYRotate' : 'StopPlayerYRotate',
                                                         data: {
                                                             direction: -1
                                                         }
                                             }).dispatch( [this.owner] );
                                             break;
                                         case 'D': 
                                             new engine.core.Event({
                                                 type: e.data.state === 'down' ? 'StartPlayerYRotate' : 'StopPlayerYRotate',
                                                         data: {
                                                             direction: 1
                                                         }
                                             }).dispatch( [this.owner] );
                                             break;
                                         case 'S':
                                             new engine.core.Event({
                                                 type: e.data.state === 'down' ? 'StartPlayerXRotate' : 'StopPlayerXRotate',
                                                         data: {
                                                             direction: -1
                                                         }
                                             }).dispatch( [this.owner] );
                                             break;
                                         case 'W': 
                                             new engine.core.Event({
                                                 type: e.data.state === 'down' ? 'StartPlayerXRotate' : 'StopPlayerXRotate',
                                                         data: {
                                                             direction: 1
                                                         }
                                             }).dispatch( [this.owner] );
                                             break;
                                         case 'SHIFT':
                                             new engine.core.Event({
                                                 type: e.data.state === 'down' ? 'StartFastRotate' : 'StopFastRotate'
                                             }).dispatch( [this.owner] );
                                             break;
                                         }
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
