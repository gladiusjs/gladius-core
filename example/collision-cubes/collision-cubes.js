/*global gladius, console */

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
        
        var MotionService = engine.base.Service({
            type: 'Motion',
            schedule: {
                update: {
                    phase: engine.scheduler.phases.UPDATE
                }
            },
            time: engine.scheduler.simulationTime
        },
        function( options ) {
            var that = this;
            var service = this;
            options = options || {};
            
            this.update = function() {
                var updateEvent = new engine.core.Event({
                    type: 'Update',
                    queue: false,
                    data: {
                        delta: that.time.delta
                    }
                });
                for( var componentType in that.components ) {
                    for( var entityId in that.components[componentType] ) {
                        var component = that.components[componentType][entityId];
                        while( component.handleQueuedEvent() ) {}
                        updateEvent.dispatch( component );
                    }
                }
            };
            
            var Planar = engine.base.Component({
                type: 'Motion',
                depends: ['Transform']
            },
            function( options ) {
                var that = this;
                var _directions = {
                    UP: options.forward || math.Vector3( 0, 1, 0 ),
                    LEFT: options.right || math.Vector3( -1, 0, 0 ),
                    RIGHT: options.reverse || math.Vector3( 1, 0, 0 ),
                    DOWN: options.left || math.Vector3( 0, -1, 0 )
                };
                var _move = null;
                var _lastPosition = null;
                this.velocity = null;
                
                this.onMoveStart = function( event ) {
                    _move = event.data.direction;
                };
                
                this.onMoveStop = function( event ) {
                    _move = null;
                };
                               
                this.onUpdate = function( event ) {
                    var transform = this.owner.find( 'Transform' );

                    if( _move ) {
                        var direction = math.vector3.multiply( _directions[_move], event.data.delta / 1000 );
                        transform.position = math.vector3.add( transform.position, direction );
                    }
                    
                    that.velocity = math.vector2.subtract( transform.position, _lastPosition );
                    _lastPosition = transform.position;
                };
                
                // Boilerplate component registration; Lets our service know that we exist and want to do things
                this.onComponentOwnerChanged = function( e ){
                    if( e.data.previous === null && this.owner !== null ) {
                        service.registerComponent( this.owner.id, this );
                    }

                    if( this.owner === null && e.data.previous !== null ) {
                        service.unregisterComponent( e.data.previous.id, this );
                    }
                    _lastPosition = this.owner.find( 'Transform' ).position;
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
            
            var _components = {
                Planar: Planar
            };
            Object.defineProperty( this, 'component', {
                get: function() {
                    return _components;
                }
            });
        });
        engine.motion = new MotionService();

        var CollisionService = engine.base.Service({
            type: 'Physics',
            schedule: {
                update: {
                    phase: engine.scheduler.phases.UPDATE
                }
            },
            depends: [ 'Motion' ],
            time: engine.scheduler.simulationTime
        },
        function( options ) {

            var that = this;
            var service = this;

            var AABB = engine.base.Component({
                type: 'Collision',
                depends: ['Transform']
            },
            function( options ) {
                this.halfWidth = options.halfWidth;
                this.halfHeight = options.halfHeight;

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

            this.update = function() {

                for( var componentType in that.components ) {
                    for( var entityId in that.components[componentType] ) {
                        while( that.components[componentType][entityId].handleQueuedEvent() ) {}
                    }
                }
                
                var doCollision = function( component1, component2 ) {
                    var halfWidth1 = component1.halfWidth,
                        halfHeight1 = component1.halfHeight,
                        center1 = component1.owner.find( 'Transform' ).position;
                    var halfWidth2 = component2.halfWidth,
                        halfHeight2 = component2.halfHeight,
                        center2 = component2.owner.find( 'Transform' ).position;
                    
                    var T = math.vector2.subtract( center2, center1 );  // vector from center of box1 to center of box2
                    
                    // test x-axis
                    var proj_T_x = math.vector2.length( math.vector2.project( T, math.vector2.x ) );                    
                    var proj_AABB_x = halfWidth1 + 
                                      math.vector2.length( math.vector2.project( math.vector2.multiply( math.vector2.x, halfWidth2 ), math.vector2.x ) ) + 
                                      math.vector2.length( math.vector2.project( math.vector2.multiply( math.vector2.y, halfHeight2 ), math.vector2.x ) );
                    if( proj_T_x > proj_AABB_x ) return false;
                    
                    // test y-axis
                    var proj_T_y = math.vector2.length( math.vector2.project( T, math.vector2.y ) );
                    var proj_AABB_y = halfHeight1 + 
                                      math.vector2.length( math.vector2.project( math.vector2.multiply( math.vector2.x, halfWidth2 ), math.vector2.y ) ) + 
                                      math.vector2.length( math.vector2.project( math.vector2.multiply( math.vector2.y, halfHeight2 ), math.vector2.y ) );
                    if( proj_T_y > proj_AABB_y ) return false;
                    
                    console.log( proj_AABB_x - proj_T_x, proj_AABB_y - proj_T_y );
                    
                    return true;
                };
                
                // Build a list of components to check
                var collisionComponents = [];
                for( var collisionEntity in that.components.Collision ) {
                    collisionComponents.push( that.components.Collision[collisionEntity] );
                }
                
                // Test each component against each other component
                while( collisionComponents.length > 0 ) {
                    var component1 = collisionComponents.shift();                    
                    collisionComponents.forEach( function( component2 ) {
                        var collisionData = doCollision( component1, component2 );                        
                        if ( collisionData ) {
                            // Dispatch events to each entity naming the other entity as the target
                            new engine.core.Event({
                                type: 'Collision',
                                data: engine.lang.extend( { entity: component2.owner }, collisionData )
                            }).dispatch( component1.owner );
                            new engine.core.Event({
                                type: 'Collision',
                                data: engine.lang.extend( { entity: component1.owner }, collisionData )
                            }).dispatch( component2.owner );
                        }                        
                    });
                }

            };

            var _components = {
                    AABB: AABB
            };

            Object.defineProperty( this, 'component', {
                get: function() {
                    return _components;
                }
            });
        });
        engine.collision = new CollisionService();

        var PlayerComponent = engine.base.Component({
            type: 'Player',
            depends: ['Transform']    // We're going to be moving stuff
        },
        function( options ) {

            options = options || {};
            var that = this;

            // This is a hack so that this component will have its message
            // queue processed
            var service = engine.logic; 
           
            this.onCollision = function( event ) {
                console.log( that.owner.id, '->', event.data.entity.id );
            };

            this.onUpdate = function( event ) {
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

            // Make an obstacle that will collide with the player
            var obstacle = new space.Entity({
                name: 'obstacle',
                components: [
                             new engine.core.component.Transform(),
                             new engine.graphics.component.Model({
                                 mesh: resources.mesh,
                                 material: resources.material
                             }),
                             new engine.collision.component.AABB({
                                 halfWidth: 1,
                                 halfHeight: 1
                             })
                             ]
            });

            // Make a user-controllable object that can collide with the obstacle
            var player = new space.Entity({
                name: 'player',
                components: [
                             new engine.core.component.Transform({
                                 position: math.Vector3( 3, 3, 0 ),
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
                                         case 'W':
                                             new engine.core.Event({
                                                 type: e.data.state === 'down' ? 'MoveStart' : 'MoveStop',
                                                         data: {
                                                             direction: 'UP'
                                                         }
                                             }).dispatch( this.owner );
                                             break;
                                         case 'A': 
                                             new engine.core.Event({
                                                 type: e.data.state === 'down' ? 'MoveStart' : 'MoveStop',
                                                         data: {
                                                             direction: 'LEFT'                                                             
                                                         }
                                             }).dispatch( this.owner );
                                             break;
                                         case 'S': 
                                             new engine.core.Event({
                                                 type: e.data.state === 'down' ? 'MoveStart' : 'MoveStop',
                                                         data: {
                                                             direction: 'DOWN'                                                             
                                                         }
                                             }).dispatch( this.owner );
                                             break;
                                         case 'D': 
                                             new engine.core.Event({
                                                 type: e.data.state === 'down' ? 'MoveStart' : 'MoveStop',
                                                         data: {
                                                             direction: 'RIGHT'                                                             
                                                         }
                                             }).dispatch( this.owner );
                                             break;

                                         }
                                     }
                                 }
                             }),
                             new engine.motion.component.Planar(),
                             new engine.collision.component.AABB({
                                 halfWidth: 1,
                                 halfHeight: 1
                             }),
                             new PlayerComponent()
                             ]
            });

            var camera = new space.Entity({
                name: 'camera',
                components: [
                             new engine.core.component.Transform({
                                 position: math.Vector3( 0, 1, 10 )
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
            camera.find( 'Camera' ).target = obstacle.find( 'Transform' ).position;

            // Start the engine!
            engine.run();

        };

        engine.core.resource.get(
                [
                 {
                     type: engine.graphics.resource.Mesh,
                     url: 'procedural-mesh.js?size=2',                          
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
                 }],
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
