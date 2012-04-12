/*global CubicVR:false, window:false, viking: false, gladius: false,
  console: false
 */

/*jshint expr:true */
/* 
 * Right now there are a lot things of the form
 * 
 * object.functionName && object.functionName();
 * 
 * This is hard to read, and it may be the symptom of something in need
 * of a different code idiom.  For now we'll silence these warnings to keep
 * jshint quiet, but this should really be analyzed and dealt with.
 */

// for use by bitwallModel; we need to do some surgery before this becomes
// avoidable
var engine;

/*
 * Simple game based on the "No Comply" WebGL music video. TODOs:
 * https://gladius.etherpad.mozilla.org/8
 */
document
    .addEventListener(
        "DOMContentLoaded",
        function(e) {

          var getById = function(id) {
            return document.getElementById( id );
          };

          var canvas = getById( "test-canvas" );

          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;

          var resources = {};

          //
          var game = function(engineInstance) {
            var playerBitwall, bossBitwall;

            engine = engineInstance;

            var FACING_RIGHT = 1;
            var FACING_LEFT = -1;

            var MOVE_SPEED = 100;
            var JUMP_IMPULSE = 5000;

            var BOSS_JUMP_IMPULSE = 30000;
            // var BOSS_WALK_IMPULSE = 350;
            var BOSS_WALK_IMPULSE = 500;

            // Number of seconds between the boss jumping which makes crates
            // fall from the sky
            var BOSS_JUMP_INTERVAL = 10;

            var FLOOR_POS = 0;

            // Gameplay is 2D, so most objects in the scene have the same z
            // coordinate.
            var GAME_DEPTH = -25;

            var PLAYER_BB_HEIGHT = 3.5;

            //
            var WALK_ANI_SPEED = 0.085;
            var PUNCH_DURATION = 0.12;

            var BOSS_WALK_ANI_SPEED = 0.25;

            var MAX_HEALTH = 100;

            // TODO: move this to the camera entity
            var cameraShake = 0;

            // ////////////////
            // Player config
            // ///////////////

            // Player 1 starts on the left side of the screen facing right
            var keyConfig = {
              RIGHT_KEY : 'RIGHT',
              LEFT_KEY : 'LEFT',
              JUMP_KEY : 'UP',
              DOWN_KEY : 'DOWN',
              PUNCH_KEY : 'A',
              name : 'player',
              dir : FACING_RIGHT,
              initialPos : [ -20, FLOOR_POS, 0 ]
            };

            // ////////////////////
            // Debugging
            // ////////////////////
            var printd = function(div, str) {
              var el = document.getElementById( div );
              if (el) {
                el.innerHTML = str + '<p>';
              }
            };
            var cleard = function(div) {
              document.getElementById( div ).innerHTML = '';
            };

            var space = new engine.core.Space();
            var math = engine.math;

            // Global state of the keyboard.
            var keyStates = [];

            // /////////////
            //
            // /////////////
            function colladaLoader(url, onsuccess, onfailure) {
              // XXX figure out why this is necessary
              window.CubicVR = engine.graphics.target.context;

              // XXX move this out
              CubicVR.setGlobalAmbient( [ 1, 1, 1 ] );

              // CubicVR wants the directory where the dae file resides.
              var dir = url.match( /.*\//i );/**/

              try {
                var context = engine.graphics.target.context;
                var scene = context.loadCollada( url, dir );
                onsuccess( scene );
              } catch (e) {
                onfailure( e );
              }
            }

            /*
             * 
             * Health Component is visualized as bars at the top of the screen.
             * 
             */
            var HealthComponent = engine.base
                .Component(
                    {
                      type : 'Health'
                    },
                    function(options) {

                      options = options || {};

                      var service = engine.logic, health = MAX_HEALTH, domId = options.domId, color = options.color, healthToRemove = 0;

                      // Only need to do this once on init.
                      getById( domId ).style.backgroundColor = color;

                      this.onHurt = function(amtToReduce) {
                        healthToRemove += amtToReduce;
                      };

                      this.onHeal = function(amtToAdd) {
                        health += amtToAdd;
                        // clamp the health to the maximum possible.
                        health = health > MAX_HEALTH ? MAX_HEALTH : health;
                      };

                      this.onUpdate = function() {
                        var delta = service.time.delta / 1000;

                        if (healthToRemove <= 0) {
                          healthToRemove = 0;
                          getById( domId ).style.backgroundColor = color;
                        } else {
                          var bitToRemove = delta * 20;

                          health -= bitToRemove;
                          // clamp the health to the minimum possible.
                          health = health < 0 ? 0 : health;

                          healthToRemove -= bitToRemove;
                          getById( domId ).style.backgroundColor = 'red';
                        }

                        // Refresh the page if the user dies.
                        // TODO: make this cooler
                        if (health <= 0 && domId === 'player') {
                          location.reload();
                        }

                        // Refresh the page if the user dies.
                        // TODO: make this cooler
                        if (health <= 0 && domId === 'player') {
                          location.reload();
                        }

                        // If health is zero, we only see the ugly border around
                        // the
                        // health bar, so just hide it in that case.
                        var show = health > 0 ? "visible" : "hidden";
                        getById( domId ).style.visibility = show;

                        // Allow some buffer between health bars
                        var halfClientAreaWidth = (window.innerWidth - 150) / 2;
                        var normalizedHealth = health / MAX_HEALTH;

                        var finalHealth = normalizedHealth *
                          halfClientAreaWidth;

                        getById( domId ).style.width = finalHealth + "px";
                      };

                      // Boilerplate component registration; Lets our service
                      // know that we exist and want to do things
                      this.onComponentOwnerChanged = function(e) {
                        if (e.data.previous === null && this.owner !== null) {
                          service.registerComponent( this.owner.id, this );
                        }

                        if (this.owner === null && e.data.previous !== null) {
                          service
                              .unregisterComponent( e.data.previous.id, this );
                        }
                      };

                      this.onEntityManagerChanged = function(e) {
                        if (e.data.previous === null && 
                            e.data.current !== null &&
                            this.owner !== null) {
                          service.registerComponent( this.owner.id, this );
                        }

                        if (e.data.previous !== null &&
                            e.data.current === null &&
                            this.owner !== null) {
                          service.unregisterComponent( this.owner.id, this );
                        }
                      };
                    } );

            // Boss with launch a bunch of objects user needs to avoid.
            var dropStoneCrate = function(options) {

              var size = 3;
              cameraShake = 500;

              // buffer
              var b = 0;

              var pos = options.position;
              var time = options.time;

              var bodyDef = engine.physics.resource.BodyDefinition( {
                type : engine.physics.resource.BodyDefinition.bodyType.DYNAMIC,
                linearDamping : 1,
                angularDamping : 1,
                fixedRotation : false
              } );

              var collisionShape = engine.physics.resource.Box( size / 2,
                  size / 2 );
              var fixtureDef = engine.physics.resource.FixtureDefinition( {
                shape : collisionShape,
                density : 1
              } );

              var stoneCrate = new space.Entity(
                  {
                    name : 'stoneCrate',
                    components : [
                        new engine.core.component.Transform( {
                          position : math.Vector3( pos[0], pos[1], pos[2] ),
                          scale : math.Vector3( size, size, size )
                        } ),
                        new engine.graphics.component.Model(
                            resources.stone.mesh ),

                        new StoneCrateComponent( {
                          time : time
                        } ),

                        new engine.physics.component.Body( {
                          bodyDefinition : bodyDef,
                          fixtureDefinition : fixtureDef
                        } ) ]
                  } );
            };

            //
            var makeCrate = function(options) {

              var boxH = 3;
              var boxW = 3;

              var pos = options.position;

              var bodyDef = engine.physics.resource.BodyDefinition( {
                type : engine.physics.resource.BodyDefinition.bodyType.DYNAMIC,
                linearDamping : 1,
                angularDamping : 1,
                fixedRotation : false
              } );

              var collisionShape = engine.physics.resource.Box( boxW / 2,
                  boxH / 2 );
              var fixtureDef = engine.physics.resource.FixtureDefinition( {
                shape : collisionShape,
                density : 0.5
              } );

              new space.Entity(
                  {
                    name : 'crate',
                    components : [
                        new engine.core.component.Transform( {
                          position : math.Vector3( pos[0], pos[1], pos[2] ),
                          scale : math.Vector3( boxW, boxH, boxW )
                        } ),
                        new engine.graphics.component.Model(
                            resources.crate.mesh ),
                        new engine.physics.component.Body( {
                          bodyDefinition : bodyDef,
                          fixtureDefinition : fixtureDef
                        } ) ]
                  } );
            };

            /*
             * 
             * State Component for Boss
             * 
             */
            var StateComponentBoss = engine.base.Component( {
              type : 'BossState'
            },

            function(options) {
              options = options || {};
              var that = this;

              var service = engine.logic;

              // walk state
              var WalkState = (function() {
                function WalkState(player) {
                  var pl = player;

                  var aniTimer = 0;
                  var totalTimer = 0;
                  var direction = 1;

                  this.jump = function() {
                    pl.setState( pl.getJumpState() );
                  };

                  this.activate = function() {
                    totalTimer = 0;
                    direction = 1;
                  };

                  this.update = function(event) {
                    var delta = service.time.delta / 1000;

                    aniTimer += delta;
                    totalTimer += delta;

                    var xPos = pl.owner.find( 'Transform' ).position[0];

                    if (aniTimer >= BOSS_WALK_ANI_SPEED) {
                      aniTimer = 0;
                      pl.owner.find( 'Model' ).updateAction( 'walk' );
                    }

                    if (totalTimer >= BOSS_JUMP_INTERVAL) {
                      this.jump();
                    }

                    // if going right and we reached border, walk forwards.
                    if ((direction === 1 && xPos > 50) ||
                        (direction === -1 && xPos < 37)) {
                      direction *= -1;
                    }

                    new engine.core.Event( {
                      type : 'LinearImpulse',
                      data : {
                        impulse : [ direction * BOSS_WALK_IMPULSE, 0 ]
                      }
                    } ).dispatch( pl.owner );
                  };

                  this.toString = function() {
                    return "walk";
                  };
                }

                return WalkState;
              }());

              // JumpState - Jump Straight up
              var JumpState = (function() {
                function JumpState(player) {
                  var pl = player;
                  var timeElapsed = 0;

                  this.update = function(event) {
                    var delta = service.time.delta / 1000;

                    timeElapsed += delta;

                    // TODO: FIX ME
                    if (timeElapsed > 0.25 &&
                        pl.owner.find( 'Transform' ).position[1] <= 15) {

                      // make crates when boss lands
                      var time = 10;
                      for ( var x = -38, y = 0; x < 30; x += 10, y += 15) {
                        time += 0.5;
                        dropStoneCrate( {
                          position : [ x, y + 100, GAME_DEPTH ],
                          time : time
                        } );
                      }

                      // makeCrate({position:[-40, 20, GAME_DEPTH]});

                      pl.setState( pl.getWalkState() );
                    }
                  };

                  // TODO: FIX ME
                  this.land = function() {
                    pl.setState( pl.getIdleState() );
                  };

                  this.activate = function() {
                    timeElapsed = 0;
                    pl.owner.find( 'Model' ).updateAction( 'jump' );
                    new engine.core.Event( {
                      type : 'LinearImpulse',
                      data : {
                        impulse : [ 0, BOSS_JUMP_IMPULSE ]
                      }
                    } ).dispatch( pl.owner );
                  };
                  this.toString = function() {
                    return 'jump';
                  };
                }
                return JumpState;
              }());

              // instances of all the states
              var walkState = new WalkState( this );
              var jumpState = new JumpState( this );
              var state = walkState;

              this.getJumpState = function() {
                return jumpState;
              };
              this.getWalkState = function() {
                return walkState;
              };

              this.setState = function(s) {
                if (state !== s) {
                  state = s;
                  state.activate && state.activate();
                }
              };

              this.onUpdate = function(t) {
                state && state.update( t );
              };

              // fix this
              this.getCurrState = function() {
                return state.toString();
              };

              // Boilerplate component registration; Lets our service know that
              // we exist and want to do things
              this.onComponentOwnerChanged = function(e) {
                if (e.data.previous === null && this.owner !== null) {
                  service.registerComponent( this.owner.id, this );
                }

                if (this.owner === null && e.data.previous !== null) {
                  service.unregisterComponent( e.data.previous.id, this );
                }
              };

              this.onEntityManagerChanged = function(e) {
                if (e.data.previous === null && e.data.current !== null &&
                    this.owner !== null) {
                  service.registerComponent( this.owner.id, this );
                }

                if (e.data.previous !== null && e.data.current === null &&
                    this.owner !== null) {
                  service.unregisterComponent( this.owner.id, this );
                }
              };
            } );

            /*
             * 
             * Player State Component
             * 
             */
            var StateComponent = engine.base
                .Component(
                    {
                      type : 'State'
                    },

                    function(options) {
                      options = options || {};
                      var that = this;

                      var service = engine.logic;

                      // Idle State - Player is just standing there.
                      var IdleState = (function() {
                        function IdleState(player) {
                          var pl = player;

                          this.activate = function() {
                          };
                          this.walk = function() {
                            pl.setState( pl.getWalkState() );
                          };
                          this.jump = function() {
                            pl.setState( pl.getJumpState() );
                          };
                          this.knockOut = function() {
                            pl.setState( pl.getKnockedOutState() );
                          };
                          this.fall = function() {
                            pl.setState( pl.getFallState() );
                          };

                          // !!! remove TODO
                          this.hit = function(d) {
                          };

                          this.update = function(event) {
                            pl.owner.find( 'Model' ).updateAction( 'idle' );
                          };
                          this.toString = function() {
                            return "idle";
                          };
                        }
                        return IdleState;
                      }());

                      var WalkState = (function() {
                        function WalkState(player) {
                          var pl = player;
                          var timer = 0;

                          // State transitions
                          this.activate = function() {
                            timer = 0;
                          };
                          this.idle = function() {
                            pl.setState( pl.getIdleState() );
                          };
                          this.jump = function() {
                            pl.setState( pl.getJumpState() );
                          };
                          // TODO: add knockout
                          this.fall = function() {
                            pl.setState( pl.getFallState() );
                          };

                          this.update = function(event) {
                            timer += service.time.delta / 1000;
                            if (timer >= WALK_ANI_SPEED) {
                              timer = 0;
                              pl.owner.find( 'Model' ).updateAction( 'walk' );
                            }
                          };

                          this.toString = function() {
                            return "move right";
                          };
                        }

                        return WalkState;
                      }());

                      //
                      // FallState - Sprite is falling down, waiting to land on
                      // something.
                      // Once we collide with something, the state of the sprite
                      // will be
                      // changed to idle.
                      var FallState = (function() {
                        function FallState(player) {
                          var pl = player;
                          var timeElapsed = 0;

                          this.activate = function() {
                            timeElapsed = 0;
                            pl.owner.find( 'Model' ).updateAction( 'jump' );
                          };
                          this.update = function(event) {
                          };
                          this.land = function() {
                            pl.setState( pl.getIdleState() );
                          };

                          this.toString = function() {
                            return 'falling';
                          };
                        }
                        return FallState;
                      }());

                      //
                      // JumpState - Allows player to jump straight up
                      //
                      var JumpState = (function() {
                        function JumpState(player) {
                          var pl = player;
                          var timeElapsed = 0;

                          this.update = function(event) {
                            var delta = service.time.delta / 1000;

                            timeElapsed += delta;
                            // var yPos =
                            // pl.owner.find('Transform').position[1];

                            // TODO: FIX ME
                            if (timeElapsed > 0.15 /*
                                                     * && if not colliding with
                                                     * something
                                                     */) {
                              pl.setState( pl.getFallState() );
                            }
                          };

                          // TODO: FIX ME
                          this.land = function() {
                            pl.setState( pl.getIdleState() );
                          };

                          this.activate = function() {
                            timeElapsed = 0;
                            pl.owner.find( 'Model' ).updateAction( 'jump' );
                            new engine.core.Event( {
                              type : 'LinearImpulse',
                              data : {
                                impulse : [ 0, JUMP_IMPULSE ]
                              }
                            } ).dispatch( pl.owner );
                          };
                          this.toString = function() {
                            return 'jump';
                          };

                        }
                        return JumpState;
                      }());

                      // KnockedOutState
                      var KnockedOutState = (function() {
                        function KnockedOutState(player) {
                          var pl = player;
                          var timeElapsed = 0;

                          this.update = function(event) {
                            var delta = service.time.delta / 1000;
                          };

                          this.activate = function() {
                            pl.owner.find( 'Model' ).updateAction(
                                'knocked-out' );
                          };
                          this.toString = function() {
                            return 'ko';
                          };
                        }
                        return KnockedOutState;
                      }());

                      // instances of all the states
                      var idleState = new IdleState( this );
                      var jumpState = new JumpState( this );
                      var walkState = new WalkState( this );
                      var fallState = new FallState( this );
                      var knockedOutState = new KnockedOutState( this );
                      var state = idleState;

                      this.onIdle = function() {
                        state.idle && state.idle();
                      };
                      this.onJump = function() {
                        state.jump && state.jump();
                      };
                      this.onWalk = function() {
                        state.walk && state.walk();
                      };
                      this.onFall = function() {
                        state.fall && state.fall();
                      };
                      this.onKnockOut = function() {
                        state.knockOut && state.knockOut();
                      };

                      this.setState = function(s) {
                        if (state !== s) {
                          state = s;
                          state.activate && state.activate();
                        }
                      };

                      this.onUpdate = function(t) {
                        state && state.update( t );
                      };

                      // FIX ME
                      this.land = function() {
                        state.land && state.land();
                      };

                      // 
                      this.getIdleState = function() {
                        return idleState;
                      };
                      this.getJumpState = function() {
                        return jumpState;
                      };
                      this.getWalkState = function() {
                        return walkState;
                      };
                      this.getFallState = function() {
                        return fallState;
                      };
                      this.getKnockedOutState = function() {
                        return knockedOutState;
                      };

                      this.getCurrState = function() {
                        return state.toString();
                      };

                      // Boilerplate component registration; Lets our service
                      // know that we exist and want to do things
                      this.onComponentOwnerChanged = function(e) {
                        if (e.data.previous === null && this.owner !== null) {
                          service.registerComponent( this.owner.id, this );
                        }

                        if (this.owner === null && e.data.previous !== null) {
                          service
                              .unregisterComponent( e.data.previous.id, this );
                        }
                      };

                      this.onEntityManagerChanged = function(e) {
                        if (e.data.previous === null &&
                            e.data.current !== null &&
                            this.owner !== null) {
                          service.registerComponent( this.owner.id, this );
                        }

                        if (e.data.previous !== null && 
                            e.data.current === null &&
                            this.owner !== null) {
                          service.unregisterComponent( this.owner.id, this );
                        }
                      };
                    } );

            // //////////////////
            // Stone Crate Component
            // //////////////////

            /*
             * Boss creates these which fall from the sky
             */
            var StoneCrateComponent = engine.base.Component( {
              type : 'StoneCrate',
              depends : [ 'Transform', 'Model' ]
            }, function(options) {

              options = options || {};
              var that = this;

              // We need to somehow get rid of the boxes once they hit the floor
              // or the users head. We can do this by just bouncing them off the
              // floor and the user.
              var vel = [ 0, 0, 0 ];
              var acc = [ 0, 0, 0 ];
              var angularVelocity = [ 0, 0, 0 ];

              var timer = 0;

              var timeToDie = options.time;

              // This is a hack so that this component will have its message
              // queue processed
              var service = engine.logic;

              this.onContactBegin = function(e) {
                var crateXpos = this.owner.find( 'Transform' ).position;
                var bossXpos = e.data.entities[0].find( 'Transform' ).position;
                var userXpos = e.data.entities[0].find( 'Transform' ).position;

                if (e.data.entities[0].name === 'player') {
                  // Only hurt the player if the crate landed on his head
                  if (crateXpos[1] > userXpos[1]) {

                    e.data.entities[0].find( 'Health' ).onHurt( 25 );
                  }
                }

                // Since the crate is moving towards the user it no longer
                // should interact with the game XY-plance, so remove the Body component.
                this.owner.remove( "Body" );

                var x = (Math.random() - 0.5) * 20;

                // Set the crate in motion.
                vel = [ x, 45, 25 ];
                acc = [ 0, -100, 0 ];
                angularVelocity = [ (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5 ];
              };

              this.onContactEnd = function(event) {
              };

              this.onUpdate = function(event) {
                var delta = service.time.delta / 1000;

                timer += delta;

                // Update the position
                var pos = this.owner.find( 'Transform' ).position;
                pos[0] += vel[0] * delta;
                pos[1] += vel[1] * delta;
                pos[2] += vel[2] * delta;
                this.owner.find( 'Transform' ).position = pos;

                var rot = this.owner.find( 'Transform' ).rotation;
                rot[0] += angularVelocity[0] * delta;
                rot[1] += angularVelocity[1] * delta;
                rot[2] += angularVelocity[2] * delta;
                this.owner.find( 'Transform' ).rotation = rot;

                vel[0] += acc[0] * delta;
                vel[1] += acc[1] * delta;
                vel[2] += acc[2] * delta;

                if (timer >= timeToDie) {
                  space.remove( this.owner );
                }

                // Remove the crate if it goes past the floor.
                if (pos[1] < 0) {
                  space.remove( this.owner );
                }
              }; // onUpdate

              // Boilerplate component registration; Lets our service know that
              // we exist and want to do things
              this.onComponentOwnerChanged = function(e) {
                if (e.data.previous === null && this.owner !== null) {
                  service.registerComponent( this.owner.id, this );
                }

                if (this.owner === null && e.data.previous !== null) {
                  service.unregisterComponent( e.data.previous.id, this );
                }
              };

              this.onEntityManagerChanged = function(e) {
                if (e.data.previous === null && e.data.current !== null &&
                    this.owner !== null) {
                  service.registerComponent( this.owner.id, this );
                }

                if (e.data.previous !== null && e.data.current === null &&
                    this.owner !== null) {
                  service.unregisterComponent( this.owner.id, this );
                }
              };
            } ); // Stone Crate Components

            // //////////////////
            // Boss Component
            // //////////////////
            var BossComponent = engine.base.Component(
                    {
                      type : 'Enemy',
                      depends : [ 'Transform', 'Model' ]
                    },
                    function(options) {

                      options = options || {};
                      var that = this;

                      // This is a hack so that this component will have its
                      // message queue processed
                      var service = engine.logic;

                      this.facing = FACING_LEFT;

                      this.setFacing = function(f) {
                        if (f === FACING_LEFT || f === FACING_RIGHT) {
                          this.facing = f;
                          this.walk();
                        }
                      };

                      this.onContactBegin = function(e) {
                        var other = (e.data.entities[0].id === this.owner.id) ? e.data.entities[1]
                            : e.data.entities[0];                        
                        if (other.name === 'crate') {
                          var cratePosition = other.find( 'Transform' ).position;
                          var bossPosition = this.owner.find( 'Transform' ).position;

                          if (cratePosition[1] > bossPosition[1]) {
                            space.remove( other );
                            this.owner.find( 'Health' ).onHurt( 25 );
                          }
                        }
                      };

                      // Boilerplate component registration; Lets our service
                      // know that we exist and want to do things
                      this.onComponentOwnerChanged = function(e) {
                        if (e.data.previous === null && this.owner !== null) {
                          service.registerComponent( this.owner.id, this );
                        }

                        if (this.owner === null && e.data.previous !== null) {
                          service
                              .unregisterComponent( e.data.previous.id, this );
                        }
                      };

                      this.onEntityManagerChanged = function(e) {
                        if (e.data.previous === null &&
                            e.data.current !== null &&
                            this.owner !== null) {
                          service.registerComponent( this.owner.id, this );
                        }

                        if (e.data.previous !== null &&
                            e.data.current === null && this.owner !== null) {
                          service.unregisterComponent( this.owner.id, this );
                        }
                      };
                    } ); // Enemy Component

            // //////////////////
            // PlayerComponent
            // //////////////////
            var PlayerComponent = engine.base
                .Component(
                    {
                      type : 'Player',
                      depends : [ 'Transform', 'Model', 'State' ]
                    },
                    function(options) {

                      options = options || {};
                      var that = this;

                      var fallingState = true;
                      var landed = false;
                      var timer = 0;

                      var collideID = 0;
                      var platformEntity = null;

                      // This is a hack so that this component will have its
                      // message queue processed
                      var service = engine.logic;

                      this.initialPos = options.initialPos || [ 0, 0, 0 ];

                      var playerName = options.name || "NoName";
                      var facing = FACING_RIGHT;

                      var crateContactEntity = null;

                      this.onContactBegin = function(e) {
                        var userPos, platPos;

                        var other = (e.data.entities[0].id === this.owner.id) ? e.data.entities[1]
                            : e.data.entities[0];

                        if (other.name === 'crate') {
                          crateContactEntity = other;
                        }

                        // Make the sprite land
                        if (this.owner.find( 'State' ).getCurrState() === 'falling') {
                          // this.owner.find('State').getCurrState() ===
                          // 'forward jump'
                          this.owner.find( 'State' ).land();
                        }

                        if (e.data.entities[0].name === 'platform' /* && */) {
                          this.owner.find( 'Model' ).updateAction( 'walk' );
                        }

                        // If this is the first instance of us colliding with a
                        // platform,
                        // we must have just landed, which means we should go
                        // into an idle state.
                        // new collision
                        if (collideID !== e.data.entities[0].id &&
                            e.data.entities[0].name === 'platform') {

                          userPos = this.owner.find( 'Transform' ).position[1];
                          platPos = e.data.entities[0].find( 'Transform' ).position[1];

                          // FIX ME
                          // We could have collided with the platform by hitting
                          // our head on it,
                          // check that we didn't.

                          // FIX ME: take into account sprite's height
                          if (Math.abs( userPos - platPos ) > 0.0001) {
                            // if(userPos <= platPos)
                            // grab a reference to the platform
                            platformEntity = e.data.entities[0];
                            collideID = e.data.entities[0].id;

                            this.owner.find( 'Model' ).updateAction( 'idle' );
                          }
                        }
                      };

                      this.onContactEnd = function(e) {
                        var other = (e.data.entities[0].id === this.owner.id) ? e.data.entities[1]
                            : e.data.entities[0];

                        if (other.name === 'crate') {
                          crateContactEntity = null;
                        }
                      };

                      this.jump = function(event) {
                        this.owner.find( 'State' ).onJump();
                      };

                      this.moveRight = this.onStartMoveRight = function(event) {
                        this.setFacing( FACING_RIGHT );
                        this.owner.find( 'State' ).onWalk();
                        this.owner.find( 'Body' ).onLinearImpulse( {
                          data : {
                            impulse : [ MOVE_SPEED, 0 ]
                          }
                        } );
                      };

                      this.moveLeft = this.onStartMoveLeft = function(event) {
                        this.setFacing( FACING_LEFT );
                        this.owner.find( 'State' ).onWalk();
                        this.owner.find( 'Body' ).onLinearImpulse( {
                          data : {
                            impulse : [ -MOVE_SPEED, 0 ]
                          }
                        } );
                      };

                      this.idle = this.onIdle = function(event) {
                        this.owner.find( 'State' ).onIdle();
                      };

                      this.setFacing = function(f) {
                        if (f === FACING_LEFT || f === FACING_RIGHT) {
                          facing = f;
                          // right = 1, left = 0
                          // Convert -1..1 to 0..PI
                          this.owner.find( 'Transform' ).rotation = [ 0,
                              ((facing - 1) * -math.PI / 2), 0 ];
                        }
                      };

                      this.getFacing = function() {
                        return facing;
                      };

                      this.onUpdate = function(event) {
                        var delta = service.time.delta / 1000;

                        var platPos, userPos;

                        // If our feet are below the platform, that means we
                        // walked off the platform.
                        // We'll need to set our state to falling.

                        // If we're attached to a platform,
                        // AND our feet are below the platform
                        // That means we just walked off the
                        // platform and need to go into a falling state.
                        if (platformEntity && platformEntity.find) {
                          platPos = platformEntity.find( 'Transform' ).position[1];
                          userPos = this.owner.find( 'Transform' ).position[1];

                          // Our feet are below the platform
                          if (userPos /* -something */< platPos) {
                            console.log( 'falling' );

                            // We no longer have an associated platform
                            platformEntity = null;
                            collideID = 0;
                            this.owner.find( 'Model' ).updateAction( 'jump' );

                            // this.owner.find('State').onFall();
                          }
                        }

                        // TODO: remove before release
                        document.getElementById( 'debug' ).innerHTML = this.owner
                            .find( 'State' ).getCurrState();
                      }; // onUpdate

                      // Boilerplate component registration; Lets our service
                      // know that we exist and want to do things
                      this.onComponentOwnerChanged = function(e) {
                        if (e.data.previous === null && this.owner !== null) {
                          service.registerComponent( this.owner.id, this );
                        }

                        if (this.owner === null && e.data.previous !== null) {
                          service
                              .unregisterComponent( e.data.previous.id, this );
                        }
                      };

                      this.onEntityManagerChanged = function(e) {
                        if (e.data.previous === null &&
                            e.data.current !== null && this.owner !== null) {
                          service.registerComponent( this.owner.id, this );
                        }

                        if (e.data.previous !== null &&
                            e.data.current === null && this.owner !== null) {
                          service.unregisterComponent( this.owner.id, this );
                        }
                      };
                    } ); // PlayerComponent

            // //////////////
            // RUN
            // //////////////
            var run = function() {

              // Add some tunes
              var audioElement = document.createElement( 'audio' );
              audioElement.setAttribute( 'src', 'music/no-comply.ogg' );
              audioElement.addEventListener( "load", function() {
                audioElement.play();
              }, true );
              audioElement.play();
              audioElement.volume = 0;

              // "M" to toggle music mute
              window.addEventListener( "keyup", function(e) {
                if (e.keyCode == 77) {
                  audioElement.volume = !audioElement.volume;
                }
              }, true );

              canvas = engine.graphics.target.element;

              // //////////
              // Boss
              // //////////
              var bossW = 6, bossH = 16;

              var bossBody = engine.physics.resource.BodyDefinition( {
                type : engine.physics.resource.BodyDefinition.bodyType.DYNAMIC,
                linearDamping : 0,
                angularDamping : 0,
                fixedRotation : true
              } );

              var bossShape = engine.physics.resource.Box( bossW/2, bossH/2 );
              var bossFixture = engine.physics.resource.FixtureDefinition( {
                shape : bossShape,
                density : 8
              } );

              var boss = new space.Entity( {
                name : 'boss',
                components : [ new engine.core.component.Transform( {
                  // / !!! XXX use initial pos
                  position : math.Vector3( 38, FLOOR_POS + 10, GAME_DEPTH ),
                  scale : math.Vector3( 7 * 4, 7 * 4, 1 ),
                  rotation : math.Vector3( 0, math.PI, 0 )
                } ), bossBitwall,

                new BossComponent(),

                new HealthComponent( {
                  domId : 'boss',
                  color : 'orange'
                } ),

                new StateComponentBoss(),

                new engine.physics.component.Body( {
                  bodyDefinition : bossBody,
                  fixtureDefinition : bossFixture
                } ) ]
              } );

              // //////////
              // Player
              // //////////
              var playerBody = engine.physics.resource.BodyDefinition( {
                type : engine.physics.resource.BodyDefinition.bodyType.DYNAMIC,
                linearDamping : 2,
                angularDamping : 0,
                fixedRotation : true
              } );

              // Make an obstacle that will collide with the player
              var playerShape = engine.physics.resource.Box( 0.75, 2 );
              var playerFixture = engine.physics.resource.FixtureDefinition( {
                shape : playerShape,
                density : 8
              } );

              var player = new space.Entity( {
                name : 'player',
                components : [

                    // Model
                    new engine.core.component.Transform(
                        {
                          // / XXX use initial pos
                          position : math.Vector3( 30, FLOOR_POS + 105,
                              GAME_DEPTH ),
                          scale : math.Vector3( 7, 7, 7 )
                        } ),

                    playerBitwall,

                    new HealthComponent( {
                      domId : 'player',
                      color : 'green'
                    } ),

                    new engine.input.component.Controller( {

                      onKey : function(e) {
                        // keep state of the keys
                        var keyName = e.data.code;
                        keyStates[keyName] = (e.data.state === 'down') ? true
                            : false;

                        // TODO: remove before release
                        if (keyName == '1') {
                          makeCrate( {
                            position : [ 30, 40, GAME_DEPTH ]
                          } );
                        }

                      } // onKey
                    } ), // controller

                    new PlayerComponent( keyConfig ),

                    new StateComponent(),

                    new engine.physics.component.Body( {
                      bodyDefinition : playerBody,
                      fixtureDefinition : playerFixture
                    } ) ]
              } );

              var camera = new space.Entity( {
                name : 'camera',
                components : [ new engine.core.component.Transform( {
                  position : math.Vector3( 0, 15, 30 )
                } ), new engine.graphics.component.Camera( {
                  active : true,
                  width : canvas.width,
                  height : canvas.height,
                  fov : 60
                } ),
                // We need this light so white borders around sprites aren't
                // drawn.
                new engine.graphics.component.Light( {
                  type : "point",
                  method : "dynamic",
                  diffuse : [ 0, 0, 0 ],
                  specular : [ 0, 0, 0 ],
                  intensity : 10,
                  distance : 0
                } ) ]
              } );
              camera.find( 'Camera' ).target = math.Vector3( 0, 15, -1 );

              // //////////////
              // Task
              // //////////////
              var task = new engine.scheduler.Task( {
                schedule : {
                  phase : engine.scheduler.phases.UPDATE
                },
                callback : function() {
                  var delta = engine.scheduler.simulationTime.delta / 1000;

                  // Player components
                  var p1Pos = player.find( 'Transform' ).position;
                  var newPos = camera.find( 'Transform' ).position;
                  newPos[0] = p1Pos[0];
                  newPos[1] = p1Pos[1];

                  cameraShake /= 1.4;
                  var shake = Math.sin( cameraShake * delta ) * 2;

                  camera.find( 'Transform' ).position = [ newPos[0] + shake,
                      newPos[1] + 10 + shake, 25 + shake ];
                  camera.find( 'Camera' ).target = [ newPos[0],
                      4 + p1Pos[1] + shake, -1 ];

                  var playerState = player.find( 'State' );

                  // canMove
                  if (true) {
                    // TODO: fix me
                    if (keyStates[keyConfig.RIGHT_KEY] &&
                        keyStates[keyConfig.JUMP_KEY]) {
                      player.find( 'Player' ).jump();
                    } else if (keyStates[keyConfig.LEFT_KEY] &&
                        keyStates[keyConfig.JUMP_KEY]) {
                      player.find( 'Player' ).jump();
                    }
                    // Don't move the user if they're trying to move in both
                    // directions.
                    else if (keyStates[keyConfig.RIGHT_KEY] &&
                             keyStates[keyConfig.LEFT_KEY]) {
                      player.find( 'Player' ).idle();
                    }
                    // Move them right if released the right key.
                    if (keyStates[keyConfig.RIGHT_KEY]) {
                      player.find( 'Player' ).moveRight();
                    }
                    // Move them left if they released the left key.
                    else if (keyStates[keyConfig.LEFT_KEY]) {
                      player.find( 'Player' ).moveLeft();
                    }
                    // 
                    else if (keyStates[keyConfig.JUMP_KEY]) {
                      player.find( 'Player' ).jump();
                    } else {
                      player.find( 'Player' ).idle();
                    }
                  }
                }
              } );

              makeCrate( {
                position : [ -30, 40, GAME_DEPTH ]
              } );

              // Change these to change the width and height of
              // the platforms.
              var platW = 8, platH = 4;

              // Use these to change the dimensions of the parts
              // of the floor
              var rightFloorW = 50, rightFloorH = 15;

              // Used for the right and left wall to prevent the
              // user from
              // going off the scene.
              var wallW = 2, wallH = 150;

              // platform Box2d
              var bodyDef = engine.physics.resource
                  .BodyDefinition( {
                    type : engine.physics.resource.BodyDefinition.bodyType.STATIC,
                    linearDamping : 0,
                    angularDamping : 0,
                    fixedRotation : true
                  } );

              var platformShape = engine.physics.resource.Box(
                  platW / 2, platH / 2 );
              var platDef = engine.physics.resource
                  .FixtureDefinition( {
                    shape : platformShape,
                    density : 0
                  } );

              var floorShape = engine.physics.resource.Box(
                  rightFloorW / 2, rightFloorH / 2 );
              var floorDef = engine.physics.resource
                  .FixtureDefinition( {
                    shape : floorShape,
                    density : 0
                  } );

              var wallShape = engine.physics.resource.Box(
                  wallW / 2, wallH / 2 );
              var wallDef = engine.physics.resource
                  .FixtureDefinition( {
                    shape : wallShape,
                    density : 0
                  } );

              var floorCollisionShape = engine.physics.resource
                  .Box( 150, 0.1 );
              var floorFixtureDef = engine.physics.resource
                  .FixtureDefinition( {
                    shape : floorCollisionShape,
                    density : 0
                  } );

              // The center ditch between the left and the right
              // floors
              var floor = new space.Entity( {
                name : 'platform',
                components : [
                    new engine.core.component.Transform( {
                      position : math.Vector3( 0, FLOOR_POS,
                          GAME_DEPTH ),
                      scale : math.Vector3( 300, 0.1, 1 )
                    } ),
                    // TODO: remove before release
                    // new engine.graphics.component.Model(
                    // instance.meshes[0]
                    // ),
                    new engine.physics.component.Body( {
                      bodyDefinition : bodyDef,
                      fixtureDefinition : floorFixtureDef
                    } ) ]
              } );

              // Left floor, where the user starts
              new space.Entity( {
                name : 'platform',
                components : [
                    new engine.core.component.Transform( {
                      position : math.Vector3( -36.2,
                          FLOOR_POS - 1.5, GAME_DEPTH ),
                      scale : math.Vector3( rightFloorW,
                          rightFloorH, 5 )
                    } ),
                    new engine.graphics.component.Model(
                        //instance.meshes[0] 
                        resources.platform),
                    new engine.physics.component.Body( {
                      bodyDefinition : bodyDef,
                      fixtureDefinition : floorDef
                    } ) ]
              } );

              // Right floor, where the boss starts
              new space.Entity( {
                name : 'platform',
                components : [
                    new engine.core.component.Transform( {
                      position : math.Vector3( 33.2,
                          FLOOR_POS - 1.5, GAME_DEPTH ),
                      scale : math.Vector3( rightFloorW,
                          rightFloorH, 5 )
                    } ),
                    new engine.graphics.component.Model(
                        //instance.meshes[0] 
                        resources.platform),
                    new engine.physics.component.Body( {
                      bodyDefinition : bodyDef,
                      fixtureDefinition : floorDef
                    } ) ]
              } );

              // Left wall
              new space.Entity( {
                name : 'wall',
                components : [
                    new engine.core.component.Transform( {
                      position : math.Vector3( -58.5,
                          FLOOR_POS - 15, GAME_DEPTH ),
                      scale : math.Vector3( wallW, wallH, 5 )
                    } ),
                    // TODO: Remove before release
                    // new engine.graphics.component.Model(
                    // instance.meshes[0]
                    // ),

                    new engine.physics.component.Body( {
                      bodyDefinition : bodyDef,
                      fixtureDefinition : wallDef
                    } ) ]
              } );

              // Right wall
              new space.Entity( {
                name : 'wall',
                components : [
                    new engine.core.component.Transform( {
                      position : math.Vector3( 58.5,
                          FLOOR_POS - 15, GAME_DEPTH ),
                      scale : math.Vector3( wallW, wallH, 5 )
                    } ),
                    // TODO: Remove before release
                    // new engine.graphics.component.Model(
                    // instance.meshes[0]
                    // ),
                    new engine.physics.component.Body( {
                      bodyDefinition : bodyDef,
                      fixtureDefinition : wallDef
                    } ) ]
              } );

              // These are the platforms user can jump on
              for ( var i = 0; i < 3; i++) {
                new space.Entity( {
                  name : 'platform',
                  components : [
                      new engine.core.component.Transform( {
                        position : math.Vector3( i * 15, 20 + FLOOR_POS +
                                                 (i * 5), GAME_DEPTH ),
                        scale : math.Vector3( platW, platH, 5 )
                      } ),
                      new engine.graphics.component.Model(
                          //instance.meshes[0] 
                          resources.platform),
                      new engine.physics.component.Body( {
                        bodyDefinition : bodyDef,
                        fixtureDefinition : platDef
                      } ) ]
                } );
              }

              // Start the engine!
              engine.run();
            };

            engine.core.resource
                .get(
                    [
                        {
                          type : engine.core.resource.Collada,
                          url : "city/intro_city-anim.dae",
                          load : colladaLoader,
                          onsuccess : function(instance) {

                            for ( var i = 0; i < instance.meshes.length; i++) {

                              new space.Entity( {
                                name : instance.names[i],
                                components : [
                                    new engine.core.component.Transform( {
                                      position : instance.positions[i],
                                      rotation : instance.rotations[i],
                                      scale : instance.scales[i]
                                    } ),

                                    new engine.graphics.component.Model(
                                        instance.meshes[i] ) ]
                              } );
                            }
                          },
                          onfailure : function(error) {
                            console.log( "error loading collada resource: " +
                                         error );
                          }
                        },

                        {
                          type : engine.core.resource.Collada,
                          url : 'platform/platform.dae',
                          load : colladaLoader,
                          onsuccess : function(instance) {
                            resources.platform = instance.meshes[0];
                          }
                        },

                        {
                          type : engine.core.resource.Collada,
                          url : 'crate/crate.dae',
                          load : colladaLoader,
                          onsuccess : function(instance) {
                            // We'll be making crates dynamically so we need to
                            // make an accessible reference.
                            resources.crate = {
                              mesh : instance.meshes[0]
                            };
                          },
                          onfailure : function(error) {
                            console.log( error );
                          }
                        },

                        {
                          type : engine.core.resource.Collada,
                          url : 'stone/stone.dae',
                          load : colladaLoader,
                          onsuccess : function(instance) {
                            // We'll be making stone crates dynamically so we
                            // need to make an accessible reference.
                            resources.stone = {
                              mesh : instance.meshes[0]
                            };
                          },
                          onfailure : function(error) {
                            console.log( error );
                          }
                        }

                    ], {

                      oncomplete : function() {

                        // We may be sharing a copy of require.js with Gladius
                        // if we're developing
                        // If so, this next line guarantees that we have a
                        // configuration of
                        // require.js that loads things relative to this
                        // directory
                        var localRequire = require.config( {
                          context : "local",
                          baseUrl : "../sprites"
                        } );

                        // pull in the bitwall-model code, and once we've got
                        // it, load our sprite,
                        // and run the game!
                        localRequire( [ 'bitwall-model' ], function(
                            BitwallModel) {
                          bossBitwall = new BitwallModel( {
                            spriteURL : 'sprites/thug1.sprite',
                            action : 'walk-front'
                          } );
                          playerBitwall = new BitwallModel( {
                            spriteURL : 'sprites/kraddy.sprite',
                            action : 'jump'
                          } );

                          // viking.height (a global var for all the sprites
                          // defaults to 64),
                          // which means that it doesn't match the way box2d
                          // thinks about
                          // things, causing sprites to be stuck in the ground.
                          // This fudge
                          // factor aligns things.
                          viking.height = 84;

                          playerBitwall.init( function() {
                            bossBitwall.init( function() {
                              run();
                            } );
                          } );
                        } );
                      }
                    } );
          };

          gladius.create( {
            debug : true,
            services : {
              graphics : {
                src : 'graphics/service',
                options : {
                  canvas : canvas
                }
              },
              input : {
                src : 'input/service',
                options : {}
              },
              physics : {
                src : 'physics/2d/box2d/service',
                options : {
                  gravity : [ 0, -98 ]
                }
              },
              logic : 'logic/game/service'
            }
          }, game );

        } );
