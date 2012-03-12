/**
  Simple game based on the "No Comply" WebGL video.

  TODO:
  - add material for p2 fireball
  - fix fireball logic
  - fix infinite "fall" (user collides with two platforms at the same time)
  - Need a uniform time constant to compare against when user is jumping

 - FIX: MUST KEEP COLLISION and BOX2d values the SAME!!!
  
  - Bug: user needs to hold down 'down' to make sure char crouches as soon as they hit the floor.
*/
document.addEventListener("DOMContentLoaded", function (e) {

  var getById = function(id){
    return document.getElementById(id);
  }

  var canvas = document.getElementById("test-canvas");
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Do something awesome with this.
  // function mozOrientationHandler(e){}
	// window.addEventListener('devicemotion', mozOrientationHandler, false);

  var resources = {};

  // XXX fix me
  var thugAction = 'idle';

  //
  var game = function (engine) {
    
      const FACING_RIGHT =   1;
      const FACING_LEFT   = -1;

      const LEFT_BORDER = 70;
      const RIGHT_BORDER = -30;
      const MOVE_SPEED = 15;
      
      const FLOOR_POS = 8;
      const GRAVITY = 0.98;
      const JUMP_HEIGHT = 45;
      
      const PLAYER_BB_HEIGHT = 3.5;
      
      //
      const WALK_ANI_SPEED = 0.085;
      const PUNCH_DURATION   = 0.12;
      const THROW_FIREBALL_DURATION = 0.5;
      
      // Time needed to walk backwards before throwing fireball
      const FIREBALL_WAIT = 1.0;
      const FIREBALL_SPEED = 0.8;
      
      var MAX_HEALTH = 500;
      
      // FIXME
      var justBeenPressed = true;

      
      //////////////////
      // Player config
      /////////////////
      
      // Player 1 starts on the left side of the screen facing right
      var keyConfig = {
        RIGHT_KEY:  'RIGHT',
        LEFT_KEY:   'LEFT',
        JUMP_KEY:   'UP',
        DOWN_KEY:   'DOWN',
        PUNCH_KEY:  'A',
        name:       'player1',
        dir:        FACING_RIGHT,
        initialPos: [-20, FLOOR_POS, 0]
      };
      
      //////////////////////
      // Debugging
      //////////////////////
      var printd = function (div, str) {
          var el = document.getElementById(div);
          if (el) {
            el.innerHTML = str + '<p>';
          }
      };
      var cleard = function (div) {
          document.getElementById(div).innerHTML = '';
      };

      var space;// = new engine.core.Space();
      var math = engine.math;


      ////////////
      // Physics
      ////////////
      var Physics = engine.base.Service({
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
            var gravity = options.gravity || new Box2D.b2Vec2( 0, 0 );
            var world = new Box2D.b2World( gravity );
            var directions = {
                    up: new Box2D.b2Vec2( 0, 1 ),
                    down: new Box2D.b2Vec2( 0, -1 ),
                    left: new Box2D.b2Vec2( -1, 0 ),
                    right: new Box2D.b2Vec2( 1, 0 )
            };
            var rotations = {
                    cw: -1,
                    ccw: 1
            };
            
            this.update = function() {
                
                var component;
                
                var updateEvent = new engine.core.Event({
                    type: 'Update',
                    queue: false,
                    data: {
                        delta: that.time.delta
                    }
                });
                for( var componentType in that.components ) {
                    for( var entityId in that.components[componentType] ) {
                        component = that.components[componentType][entityId];
                        while( component.handleQueuedEvent() ) {}
                        updateEvent.dispatch( component );
                    }
                }
                
                // Box2D steps in seconds
                var deltaInSeconds = that.time.delta / 1000; 
                world.Step( deltaInSeconds, 2, 2 );
            };

            var Body = engine.base.Component({
                type: 'Body',
                depends: ['Transform']
            },
            function( options ) {
                options = options || {};  
                var that = this;
                var i;
                var horizMoveSpeed = 35;
                var vertMoveSpeed = 2500;
                
                var rotationSpeed = 1.0;
                
                // Create the body as a box2d object
                var body = world.CreateBody( options.bodyDefinition );
                body.CreateFixture( options.fixtureDefinition );
                body.SetLinearVelocity( new Box2D.b2Vec2( 0, 0 ) );
                
                var moveDirection = new Box2D.b2Vec2( 0, 0 );
                var moveEventStates = {
                        up: false,
                        down: false,
                        left: false,
                        right: false
                };
                
                var rotationDirection = 0;
                var rotationEventStates = {
                        cw: false,
                        ccw: false
                };
                
                this.setLinearVel = function(v){
                  body.SetLinearVelocity( new Box2D.b2Vec2( v[0], v[1] ) );
                };
                
                this.onMove = function(e){
                  var frameImpulse = new Box2D.b2Vec2( 0, vertMoveSpeed );
                  //frameImpulse.Set( moveDirection.get_x(), moveDirection.get_y() );
                  //frameImpulse.Normalize();
                  //frameImpulse.Set( moveSpeed * frameImpulse.get_x(), moveSpeed * frameImpulse.get_y() );
                  body.ApplyLinearImpulse( frameImpulse, body.GetPosition() );
                };
                
                this.onMoveStart = function( e ) {
                console.log('f');
                    var direction = directions[e.data.direction];
                    
                    if( moveEventStates[e.data.direction] ) {
                        return;
                    }
                    
                    moveDirection.Set( moveDirection.get_x() + direction.get_x(), 
                            moveDirection.get_y() + direction.get_y() );
                    moveEventStates[e.data.direction] = true;
                };
                
                this.onMoveStop = function( e ) {
                
                  if(moveEventStates[e.data.direction]){
                
                    var direction = directions[e.data.direction];
                    moveDirection.Set( moveDirection.get_x() - direction.get_x(), 
                            moveDirection.get_y() - direction.get_y() );
                    moveEventStates[e.data.direction] = false;
                    }
                };
                
                this.onRotateStart = function( e ) {
                    var rotation = rotations[e.data.direction];
                    
                    if( rotationEventStates[e.data.direction] ) {
                        return;
                    }
                    
                    rotationDirection += rotation;
                    rotationEventStates[e.data.direction] = true;
                };
                
                this.onRotateStop = function( e ) {
                    var rotation = rotations[e.data.direction];
                    rotationDirection -= rotation;
                    rotationEventStates[e.data.direction] = false;
                };
                               
                var frameImpulse = new Box2D.b2Vec2( 0, 0 );
                this.onUpdate = function( e ) {
                //console.log(body.GetPosition().get_x());
                    frameImpulse.Set( moveDirection.get_x(), moveDirection.get_y() );
                    frameImpulse.Normalize();
                    frameImpulse.Set( horizMoveSpeed * frameImpulse.get_x(), vertMoveSpeed * frameImpulse.get_y() );
                    body.ApplyLinearImpulse( frameImpulse, body.GetPosition() );
                    body.ApplyAngularImpulse( rotationSpeed * rotationDirection );
                    
                    var position2 = body.GetPosition();
                    var angle2 = body.GetAngle();
                    
                    // TD: This will cause the transform to emit an event that we handle below. Blech!
                    var transform = this.owner.find( 'Transform' );  
                    transform.position = math.Vector3( position2.get_x(), position2.get_y(), transform.position[2] );
                    transform.rotation = math.Vector3( transform.rotation[0], transform.rotation[1], angle2 );
                };
                               
                this.onComponentOwnerChanged = function( e ){
                    if( e.data.previous === null && this.owner !== null ) {
                        service.registerComponent( this.owner.id, this );
                        body.SetActive( true );
                        body.SetAwake( true );
                        var transform = this.owner.find( 'Transform' );
                        body.SetTransform( new Box2D.b2Vec2( transform.position[0], transform.position[1] ), transform.rotation[2] );
                    }
                    
                    if( this.owner === null && e.data.previous !== null ) {
                        service.unregisterComponent( e.data.previous.id, this );
                        body.SetActive( false );
                        body.SetAwake( false );
                    }
                };
                
                this.onEntityManagerChanged = function( e ) {
                    if( e.data.previous === null && e.data.current !== null && this.owner !== null ) {
                        service.registerComponent( this.owner.id, this );
                        body.SetActive( true );
                        body.SetAwake( true );
                        body.SetTransform( new Box2D.b2Vec2( transform.position[0], transform.position[1] ), transform.rotation[2] );
                    }
                    
                    if( e.data.previous !== null && e.data.current === null && this.owner !== null ) {
                        service.unregisterComponent( this.owner.id, this );
                        body.SetActive( false );
                        body.SetAwake( false );
                    }
                };
                
            });

            this.component = {
                Body: Body
            };
            
            var Box = function( hx, hy ) {
                var shape = new Box2D.b2PolygonShape();
                shape.SetAsBox( hx, hy );
                return shape;
            };
            
            var BodyDefinition = function( type, linearDamping, angularDamping, fixedRot ) {
                var bd = new Box2D.b2BodyDef();
                bd.set_type( type );
                
                // Sprites are falling down too easily, so for now, prevent rotations.
                bd.set_fixedRotation(fixedRot || false);
                bd.set_linearDamping( linearDamping );
                bd.set_angularDamping( angularDamping );
                bd.set_position( new Box2D.b2Vec2( 0, 0 ) );
                bd.active = false;
                bd.awake = false;
                return bd;
            };
            
            BodyDefinition.bodyType = {
                STATIC: Box2D.b2_staticBody,
                KINEMATIC: Box2D.b2_kinematicBody,
                DYNAMIC: Box2D.b2_dynamicBody
            };
            
            var FixtureDefinition = function( shape, density ) {
                var fd = new Box2D.b2FixtureDef();
                fd.set_density( density );
                fd.set_shape( shape );

                return fd;
            };
            
            this.resource = {
                Box: Box,
                BodyDefinition: BodyDefinition,
                FixtureDefinition: FixtureDefinition
            };
        });
        
        // FIXME
        engine.physics = new Physics({ gravity: new Box2D.b2Vec2( 0, -198 ) });
        

        /////////
        // Collision Service
        /////////
        var Collision2Service = engine.base.Service({
            type: 'Physics',
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

            var BoundingBox = engine.base.Component({
                type: 'Collision',
                depends: ['Transform']
            },
            function( options ) {
                this.lowerLeft = options.lowerLeft;
                this.upperRight = options.upperRight;
                
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

                function checkCollision( box1, box2 ) {
                    var top1, top2,
                        bottom1, bottom2,
                        left1, left2,
                        right1, right2;
                    
                    top1 = box1.upperRight[1];
                    top2 = box2.upperRight[1];
                    bottom1 = box1.lowerLeft[1];
                    bottom2 = box2.lowerLeft[1];
                    
                    left1 = box1.lowerLeft[0];
                    left2 = box2.lowerLeft[0];
                    right1 = box1.upperRight[0];
                    right2 = box2.upperRight[0];
                    
                    var outsideBottom = bottom1 > top2,
                        outsideTop = top1 < bottom2,
                        outsideLeft = left1 > right2,
                        outsideRight = right1 < left2;
                        
                    return !( outsideBottom || outsideTop || outsideLeft || outsideRight );
                }

                for( var collisionEntity1 in that.components.Collision ) {
                    var component1 = that.components.Collision[collisionEntity1];
                    var box1 = null;
                    var box2 = null;

                    for( var collisionEntity2 in that.components.Collision ) {
                        if( collisionEntity1 !== collisionEntity2 ) {
                            var component2 = that.components.Collision[collisionEntity2];
                            
                            if( !box1 ) {
                                var transform1 = component1.owner.find( 'Transform' );
                                box1 = {
                                        lowerLeft: math.vector3.add(
                                                    transform1.position,
                                                    component1.lowerLeft
                                                ),
                                        upperRight: math.vector3.add(
                                                    transform1.position,
                                                    component1.upperRight
                                                )
                                };
                            }
                            
                            var transform2 = component2.owner.find( 'Transform' );
                            box2 = {
                                    lowerLeft: math.vector3.add(
                                                transform2.position,
                                                component2.lowerLeft
                                            ),
                                    upperRight: math.vector3.add(
                                                transform2.position,
                                                component2.upperRight
                                            )
                            };

                            if ( checkCollision( box1, box2 ) ) {
                                new engine.core.Event({
                                    type: 'Collision',
                                    data: {
                                        entity: component2.owner,
                                    }
                                }).dispatch( [component1.owner] );
                            }

                        }
                    }
                }
            };

            var _components = {
                    BoundingBox: BoundingBox
            };

            Object.defineProperty( this, 'component', {
                get: function() {
                    return _components;
                }
            });
        });

        var collision2Service = new Collision2Service();
        
      


      
      // Global state of the keyboard.
      var keyStates = [];

      ///////////////
      //
      ///////////////
      function colladaLoader(url, onsuccess, onfailure) {
        // XXX figure out why this is necessary
        window.CubicVR = engine.graphics.target.context;

        // XXX move this out
        CubicVR.setGlobalAmbient([1,1,1]);

        try {
          var context = engine.graphics.target.context;
          var scene = context.loadCollada(url, "city");
          onsuccess(scene);
        }
        catch (e) {
          onfailure(e);
        }
      }

      

      // Thanks to the NoComply demo's CubicVR-bitmap_cube_array.js' for the
      // BitwallModel code
      var BitwallModel = engine.base.Component({
        type: 'Model',
        depends: ['Transform']
      }, function (options) {
        options = options || {};
        var _this = this;
        var service = engine.graphics;
        var gl = CubicVR.GLCore.gl;

        var _sprite = options.sprite;
        var _mesh = new engine.graphics.resource.Mesh();
        var _cvrmesh = _mesh._cvr.mesh;
        var _material;
        var tex = new CubicVR.Texture();

        function _updateTexture(action) {
          gl.bindTexture(gl.TEXTURE_2D, CubicVR.Textures[tex.tex_id]);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _sprite[action].frame());
          gl.bindTexture(gl.TEXTURE_2D, null);
        }

        var _action = options.action || null;
        this.updateAction = function (action) {
          _action = action;
          _updateTexture(action);
        };

        function buildMaterial() {

          // create an empty texture
          tex.setFilter(CubicVR.enums.texture.filter.NEAREST);
          tex.use();
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

          // XXX
          _updateTexture(thugAction);
          _material = new engine.graphics.resource.Material({
            color: [1, 1, 1],
            textures: {
              color: tex
            }
          });
        }

        function buildMesh() {
          var _cvrmat = _material._cvr.material;

          var tmpMesh = new CubicVR.Mesh();

          var trans = new CubicVR.Transform();

          trans.clearStack();
          trans.scale([1, 1, 1]);

          CubicVR.genPlaneObject(tmpMesh, 1.0, _cvrmat);

          tmpMesh.faces[0].uvs = [
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0]
          ];
          tmpMesh.faces[1].uvs = [
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 0]
          ];

          var is = 0.1 / 8.0;

          // create outside faces first to help with Early-Z
          trans.clearStack();
          trans.translate([0, 0, -0.05]);
          _cvrmesh.booleanAdd(tmpMesh, trans);
          trans.clearStack();
          trans.translate([0, 0, 0.05]);
          _cvrmesh.booleanAdd(tmpMesh, trans);

          var p;

          for (var i = -0.05 + is; i < 0.05 - is; i += is) {
            trans.clearStack();
            trans.translate([0, 0, i]);
            _cvrmesh.booleanAdd(tmpMesh, trans);
            p++;
          }

          _cvrmesh.calcNormals();
          _cvrmesh.triangulateQuads();
          _cvrmesh.compile();
        }

        buildMaterial();
        buildMesh();

        Object.defineProperty(this, "mesh", {
          enumerable: true,
          get: function () {
            return _mesh;
          }
        });

        this.onComponentOwnerChanged = function (e) {
          if (e.data.previous === null && this.owner !== null) {
            service.registerComponent(this.owner.id, this);
          }

          if (this.owner === null && e.data.previous !== null) {
            service.unregisterComponent(e.data.previous.id, this);
          }
        };

        this.onEntityManagerChanged = function (e) {
          if (e.data.previous === null && e.data.current !== null && this.owner !== null) {
            service.registerComponent(this.owner.id, this);
          }

          if (e.data.previous !== null && e.data.current === null && this.owner !== null) {
            service.unregisterComponent(this.owner.id, this);
          }
        };

        this.prepare = function () {
          if (_mesh && _material && _mesh._cvr && _material._cvr) {
            _mesh.prepare({
              material: _material
            });
          } //if
        };
        //prepare
        _this.prepare();

      });


      /*
      * Health Component
      * FIX ME need to actually use this
      */
      var HealthComponent = engine.base.Component({
        type: 'Health'
        }, function( options ){
          
          options = options || {};
          
          var service = engine.logic;          
          var val = MAX_HEALTH;
          var domId = options.domId;
            
          this.onHealth = function(h){
            // XXX add check here
            
            // XXX use h variable
            val -= 15;
            document.getElementById(domId).style.width = val + "px";
          }
          
          this.onUpdate = function(){
          }
          
          // Boilerplate component registration; Lets our service know that we exist and want to do things
          this.onComponentOwnerChanged = function (e) {
            if (e.data.previous === null && this.owner !== null) {
              service.registerComponent(this.owner.id, this);
            }

            if (this.owner === null && e.data.previous !== null) {
              service.unregisterComponent(e.data.previous.id, this);
            }
          };

          this.onEntityManagerChanged = function (e) {
            if (e.data.previous === null && e.data.current !== null && this.owner !== null) {
              service.registerComponent(this.owner.id, this);
            }

            if (e.data.previous !== null && e.data.current === null && this.owner !== null) {
              service.unregisterComponent(this.owner.id, this);
            }
          };
        });
        
      


      /////////////
      // Fireball
      /////////////
      var FireBallComponent = engine.base.Component({
        type: 'Fireball',
        depends: ['Transform', 'Model']
        },
        function( options ){
          var that = this;
          var service = engine.logic;
         // var pos = options.position.position;
           var dir = options.direction;

          this.onUpdate = function ( event ){

            // XXX this is terrible
            var pos = this.owner.find('Transform').position;
            var rot = this.owner.find('Transform').rotation;
            
            rot[0] += 0.05;
            rot[2] += 0.05;
            
            pos[2] += FIREBALL_SPEED * dir;
            
            this.owner.find('Transform').position = pos;
            this.owner.find('Transform').rotation = rot;
          };

          // Boilerplate component registration; Lets our service know that we exist and want to do things
          this.onComponentOwnerChanged = function (e) {
            if (e.data.previous === null && this.owner !== null) {
              service.registerComponent(this.owner.id, this);
            }

            if (this.owner === null && e.data.previous !== null) {
              service.unregisterComponent(e.data.previous.id, this);
            }
          };

          this.onEntityManagerChanged = function (e) {
            if (e.data.previous === null && e.data.current !== null && this.owner !== null) {
              service.registerComponent(this.owner.id, this);
            }

            if (e.data.previous !== null && e.data.current === null && this.owner !== null) {
              service.unregisterComponent(this.owner.id, this);
            }
          };

        });




      /*
      *
      *  StateComponent
      *
      */
      var StateComponent = engine.base.Component({
        type: 'State'
        },
        
        function( options ){
          options = options || {};
          var that = this;
          
          var service = engine.logic;

          //
          // Idle State - Player is just standing there.
          //
          var IdleState = (function () {
            function IdleState(player) {
              var pl = player;

              this.activate = function(){
                console.log('activated idle state');
                
                /*pl.owner.find('Body').onMoveStop({data:{direction:"up"}});
                pl.owner.find('Body').onMoveStop({data:{direction:"right"}});
                pl.owner.find('Body').onMoveStop({data:{direction:"left"}});*/
              }

              this.moveForward = function (){ pl.setState(pl.getMoveForwardState());};
              this.moveLeft = function(){ pl.setState(pl.getMoveLeftState());};
              
              this.jump = function () {       pl.setState(pl.getJumpState());};
              this.crouch = function(){       pl.setState(pl.getCrouchState());};
              this.spinKick = function(){     pl.setState(pl.getSpinKickState());};
              this.knockOut = function(){     pl.setState(pl.getKnockedOutState());};
              this.fall = function(){         pl.setState(pl.getFallState());};
              
              this.hit = function(d){
                //pl.health -= d;
                //if(pl.health <= 0){
                //this.knockOut();
                //}
              }

              this.update = function (event) {
                pl.owner.find('Model').updateAction('idle');                
              };
              this.toString = function(){
                return "idle";
              };
            }
            return IdleState;
          }());

          // MoveForwardState - 
          var MoveForwardState = (function () {
            function MoveForwardState(player) {
              var pl = player;
              var timer = 0;
              
              // State transitions
              this.idle = function () {
                //pl.owner.find('Body').onMoveStart({data:{direction:"right"}});
                pl.setState(pl.getIdleState());
              };
               
              this.jump = function () {   pl.setState(pl.getForwardJumpState());};
              this.spinKick = function(){ pl.setState(pl.getSpinKickState());};
              this.fall = function(){     pl.setState(pl.getFallState());};

              this.onActivate = function(){
                timer = 0;
              };

              this.update = function (event) {
                timer += service.time.delta / 1000;
                
                // get direction
                
                //var dir = pl.owner.find('Player').getDirection();

                var char = pl.owner.find('Player');// || pl.owner.find('Enemy');
                var facing = char.getFacing();

                var dirStr = facing === -1 ? 'left' : 'right';
                
               // pl.owner.find('Body').onMoveStart({data:{direction: 'right'}});
                          
                // FIXME
                //var char = pl.owner.find('Player');// || pl.owner.find('Enemy');
                //var facing = char.getFacing();
                
                // FIXME
                //pl.owner.find('Body').setLinearVel([15*facing, 0]);
                //pl.owner.find('Body').onMoveStart({data:{direction:"right"}});
                
                // FIXME, remove?
                //convert -1..1 to 0..PI
                //pl.owner.find('Transform').rotation = [0, -(facing+1)*math.PI/2, 0];

                if(timer >= WALK_ANI_SPEED){
                  timer = 0;
                  pl.owner.find('Model').updateAction('walk');
                }                
              };
              
              this.toString = function(){
                return "move forward";
              }
            }

            return MoveForwardState;
          }());
          
          
          
          
          
          
          var MoveLeftState = (function () {
            function MoveLeftState(player) {
              var pl = player;
              var timer = 0;
              
              // State transitions
              this.idle = function () {                  
                pl.owner.find('Body').onMoveStop({data:{direction:"left"}});
                
               pl.setState(pl.getIdleState());};
               
              this.jump = function () {   pl.setState(pl.getForwardJumpState());};
              this.spinKick = function(){ pl.setState(pl.getSpinKickState());};
              this.fall = function(){     pl.setState(pl.getFallState());};

              this.onActivate = function(){
                timer = 0;
              };

              this.update = function (event) {
                timer += service.time.delta / 1000;
                
                // FIXME
                var char = pl.owner.find('Player');// || pl.owner.find('Enemy');
                var facing = char.getFacing();
                //console.log(facing);
                
                // FIXME
                //pl.owner.find('Body').setLinearVel([15*facing, 0]);
                pl.owner.find('Body').onMoveStart({data:{direction:'left'}});
                
                // FIXME, remove?
                //convert -1..1 to 0..PI
                //pl.owner.find('Transform').rotation = [0, -(facing+1)*math.PI/2, 0];

                if(timer >= WALK_ANI_SPEED){
                  timer = 0;
                  pl.owner.find('Model').updateAction('walk');
                }                
              };
              
              this.toString = function(){
                return "move forward";
              }
            }

            return MoveLeftState;
          }());

          
          
          
          
          
          
          
          
          
          //
          // CrouchState - Player is crouching
          //
          var CrouchState = (function () {
            function CrouchState(player) {
              var pl = player;
              // State transitions
              this.idle = function () {   pl.setState(pl.getIdleState());};
              this.activate = function(){
                pl.owner.find('Model').updateAction('crouch');
              };
              this.update = function (event) {};
            }
            return CrouchState;
          }());



          //
          // FallState - Sprite is falling down, waiting to land on something.
          // Once we collide with something, the state of the sprite will be
          // changed to idle.
          var FallState = (function () {
            function FallState(player) {
              var pl = player;
              var timeElapsed = 0;

              this.update = function (event) {};
              this.idle = function () {   pl.setState(pl.getIdleState());};
              
              this.activate = function(){
                timeElapsed = 0;
                pl.owner.find('Model').updateAction('jump');
              };
              
              this.toString = function(){
                return "falling";
              };
            }
            return FallState;
          }());


          //
          // JumpState - Allows player to jump straight up
          //
          var JumpState = (function () {
            function JumpState(player) {
              var pl = player;
              var timeElapsed = 0;

              this.update = function (event) {
                var delta = service.time.delta / 1000;

                timeElapsed += delta;
                //var yPos = pl.owner.find('Transform').position[1];
                
                if(timeElapsed > 0.15 /* && if not colliding with something */){
                  pl.setState(pl.getFallState());
                  console.log('falling');
                  
                  // FIXME: Do we need this?
                  collideID = 0;
                  platformEntity = null;
                }
              };
              
              this.idle = function () {   pl.setState(pl.getIdleState());};
              
              this.activate = function(){
                timeElapsed = 0;
                console.log('jump state act');
                pl.owner.find('Model').updateAction('jump');
                
                // FIX ME
                new engine.core.Event({
                  type: 'Move',
                  data: {
                    direction: 'up'
                  }
                }).dispatch( [pl.owner] );
              }
              this.toString = function(){
                return "jump";
              }

            }
            return JumpState;
          }());

          // KnockedOutState
          var KnockedOutState = (function () {
            function KnockedOutState(player) {
              var pl = player;
              var timeElapsed = 0;

              this.update = function (event) {
                var delta = service.time.delta / 1000;
              };
              
              this.activate = function(){
                pl.owner.find('Model').updateAction('knocked-out');
              }
              this.toString = function(){
                return "ko";
              }

            }
            return KnockedOutState;
          }());

          // SpinKickState - 
          var SpinKickState = (function () {
            function SpinKickState(player) {
              var pl = player;
              var timeElapsed = 0;

              this.knockOut = function(){pl.setState(pl.getKnockedOutState());};

              this.update = function (event) {
                var delta = service.time.delta / 1000;

                timeElapsed += delta * 2.5;
                
                /// XXXX fix
                var rot3 = pl.owner.find('Transform').rotation;
                rot3[1] =  timeElapsed * math.TAU;
                pl.owner.find('Transform').rotation = rot3;
                                
                if(timeElapsed > 1){
                  pl.owner.find('Transform').rotation = [0, 0, 0];
                  
                  pl.setState(pl.getIdleState());
                }
              };
              
              this.activate = function(){
                timeElapsed = 0;
                
                pl.owner.find('Model').updateAction('twirl-kick');
              }
              this.toString = function(){
                return "spin";
              }
            }
            return SpinKickState;
          }());



         // 
         //
         //
         //
         //
          var WalkJumpState = (function () {
            function ForwardJumpState(player) {
              var pl = player;
              var timeElapsed = 0;
              
              this.idle = function () {   pl.setState(pl.getIdleState());};
              
              this.activate = function(){              
                timeElapsed = 0;
                var char = pl.owner.find('Player') || pl.owner.find('Enemy');
                var facing = char.facing;
                
                pl.owner.find('Body').setLinearVel([25*facing,0]);
                
                new engine.core.Event({
                    type: 'Move',
                            data: {
                                direction: 'up'
                            }
                }).dispatch( pl.owner );
              };
              
              this.update = function () {
                var delta = service.time.delta / 1000;
                timeElapsed += delta;
                var yPos = pl.getTransform().position[1];
                if(yPos <= FLOOR_POS + PLAYER_BB_HEIGHT*2 && timeElapsed > 0.2){
                  pl.setState(pl.getIdleState());
                }                
              };
              
              this.toString = function(){
                return 'walk jump';
              }
            }
            return WalkJumpState;
          }());

          // Forward Jump State
          var ForwardJumpState = (function () {
            function ForwardJumpState(player) {
              var pl = player;
              var timeElapsed = 0;
              
              this.idle = function () {   pl.setState(pl.getIdleState());};
              
              this.activate = function(){              
                timeElapsed = 0;
                pl.owner.find('Model').updateAction('jump');
          
                // FIX ME
                var char = pl.owner.find('Player') || pl.owner.find('Enemy');
                var facing = char.facing;
                
                new engine.core.Event({
                    type: 'Move',
                            data: {
                                direction: 'up'
                            }
                }).dispatch( pl.owner );
              };
              
              this.update = function () {
                var delta = service.time.delta / 1000;
                timeElapsed += delta;
                var yPos = pl.getTransform().position[1];
                if(yPos <= FLOOR_POS + PLAYER_BB_HEIGHT*2 && timeElapsed > 0.2){
                  pl.setState(pl.getIdleState());
                }
                
                //var rot = pl.getTransform().rotation;
                //rot[2] = pos[1]/JUMP_HEIGHT * math.PI*5;
                // rot[2] += delta * math.TAU;
                //delta * math.TAU/ JUMP_HEIGHT;
                //pl.getTransform().rotation = rot;

                //var rot = pc.rotation;
                //rot[2] += t * math.TAU;
                //pc.rotation = rot;
                
                //if(/*pos[1] <= FLOOR_POS &&*/ timeElapsed > 0.5){
                 // standStraight();
                  //rot[2] = 0;
                  //pl.getTransform().rotation = rot;                  
                  //pl.setState(pl.getIdleState());
                //}
              };
              
              this.toString = function(){
                return 'forward jump';
              }
            }
            return ForwardJumpState;
          }());





          // instances of all the state
          var idleState = new IdleState(this);
          var jumpState = new JumpState(this);
          
          var moveForwardState = new MoveForwardState(this);
          var moveLeftState = new MoveLeftState(this);
          
          var forwardJumpState = new ForwardJumpState(this);
          var crouchState = new CrouchState(this);
          var spinKickState = new SpinKickState(this);
          var fallState = new FallState(this);
          var knockedOutState = new KnockedOutState(this);

          var state = idleState;
          
          this.getPlayer = function(){
            // FIXME
            var ret = this.owner.find('Player') || this.owner.find('Enemy');
            return ret;
          }
          
          this.getTransform = function(){
            return this.owner.find('Transform');
          }
          
          this.setState = function(s){
            if(state !== s){
              state = s;
              state.activate && state.activate();
            }
          };
          
          this.onUpdate = function(t){
            state && state.update(t);
          }
          
          this.onJump = function(){         state.jump && state.jump();};
          this.onFall = function(){         state.fall && state.fall();};
          this.onIdle = function(){         state.idle && state.idle();}
          this.onMoveForward = function(){  state.moveForward && state.moveForward();}
          
          this.onMoveLeft = function(){ state.moveLeft && state.moveLeft();};
          
          this.onCrouch = function(){       state.crouch && state.crouch();}
          this.onPunch = function(){        state.punch && state.punch();}
          this.onSpinKick = function(){     state.spinKick && state.spinKick();};
          this.onKnockOut = function(){     state.knockOut && state.knockOut();};
          
          this.onMoveStop = function(){
            state = (state === moveForwardState) ? idleState : state;
          }

          this.getJumpState = function(){return jumpState;}
          this.getIdleState = function(){return idleState;}
          
          this.getMoveForwardState = function (){return moveForwardState;};
          this.getMoveLeftState = function(){return moveLeftState;};
          
          this.getForwardJumpState = function(){return forwardJumpState;};
          this.getCrouchState = function(){     return crouchState;};
          this.getSpinKickState = function(){     return spinKickState;}; 
          this.getFallState = function(){ return fallState;};
          this.getKnockedOutState = function(){ return knockedOutState;};
          
          this.getCurrState = function(){
            return state.toString();
          };
          
          // Boilerplate component registration; Lets our service know that we exist and want to do things
          this.onComponentOwnerChanged = function (e) {
            if (e.data.previous === null && this.owner !== null) {
              service.registerComponent(this.owner.id, this);
            }

            if (this.owner === null && e.data.previous !== null) {
              service.unregisterComponent(e.data.previous.id, this);
            }
          };

          this.onEntityManagerChanged = function (e) {
            if (e.data.previous === null && e.data.current !== null && this.owner !== null) {
              service.registerComponent(this.owner.id, this);
            }

            if (e.data.previous !== null && e.data.current === null && this.owner !== null) {
              service.unregisterComponent(this.owner.id, this);
            }
          };
        });
        



      ////////////////////
      // PlatformComponent
      ////////////////////
      var PlatformComponent = engine.base.Component({
        type: 'Platform',
        depends: ['Transform', 'Model']
      },
      function (options) {
      
        options = options || {};
        var that = this;
        
        // This is a hack so that this component will have its message queue processed
        var service = engine.logic; 

        /*var size = 5.0;
        var shape = new Box2D.b2PolygonShape();
        shape.SetAsBox(size, 1);
        //var bd = new Box2D.b2BodyDef();
        bd.set_type(Box2D.b2_staticBody);
        bd.set_position(new Box2D.b2Vec2(0, 15));
        var body = world.CreateBody(bd);
        body.CreateFixture(shape, 5.0);*/

        this.velocity = [0, 0, 0];
        this.acceleration = [0, 0, 0];

        this.onCollision = function(e){
          /*
          if(e.data.entity.find('State')){
            var playerState = e.data.entity.find('State').getCurrState();
            var playerTrans = e.data.entity.find('Transform');

            // XXX move this out
            if(playerState === "spin"){
              //console.log(playerState);
              //this.velocity = [0, 100, -10];
              //this.acceleration[1] = 9.8 * 80;
            }
          }*/
        };
        
        this.onUpdate = function (event) {
          var delta = service.time.delta / 1000;
          
          
          // var trans = this.owner.find('Transform').position;
          // trans[0] += this.velocity[0] * delta;
          // trans[1] += this.velocity[1] * delta;
          // trans[2] -= this.velocity[2] * delta;
          //this.owner.find('Transform').position;
          //var data = { x: 0, y: 0, angle: 0 };
          //readObject(1, data);
          //this.owner.find('Transform').position = [data.x, data.y, 0];
          /* var renderObject = boxes[i];
            renderObject.position[0] = data.x;
            renderObject.position[1] = data.y;
            renderObject.position[2] = 0;
            renderObject.rotation = [0, 0, data.angle*180/Math.PI];*/
            // this.velocity[1] -= this.acceleration[1] * delta;
            //this.owner.find('Transform').position = trans;
        }; // onUpdate
        
        // Boilerplate component registration; Lets our service know that we exist and want to do things
        this.onComponentOwnerChanged = function (e) {
          if (e.data.previous === null && this.owner !== null) {
            service.registerComponent(this.owner.id, this);
          }

          if (this.owner === null && e.data.previous !== null) {
            service.unregisterComponent(e.data.previous.id, this);
          }
        };

        this.onEntityManagerChanged = function (e) {
          if (e.data.previous === null && e.data.current !== null && this.owner !== null) {
            service.registerComponent(this.owner.id, this);
          }

          if (e.data.previous !== null && e.data.current === null && this.owner !== null) {
            service.unregisterComponent(this.owner.id, this);
          }
        };
      }); // PlatformComponent
      


       ////////////////////
      // CrateComponent
      ////////////////////
      var CrateComponent = engine.base.Component({
        type: 'Crate',
        depends: ['Transform', 'Model']
      },
      function (options) {
      
        options = options || {};
        var that = this;
        
        // This is a hack so that this component will have its message queue processed
        var service = engine.logic; 

        this.velocity = [0, 0, 0];
        this.acceleration = [0, 0, 0];

        this.onCollision = function(e){
          console.log('collide');
        
          if(e.data.entity.find('State')){
            var playerState = e.data.entity.find('State').getCurrState();
            var playerTrans = e.data.entity.find('Transform');

            // XXX move this out
            if(playerState === "spin"){
              //this.velocity = [0, 100, -10];
              //this.acceleration[1] = 9.8 * 80;
            }
          }
        };
        
        this.onUpdate = function (event) {
          var delta = service.time.delta / 1000;
          
          // var trans = this.owner.find('Transform').position;
          // trans[0] += this.velocity[0] * delta;
          // trans[1] += this.velocity[1] * delta;
          // trans[2] -= this.velocity[2] * delta;
          //this.owner.find('Transform').position;
          //var data = { x: 0, y: 0, angle: 0 };
          //readObject(1, data);
          //this.owner.find('Transform').position = [data.x, data.y, 0];
          /* var renderObject = boxes[i];
            renderObject.position[0] = data.x;
            renderObject.position[1] = data.y;
            renderObject.position[2] = 0;
            renderObject.rotation = [0, 0, data.angle*180/Math.PI];*/
            // this.velocity[1] -= this.acceleration[1] * delta;
            //this.owner.find('Transform').position = trans;
        }; // onUpdate
        
        // Boilerplate component registration; Lets our service know that we exist and want to do things
        this.onComponentOwnerChanged = function (e) {
          if (e.data.previous === null && this.owner !== null) {
            service.registerComponent(this.owner.id, this);
          }

          if (this.owner === null && e.data.previous !== null) {
            service.unregisterComponent(e.data.previous.id, this);
          }
        };

        this.onEntityManagerChanged = function (e) {
          if (e.data.previous === null && e.data.current !== null && this.owner !== null) {
            service.registerComponent(this.owner.id, this);
          }

          if (e.data.previous !== null && e.data.current === null && this.owner !== null) {
            service.unregisterComponent(this.owner.id, this);
          }
        };
      }); // CrateComponent
      


      ////////////////////
      // EnemyComponent
      ////////////////////
      var EnemyComponent = engine.base.Component({
        type: 'Enemy',
        depends: ['Transform', 'Model']
      },
      function (options) {
      
        options = options || {};
        var that = this;
        
        // This is a hack so that this component will have its message queue processed

        var service = engine.logic; 

        this.velocity = [0, 0, 0];
        this.acceleration = [0, 0, 0];
        
        this.facing = FACING_LEFT;

        this.onCollision = function(e){
        
          if(e.data.entity.find('State')){
            var playerState = e.data.entity.find('State').getCurrState();
            var playerTrans = e.data.entity.find('Transform');

            // XXX move this out
            if(playerState === "spin"){
              this.owner.find('State').onKnockOut();
              console.log('hit');

              // FIXME: Prevent the object from colliding with anything else.
              // this.onCollision = function(){};
              // this.velocity = [5, 50, 5];
              // this.acceleration[1] = -9.8 * 20;
            }
            //else{set Linear Vel of object}
          }
        };
        
        this.setFacing = function(f){
          this.stopWalk();
          
         /* if(this.facing === FACING_LEFT){
            this.owner.find('Transform').rotation = [0, 0, 0];
          }
          else{
            this.owner.find('Transform').rotation = [0, 3.14, 0];
          }*/

          this.facing = f;
          this.walk();
        }
        
        // FIXME
        this.getBody = function(){
          return this.owner.find('Body');
        };
        
        // tell the sprite to walk forward
        this.walk = function(){
        /*
          var dir = this.facing === 1 ? 'right' : 'left';
        
          new engine.core.Event({
              type: 'MoveStart' ,
              data: {
                direction: dir
              }
          }).dispatch( this.owner );
        };
        
        this.stopWalk = function(){
        var dir = this.facing === 1 ? 'right' : 'left';
          new engine.core.Event({
              type: 'MoveStop',
              data: {
                direction: dir
              }
          }).dispatch( this.owner );*/
        }
        
        
        
        this.onUpdate = function (event) {

          var delta = service.time.delta / 1000;

         // this.owner.find('Model').updateAction('walk');
                    
          //var trans = this.owner.find('Transform').position;
          //trans[0] += this.velocity[0] * delta;
          //trans[1] += this.velocity[1] * delta;
          //trans[2] += this.velocity[2] * delta;
          
          //this.velocity[1] += this.acceleration[1] * delta;
          //this.getBody().setLinearVel([-10,0]);
          //this.owner.find('Transform').position = trans;
        }; // onUpdate
        
        // Boilerplate component registration; Lets our service know that we exist and want to do things
        this.onComponentOwnerChanged = function (e) {
          if (e.data.previous === null && this.owner !== null) {
            service.registerComponent(this.owner.id, this);
          }

          if (this.owner === null && e.data.previous !== null) {
            service.unregisterComponent(e.data.previous.id, this);
          }
        };

        this.onEntityManagerChanged = function (e) {
          if (e.data.previous === null && e.data.current !== null && this.owner !== null) {
            service.registerComponent(this.owner.id, this);
          }

          if (e.data.previous !== null && e.data.current === null && this.owner !== null) {
            service.unregisterComponent(this.owner.id, this);
          }
        };
      }); // Enemy Component
      







      ////////////////////
      // PlayerComponent
      ////////////////////
      var PlayerComponent = engine.base.Component({
        type: 'Player',
        depends: ['Transform', 'Model', 'State']
      },
      function (options) {
      
        options = options || {};
        var that = this;
        
        var fallingState = true;
        var landed = false;
        var lastTime;
        var thisTime;
        var timer = 0;
        
        
         collideID = 0;
         platformEntity = null;
        
        // This is a hack so that this component will have its message queue processed
        var service = engine.logic; 
        
        this.initialPos = options.initialPos || [0,0,0];
        
        //this.health = MAX_HEALTH;
        //this.speed = [0, 0];
        var playerName = options.name || "NoName";
        this.name = playerName;
        var facing = FACING_RIGHT;

        /*var size = 1.0;
        var shape = new Box2D.b2PolygonShape();
        shape.SetAsBox(size, size);
        var bd = new Box2D.b2BodyDef();
        bd.set_type(Box2D.b2_dynamicBody);
        bd.set_position(new Box2D.b2Vec2(-13, 45));
        var body = world.CreateBody(bd);
        body.CreateFixture(shape, 5.0);*/
        //bodies.push(body);

        this.onCollision = function(e){
          //onPlatform = true;

          // If this is the first instance of us colliding with a platform,
          // we must have just landed, which means we should go into an idle state.
          // new collision
          if(collideID !== e.data.entity.id /* && on platform */){
          
           console.log('NEW collide');
          
            // FIXME: hoisting FIXME: check if platform
            var userPos = this.owner.find('Transform').position[1];          
            var platPos =  e.data.entity.find('Transform').position[1];

            // We could have collided with the platform by hitting our head on it,
            // check that we didn't.
            console.log(Math.abs(userPos - platPos));
            
            // FIX ME: add in users height
            if( Math.abs(userPos - platPos) > 0.0001){
              // grab a reference to the platform
              platformEntity = e.data.entity;
              collideID = e.data.entity.id;
              
              console.log('just landed');
              this.owner.find('State').onIdle();
            }
          }
          
          // FIX ME
          //if(collideID != e.data.entity.id){
          //  this.owner.find('State').onIdle();
          //  collideID = e.data.entity;
          //}
        };
        
        this.onJump = function (event) {
//          this.owner.find('Body').onMoveStart({data:{direction: 'up'}});
          this.owner.find('State').onJump();
        };
        
        this.onRightJump = function(e){
          console.log('right jump');
          this.onStopMoveLeft();
          this.owner.find('State').onJump();
        };
        
        this.onStartMoveRight = function(event){
          this.setFacing(FACING_RIGHT);
          this.owner.find('Body').onMoveStart({data:{direction: 'right'}});
          this.owner.find('State').onMoveForward();
        };

        this.onStopMoveRight = function(event){
          this.owner.find('Body').onMoveStop({data:{direction: 'right'}});
          this.owner.find('State').onIdle();
        };
        
        this.onStartMoveLeft = function(event){
          this.setFacing(FACING_LEFT);
          this.owner.find('Body').onMoveStart({data:{direction: 'left'}});
          this.owner.find('State').onMoveForward();
        };
        
        this.onStopMoveLeft = function(event){
          this.owner.find('Body').onMoveStop({data:{direction: 'left'}});
          this.owner.find('State').onIdle();
        };


                
        this.setFacing = function(f){
          if(f === FACING_LEFT || f === FACING_RIGHT){
            facing = f;
            // right = 1,   left = 0
            // Convert -1..1 to 0..PI
            this.owner.find('Transform').rotation = [0, ((facing-1) * -math.PI/2), 0];                      
          }
        };
        
        this.getFacing = function(){
          return facing;
        };
        
        // XXX fix me
        this.getPlayer = function () {
          return player;
        };

        this.onUpdate = function (event) {
          var delta = service.time.delta / 1000;

          var platPos,
              userPos;
          
          // If our feet are below the platform, that means we walked off the platform.
          // We'll need to set our state to falling.
          

          // If we're attached to a platform,
          // AND our feet are below the platform
          // That means we just walked off the 
          // platform and need to go into a falling state.
          if(platformEntity && platformEntity.find){
             platPos = platformEntity.find('Transform').position[1];
             userPos = this.owner.find('Transform').position[1];

            // Our feet are below the platform
            if(userPos /* -something */ < platPos){
              console.log('falling');
              
              // We no longer have an associated platform
              platformEntity = null;
              collideID = 0;
              
              this.owner.find('State').onFall();
            }
          }
          
          document.getElementById('debug').innerHTML = this.owner.find('State').getCurrState();
          
            //          if(!lastTime){
            //lastTime = thisTime = 0;
            //          timer = 0;
            //this.owner.find('Transform').position[1];
            //      }
            //    else{
            //            var delta = this.owner.find('Transform').position[1] - lastTime;

            // lastTime += delta;
            // timer += delta;
                        
             // if(Math.abs(delta) > 0.01){
             //    fallingState = true;
             //this.owner.find('State').onFall();
             // must be falling
             // set to falling state
             //}
            
             //if(fallingState && Math.abs(delta) < 0.1){
             //  console.log('landed');
             //  fallingState = false;
             //  this.owner.find('State').onIdle();
             //}
            
             //lastTime = this.owner.find('Transform').position[1];
         // }
          
          onPlatform = false;
        }; // onUpdate
        
        // Boilerplate component registration; Lets our service know that we exist and want to do things
        this.onComponentOwnerChanged = function (e) {
          if (e.data.previous === null && this.owner !== null) {
            service.registerComponent(this.owner.id, this);
          }

          if (this.owner === null && e.data.previous !== null) {
            service.unregisterComponent(e.data.previous.id, this);
          }
        };

        this.onEntityManagerChanged = function (e) {
          if (e.data.previous === null && e.data.current !== null && this.owner !== null) {
            service.registerComponent(this.owner.id, this);
          }

          if (e.data.previous !== null && e.data.current === null && this.owner !== null) {
            service.unregisterComponent(this.owner.id, this);
          }
        };
      }); // PlayerComponent
      
      
      ////////////////
      // RUN
      ////////////////
      var run = function () {

        // Create game floor
        var gravity = new Box2D.b2Vec2(0.0, -19.8);
        world = new Box2D.b2World(gravity);

        // FIXME
        /* var bd_ground = new Box2D.b2BodyDef();
        var ground = world.CreateBody(bd_ground);

        var shape0 = new Box2D.b2EdgeShape();
        shape0.Set(new Box2D.b2Vec2(-400, 9), new Box2D.b2Vec2(400.0, 9));
        ground.CreateFixture(shape0, 0);*/

        // Add some tunes
        var audioElement = document.createElement('audio');
        audioElement.setAttribute('src', 'music/no-comply.ogg');
        audioElement.addEventListener("load", function() {
          audioElement.play();
        }, true);
        audioElement.play();
        audioElement.volume = 0;

        // "M" to toggle music mute
        window.addEventListener("keyup", function(e){
          if(e.keyCode == 77){
            audioElement.volume = !audioElement.volume
          }          
        }, true);

          canvas = engine.graphics.target.element;


          ////////////  
          // Thug test
          ////////////
          var thugBodyDef = engine.physics.resource.BodyDefinition(
                  engine.physics.resource.BodyDefinition.bodyType.DYNAMIC,  6, 1, false);

          // Make an obstacle that will collide with the player
          var thugShape = engine.physics.resource.Box( 1, 2 );//0.4, 2
          var thugFixDef = engine.physics.resource.FixtureDefinition( thugShape, 5.0 );


          for(var i = 0; i < 0; i++){
            var thug1 = new space.Entity({
                name: 'thug' + i,
                components: [
                  
                  // Model
                  new engine.core.component.Transform({
                    /// XXX use initial pos
                    position: math.Vector3((i+1)*20, FLOOR_POS + 5, 0),
                    scale: math.Vector3(7, 7, 7),
                    rotation: math.Vector3(0, math.PI, 0)
                  }),
                  
                  // Graphic Representation
                  new BitwallModel({
                    sprite: viking.sprites.thug1
                  }),
                  
                  new EnemyComponent({}),
                  
                  //new StateComponent(), 
                  
                  new engine.physics.component.Body({
                    bodyDefinition: thugBodyDef,
                    fixtureDefinition: thugFixDef
                  }),

                  new collision2Service.component.BoundingBox({
                    lowerLeft: math.Vector3( -2, -3,  0),
                    upperRight: math.Vector3( 0.5,  2,  0 )
                  })
                ]
              });
          }          
          //thug1.find('Enemy').setFacing(1);
          //thug1.find('Enemy').walk();

                    
          ////////////                      
          // Player1 Entity
          ////////////
          var cubeBodyDefinition = engine.physics.resource.BodyDefinition(
                  engine.physics.resource.BodyDefinition.bodyType.DYNAMIC, 1, 1, true);

          // Make an obstacle that will collide with the player
          var cubeCollisionShape = engine.physics.resource.Box( 0.75, 2 ); // 0.4, 2
          var cubeFixtureDefinition = engine.physics.resource.FixtureDefinition( cubeCollisionShape, 5.0 );

          var player1 = new space.Entity({
            name: 'player1',
            components: [
            
            // Model
            new engine.core.component.Transform({
              /// XXX use initial pos
              position: math.Vector3(-28, FLOOR_POS + 35, -50),
              scale: math.Vector3(7, 7, 7)
            }),
            
            // Graphic Representation
            new BitwallModel({
              sprite: viking.sprites.kraddy
            }),
            
            new HealthComponent({domId: 'player1'}),
            
            new engine.input.component.Controller({
            
              onKey: function (e) {

                // keep state of the keys
                var keyName = e.data.code;
                keyStates[keyName] = (e.data.state === 'down') ? true : false;

                var player = this.owner.find('Player');

                switch (keyName) {

                  //
                  case 'RIGHT':
                    if(keyStates[keyName]){
                      player.onStartMoveRight();
                      //this.owner.find('Body').onMoveStart({data:{direction: 'right'}});
                    }
                    else{
                      player.onStopMoveRight();
                      //this.owner.find('Body').onMoveStop({data:{direction: 'right'}});           
                    }
                  break;
                  
                  case 'LEFT':
                    if(keyStates[keyName]){
                      player.onStartMoveLeft();
                      //this.owner.find('Body').onMoveStart({data:{direction: 'left'}});
                    }
                    else{
                      player.onStopMoveLeft();
                      //this.owner.find('Body').onMoveStop({data:{direction: 'left'}});
                    }
                  break;
                  
                  case 'UP':
                    if(keyStates[keyName]){
                      player.onJump();
                    }
                  break;

                } // switch
              } // onKey
            }), //controller
            
            
            new PlayerComponent(keyConfig),
            
            new StateComponent(), 
            
            new engine.physics.component.Body({
              bodyDefinition: cubeBodyDefinition,
              fixtureDefinition: cubeFixtureDefinition
            }),

             new collision2Service.component.BoundingBox({
               lowerLeft: math.Vector3( -2, -3,  0),
               upperRight: math.Vector3( 0.5,  2,  0 )
              })
            ]
          });


          // floor
          var floorBodyDef = engine.physics.resource.BodyDefinition(
                  engine.physics.resource.BodyDefinition.bodyType.STATIC, 1, 1, true);

          var floorCollisionShape = engine.physics.resource.Box( 150, .1 );
          var floorFixtureDef = engine.physics.resource.FixtureDefinition( floorCollisionShape, 5.0 );

          var floor = new space.Entity({
              name: 'floor',
              components: [
                 new engine.core.component.Transform({
                  position: math.Vector3( 0, FLOOR_POS, 0 ),
                  scale: math.Vector3( 300, .1, 1)
                  }),

                 new engine.graphics.component.Model({
                     mesh: resources.mesh,
                     material: resources.material
                 }),
                 
                 new collision2Service.component.BoundingBox({
                     lowerLeft: math.Vector3( -150,  -0.1,  0),
                      upperRight: math.Vector3( 150,  0.1,  0 )
                  }),
                    
                 new PlatformComponent(),
                 
                 new engine.physics.component.Body({
                     bodyDefinition: floorBodyDef,
                     fixtureDefinition: floorFixtureDef
                 }),
                 ]
          });

          // Add some platforms
          for(var i = 0; i < 3; i++){

            // platform
            var bodyDef = engine.physics.resource.BodyDefinition(
                    engine.physics.resource.BodyDefinition.bodyType.STATIC, 1, 1, false);

            var collisionShape = engine.physics.resource.Box( 4, 0.5 );
            var fixtureDef = engine.physics.resource.FixtureDefinition( collisionShape, 5.0 );
            
            new space.Entity({
                name: 'platform' + i,
                components: [
                   new engine.core.component.Transform({
                    position: math.Vector3( -25 + i*10, 20 + FLOOR_POS - (i*7) + 1, -50 ),
                    scale: math.Vector3( 8, 1, 5)
                    }),

                   new engine.graphics.component.Model({
                       mesh: resources.mesh,
                       material: resources.material
                   }),
                   
                   new PlatformComponent(),
                   
                   new collision2Service.component.BoundingBox({
                     lowerLeft: math.Vector3( -4, -0.5,  0),
                      upperRight: math.Vector3( 4,  0.5,  0 )
                    }),
                    
                   new engine.physics.component.Body({
                       bodyDefinition: bodyDef,
                       fixtureDefinition: fixtureDef
                   }),
                   ]
            });
          }
          
          
          // Add crates
          for(var i = 0; i < 10; i++){

            // platform
            var bodyDef = engine.physics.resource.BodyDefinition(
                    engine.physics.resource.BodyDefinition.bodyType.DYNAMIC, 1, 1, false);

            var collisionShape = engine.physics.resource.Box( 1, 1 );
            var fixtureDef = engine.physics.resource.FixtureDefinition( collisionShape, 1.0 );
            
            new space.Entity({
                name: 'crate' + i,
                components: [
                   new engine.core.component.Transform({
                    position: math.Vector3( -20 + (i*5), 30 + FLOOR_POS, -50 ),
                    scale: math.Vector3( 3, 3, 3)
                    }),

                   new engine.graphics.component.Model({
                       mesh: resources.mesh,
                       material: resources.material
                   }),
                   
                   new CrateComponent(),
                   
                   new engine.physics.component.Body({
                       bodyDefinition: bodyDef,
                       fixtureDefinition: fixtureDef
                   }),
                   ]
            });
          }

          
          
          /*
            new space.Entity({
                name: 'enemy' + i,
                components: [
                   new engine.core.component.Transform({
                    position: math.Vector3( -3, 11, 0 ),
                    scale: math.Vector3( 1, 1, 1)
                    }),

                   new engine.graphics.component.Model({
                       mesh: resources.mesh,
                       material: resources.material
                   }),
                   
                   new EnemyComponent(),
                   
                   new collision2Service.component.BoundingBox({
                     lowerLeft: math.Vector3( -2, -3,  0),
                      upperRight: math.Vector3( 0.5,  2,  0 )
                    })
              
                   new engine.physics.component.Body({
                       bodyDefinition: bodyDef,
                       fixtureDefinition: fixtureDef
                   }),
                   ]
            });*/

          var camera = new space.Entity({
            name: 'camera',
            components: [
            new engine.core.component.Transform({
              position: math.Vector3(0, 15, 30)
            }), new engine.graphics.component.Camera({
              active: true,
              width: canvas.width,
              height: canvas.height,
              fov: 60
            }),
            // !!!We need this light so white borders around sprites aren't drawn.
             new engine.graphics.component.Light({
                type: "point",
                method: "dynamic",
                diffuse: [0, 0, 0 ],
                specular: [0, 0, 0 ],
                intensity: 10,
                distance: 0
            })
            ]
          });
          camera.find('Camera').target = math.Vector3(0, 15, -1);

          // XXX Make the camera move slowly back to the starting point instead of this.
          var restartGame = function(){
            camera.find('Transform').position = math.Vector3(0, 10, -1);
            camera.find('Camera').target = math.Vector3(0, 10, 30);
          }
          
          ////////////////
          // Task
          ////////////////
          var task = new engine.scheduler.Task({
            schedule: {
              phase: engine.scheduler.phases.UPDATE
            },
            callback: function () {
              var delta = engine.scheduler.simulationTime.delta / 1000;
              
              world.Step(delta, 2, 2);
                         
              // Player components
              var p1Com = player1.find('Player');
              var p1Pos = player1.find('Transform').position;
              var p1Xpos = p1Pos[0];
              var p1Div = getById('player1');
              // XXX fix me
              p1Div = getById('player1'); 
              // XXX fix this
              
              var newPos = camera.find('Transform').position;
              newPos[0] = p1Pos[0];
              newPos[1] = p1Pos[1];
              
              camera.find('Transform').position = [newPos[0], newPos[1], 2];
              
              //[40, 10, 50]
              //
              camera.find('Camera').target = [newPos[0], p1Pos[1], -1];
//              math.Vector3(0, 0, -1);
              
              
              
              var playerState = player1.find('State');
              //var thugState = thug1.find('State');
              //var thugPos = thug1.find('Transform').position;
              
              //var currFacing = thug1.find('Enemy').facing;
              
              /*if(thugPos[0] < -10 && currFacing === -1){
                  thug1.find('Enemy').setFacing(1);
               }
               else if( thugPos[0] > 10 && currFacing === 1){
                 thug1.find('Enemy').setFacing(-1);
               }*/
                              
              //
              if(keyStates[keyConfig.RIGHT_KEY] && keyStates[keyConfig.JUMP_KEY]){
                console.log('forward jump');
                //player1.find('Player').onRightJump();
              }
              else if (keyStates[keyConfig.LEFT_KEY] && keyStates[keyConfig.JUMP_KEY]){
                //state.backwardJump && state.backwardJump();
              }
              // Don't move the user if they're trying to move in both directions.
              else if (keyStates[keyConfig.RIGHT_KEY] && keyStates[keyConfig.LEFT_KEY]) {
                // player doesn't have an onidle
                // player1.find('Player').onIdle();
                console.log('f');
                //player1.find('Body').onMoveStop({data:{direction:"left"}});
                //player1.find('Body').onMoveStop({data:{direction:"right"}});
              }
              // Move them right if released the right key.
              else if (keyStates[keyConfig.RIGHT_KEY]) {
                //player1.find('Body').onMoveStart({data:{direction:"right"}});
                // playerState.onMoveForward();
                // player1.find('Player').onStartMoveRight();
              }
              // Move them left if they released the left key.
              else if (keyStates[keyConfig.LEFT_KEY]) {
               // player1.find('Body').onMoveStart({data:{direction:"left"}});
                // playerState.onMoveForward();
                // player1.find('Player').onStartMoveLeft();
              }
              // 
              else if (keyStates[keyConfig.JUMP_KEY]) {
  //              console.log('straight jump');
                //player1.find('Player').onJump();
              }
              else{
                //player1.find('Body').onMoveStop({data:{direction:"left"}});
                //playerState.onIdle();
              }
            }
          });

          // Start the engine!
          engine.run();
        };


      ////////////////
      // Load some sprites
      ////////////////
      viking.loadSprite('./sprites/thug1.sprite', {});
      viking.loadSprite('./sprites/kraddy.sprite',{});
      viking.loadSprite('./sprites/thug2.sprite', {});
      viking.loadSprite('./sprites/thug3.sprite', {});
      viking.loadSprite('./sprites/thug4.sprite', {});
      viking.loadSprite('./sprites/thug5.sprite', {});

      engine.core.resource.get([
      {
        type: engine.core.resource.Collada,
        url: "city/intro_city-anim.dae",
        load: colladaLoader,
        onsuccess: function (instance) {
          space = instance.space;
        },
        onfailure: function (error) {
          console.log("error loading collada resource: " + error);
        }
      }, {
        type: engine.graphics.resource.Mesh,
        url: 'procedural-mesh.js',
        load: engine.core.resource.proceduralLoad,
        onsuccess: function (mesh) {
          resources['mesh'] = mesh;
        },
        onfailure: function (error) {}
      }, {
        type: engine.graphics.resource.Material,
        url: 'procedural-material.js',
        load: engine.core.resource.proceduralLoad,
        onsuccess: function (material) {
          resources['material'] = material;
        },
        onfailure: function (error) {}
      },
      ], {
        oncomplete: run
      });
    };

  gladius.create({
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
        options: {}
      },
      logic: 'logic/game/service'
    }
  }, game);

});