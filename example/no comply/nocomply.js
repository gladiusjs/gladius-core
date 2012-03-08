
var yvel = 0;
var a = 0;
var vel = 0;
var rrr = 0;
var aaa = false;
var testCube;
var testState = 0;
var shake = 0;
/**
  Simple fighting game based on the "No Comply" WebGL video.

  TODO:
  - add collision detection
  - add material for p2 fireball
  - fix fireball logic
  
  - Bug: user needs to hold down 'down' to make sure char crouches as soon as they hit the floor.
  -

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
    
      const FACING_RIGHT = -1;
      const FACING_LEFT   = 1;

      const LEFT_BORDER = 70;
      const RIGHT_BORDER = -30;
      const MOVE_SPEED = 15;
      
      const FLOOR_POS = 9.9;
      const GRAVITY = 0.98;
      const JUMP_HEIGHT = 45;
      
      //
      const WALK_ANI_SPEED = 0.085;
      const PUNCH_DURATION   = 0.12;
      const THROW_FIREBALL_DURATION = 0.5;
      
      // Time needed to walk backwards before throwing fireball
      const FIREBALL_WAIT = 1.0;
      const FIREBALL_SPEED = 0.8;
      
      var MAX_HEALTH = 500;
      
      //////////////////
      // Player config
      /////////////////
      
      // Player 1 starts on the left side of the screen facing right
      var playerOneConfig = {
        RIGHT_KEY:  'RIGHT',
        LEFT_KEY:   'LEFT',
        JUMP_KEY:   'UP',
        DOWN_KEY:   'DOWN',
        PUNCH_KEY:  'A',
        name:       'player1',
        dir:        FACING_RIGHT,
        initialPos: [-20, FLOOR_POS, 0]
      };

      // Player 2 starts on the right side of the screen facing left
/*      var playerTwoConfig = {
        RIGHT_KEY:  'L',
        LEFT_KEY:   'J',
        JUMP_KEY:   'I',
        DOWN_KEY:   'K',
        PUNCH_KEY:  'U',
        name:       'player2',
        dir:        FACING_LEFT,
        initialPos: [-50, 9.9 , 20 ]
      };
*/
      
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

      var space;
      var math = engine.math;







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
                
                /// XXXX fix
                this.midPoint =  [
(                  this.upperRight[0] - this.lowerLeft[0])/2,
                  0,
 (                 this.upperRight[2] - this.lowerLeft[2])/2,
                ]

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
                                        test: component1.owner
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
      * XXX need to actually use this
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
      *
      */
      var StateComponent = engine.base.Component({
        type: 'State'
        },
        
        function( options ){
          options = options || {};
          var that = this;
          
          var service = engine.logic;

          // Idle State - Player is just standing there.
          var IdleState = (function () {
            function IdleState(player) {
              var pl = player;

              this.moveForward = function (){ pl.setState(pl.getMoveForwardState());};
              this.jump = function () {       pl.setState(pl.getJumpState());};
              this.moveForward = function(){  pl.setState(pl.getMoveForwardState());};
              this.crouch = function(){       pl.setState(pl.getCrouchState());};
              this.spinKick = function(){     pl.setState(pl.getSpinKickState());};
              
              this.hit = function(d){
                pl.health -= d;
                
                if(pl.health <= 0){
                  this.knockOut();
                }
              }

              this.update = function (event) {
                pl.owner.find('Model').updateAction('idle');
                
//                pl.player.position;
                
                var test = pl.getPlayer().speed;
                test[0] = 0;
                pl.getPlayer().position = test;
                
                
                // ??
              //  if(pl.speed[1] === 0){
                //  pl.speed[0] = 0;
               // }
                // XXX
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
              this.idle = function () {   pl.setState(pl.getIdleState());};
              this.jump = function () {   pl.setState(pl.getForwardJumpState());};
              this.spinKick = function(){ pl.setState(pl.getSpinKickState());};

              this.onActivate = function(){
                timer = 0;
              };

              this.update = function (event) {
                var delta = service.time.delta / 1000;
                
                pl.owner.find('Model').updateAction('walk');
                pl.owner.find('Player').speed[0] = MOVE_SPEED;
                
                timer += delta;

                if(timer >= WALK_ANI_SPEED){
                  timer = 0;
                  pl.owner.find('Model').updateAction('walk');
                }                
              };
            }

            return MoveForwardState;
          }());

          // CrouchState - Player is crouching
          var CrouchState = (function () {
            function CrouchState(player) {
              var pl = player;

              // State transitions
              this.idle = function () {   pl.setState(pl.getIdleState());};
              
              this.activate = function(){
//                pl.owner.find('Player').
              };
              
              this.update = function (event) {
                pl.owner.find('Model').updateAction('crouch');                
              };
            }
            return CrouchState;
          }());

          // JumpState - Allows player to jump straight up
          var JumpState = (function () {
            function JumpState(player) {
              var pl = player;
              var timeElapsed = 0;

              this.update = function (event) {
                var delta = service.time.delta / 1000;
                        
                timeElapsed += delta;
                var pp = pl.owner.find('Transform').position;
                
                // only do the check if he left the floor, otherwise
                // the test will pass as soon as the jump starts.
                if(pp[1] <= FLOOR_POS && timeElapsed > 0.5){
                  pl.setState(pl.getIdleState());
                }
              };
              
              this.activate = function(){
                timeElapsed = 0;

                pl.owner.find('Player').speed[1] = JUMP_HEIGHT;
                pl.owner.find('Model').updateAction('jump');
                
                //if(blah[1] === 0){
                //  blah[1] = JUMP_HEIGHT;
                //}                
              //pl.speed[0] = 0;
             // if(pl.speed[1] === 0){
              //  pl.speed[1] = JUMP_HEIGHT;
              //}
              }
            }
            return JumpState;
          }());
          
          // SpinKickState - 
          var SpinKickState = (function () {
            function SpinKickState(player) {
              var pl = player;
              var timeElapsed = 0;

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
                rrr = true;
                pl.owner.find('Model').updateAction('twirl-kick');
              }
            }
            return SpinKickState;
          }());



          // Forward Jump State
          var ForwardJumpState = (function () {
            function ForwardJumpState(player) {
              var pl = player;
              var timeElapsed = 0;
              
              function standStraight(){
               // var test = pl.trans.rotation;
               // test[2] = 0;
               // pl.trans.rotation = test;
              }
              
              /*this.hit = function(d){
                pl.health -= d;
                
                //
                standStraight();
                pl.setState(pl.getFallingDownState());
              };*/
              
              this.activate = function(){              
                timeElapsed = 0;
                pl.owner.find('Model').updateAction('jump');
                
                pl.owner.find('Player').speed[1] = JUMP_HEIGHT;
                                        
               // if(pl.speed[1] === 0){
                //  pl.speed[1] = JUMP_HEIGHT;
               // }
              };
              
              this.update = function () {
                var delta = service.time.delta / 1000;
                
                timeElapsed += delta;
                
                //var pp = pl.owner.find('Transform').position;
                var pos = pl.getTransform().position;
                if(pos[1] <= FLOOR_POS && timeElapsed > 0.5){
                  pl.setState(pl.getIdleState());
                }
                
                var rot = pl.getTransform().rotation;
                //rot[2] = pos[1]/JUMP_HEIGHT * math.PI*5;
//                rot[2] += delta * math.TAU;
                //delta * math.TAU/ JUMP_HEIGHT;
                pl.getTransform().rotation = rot;

                //var rot = pc.rotation;
                //rot[2] += t * math.TAU;
                //pc.rotation = rot;
                
                if(pos[1] <= FLOOR_POS && timeElapsed > 0.5){
                 // standStraight();
                  rot[2] = 0;
                  pl.getTransform().rotation = rot;                  
                  pl.setState(pl.getIdleState());
                }
              };
            }
            return ForwardJumpState;
          }());





          // instances of all the state
          var idleState = new IdleState(this);
          var jumpState = new JumpState(this);
          var moveForwardState = new MoveForwardState(this);
          var forwardJumpState = new ForwardJumpState(this);
          var crouchState = new CrouchState(this);
          var spinKickState = new SpinKickState(this);
          var state = idleState;
          
          this.getPlayer = function(){
            return this.owner.find('Player');
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
          
          this.onJump = function(){         state.jump && state.jump();}
          this.onIdle = function(){         state.idle && state.idle();}
          this.onMoveForward = function(){  state.moveForward && state.moveForward();}
          this.onCrouch = function(){       state.crouch && state.crouch();}
          this.onPunch = function(){        state.punch && state.punch();}
          this.onSpinKick = function(){     shake =200; state.spinKick && state.spinKick();};
          
          //this.onStopMoveForward = function(){
          //  state = (state === moveForwardState) ? idleState : state;
          //}

          this.getJumpState = function(){return jumpState;}
          this.getIdleState = function(){return idleState;}
          this.getMoveForwardState = function (){return moveForwardState;};
          this.getForwardJumpState = function(){return forwardJumpState;};
          this.getCrouchState = function(){     return crouchState;};
          this.getSpinKickState = function(){     return spinKickState;}; 
          
          this.getCurrState = function(){
            if(state === spinKickState){
              return "test";
            }
            return "asdf";
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
      // BoxComponent
      ////////////////////
      var BoxComponent = engine.base.Component({
        type: 'Box',
        depends: ['Transform', 'Model']
      },
      function (options) {
      
        options = options || {};
        var that = this;
        
        // This is a hack so that this component will have its message queue processed
        var service = engine.logic; 
        
        var didCollide = false;
        this.velocity = [0, 0, 0];
        this.acceleration = [0, 0, 0];

        this.onCollision = function(e){
        
          if(e.data.entity.find('State')){
          var playerState = e.data.entity.find('State').getCurrState();
          var playerTrans = e.data.entity.find('Transform');

          // XXX move this out
          if(playerState === "test"){
            console.log(playerState);
            this.velocity = [0, 100, -10];
            this.acceleration[1] = 9.8 * 80;
          }
          else if(playerState === "asdf"){
            e.data.entity.find('Transform').position = [-4, FLOOR_POS, 0];
          }
          }
        };
        
        this.onUpdate = function (event) {
          var delta = service.time.delta / 1000;
          
          var trans = this.owner.find('Transform').position;

          trans[0] += this.velocity[0] * delta;
          trans[1] += this.velocity[1] * delta;
          trans[2] -= this.velocity[2] * delta;
          
          this.velocity[1] -= this.acceleration[1] * delta;
          
          this.owner.find('Transform').position = trans;
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
      }); // BoxComponent
      




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
        
        // This is a hack so that this component will have its message queue processed
        var service = engine.logic; 
        
        this.initialPos = options.initialPos || [0,0,0];
        
        this.onCollision = function(e){
          var state = this.owner.find('State');

      if(state.getCurrState() === "test"){
      }
//                  console.log(   state);
        };
        
//        var state = this.owner.find('State');
        
  //      this.onJump = function (event) {
//          this.owner.find('State').jump();        
          //state.jump && state.jump();
    //    };
        
        this.health = MAX_HEALTH;
        var playerName = options.name || "NoName";
        this.dir = options.dir;
        this.speed = [0, 0];
        
        // XXX
        this.name = playerName;
        
        // for fireballs
        this.timeWalkingBK = 0;
                            


        //
        this.isKnockedOut = function(){
          return this.health <= 0;
        }
        
        //
        this.stayInBounds = function(pos){
          if(pos[2] > LEFT_BORDER){
      //      pos[2] = LEFT_BORDER;
          }
          if(pos[2] < RIGHT_BORDER){
//            pos[2] = RIGHT_BORDER;
          }

          if(pos[1] <= FLOOR_POS){//JUMP_HEIGHT) {
            pos[1] = FLOOR_POS;
            this.speed[1] = 0;
          }
        }

/*
        this.setState = function (s) {
          if(state !== s){
            console.log('State changed: ' + s.toString());
            state = s;
            state.onActivate && state.onActivate();
          }
        };
        
        this.setFacing = function(d){
          this.dir = d;
        }
        
        this.onStartMoveForward = function (event) {
          state.moveForward && state.moveForward();
        };
        this.onStopMoveForward = function (event) {
          state = (state === moveForwardState) ? idleState : state;
        };
        this.onStartMoveBackward = function (event) {
          state.moveBackward && state.moveBackward();
        };
        this.onStopMoveBackward = function (event) {
          state = (state === moveBackwardState) ? idleState : state;
        };
        this.onStartBlock = function (event) {
          state.block && state.block();
        };
        this.onStopBlock = function (event) {
           state.idle && state.idle();
        };
                
        var punchP = false;
        
        this.onPunchReleased = function(){
          punchP = false;
        };
        
        this.onPunch = function (event) {
          if(!punchP){
            state.punch && state.punch();
            punchP = true;
          }
        };*/
        
        //
        this.resetPlayer = function(){
          this.health = MAX_HEALTH;
         // state = idleState;
          this.owner.find('Transform').position = this.initialPos;
        };
        
       /* this.onKick = function (event) {
          state.kick && state.kick();
        };

        
        // XXX broken
        this.onKnockOut = function(event){
          state.hit && state.hit(10000);
          //state.knockOut && state.knockOut();
        };
        // XXX get damage from event
        this.onHit = function(event){
          state.hit && state.hit(25);
        };
        this.onKill = function (event) {
          state.dead && state.dead();
        };
        this.onSpin = function (event) {
          state.spin && state.spin();
        };*/
        
        // XXX
        var trans;

        // XXX fix me
        this.getPlayer = function () {
          return player;
        }

        this.onUpdate = function (event) {
          var delta = service.time.delta / 1000;

          
          // XXX Move this out
          if(document.getElementById(playerName)){

            // If health is zero, we only see the ugly border around the
            // health bar, so just hide it in that case.
            var show = this.health > 0 ? "visible" : "hidden";
            document.getElementById(playerName).style.visibility = show;
            
            // allow some buffer 
            // XXX comment
            var halfClientAreaWidth = (window.innerWidth-150)/2;
            var normalizedHealth = this.health/MAX_HEALTH;
            var final = normalizedHealth * halfClientAreaWidth;
            
            document.getElementById(playerName).style.width = final + "px";
          }
          
          // XXX
          var transform = this.owner.find('Transform');

          this.trans = this.owner.find('Transform');
          this.model = this.owner.find('Model');
          var state = this.owner.find('State');

            //this.ownder.find('State').update(delta);
        //  state.update(delta, transform, this.model);
                    
          var pos = transform.position;
          
          // XXX
          this.speed[1] -= GRAVITY * 100 * delta;
          
          pos[1] += this.speed[1] * delta;
          pos[0] += this.speed[0] * delta;
          this.stayInBounds(pos);
          
          transform.position = pos;
          
          if(this.dir === FACING_RIGHT){
//            var temp = this.owner.find('Transform').rotation;
  //          temp[1] = math.PI/2;
    //        this.owner.find('Transform').rotation = temp;
          }
          else{
      //      var temp = this.owner.find('Transform').rotation;
        //    temp[1] = -math.PI/2;
          //  this.owner.find('Transform').rotation = temp;
          }
          
          
          
        
          // XXX fix direction
          if (keyStates[options.RIGHT_KEY] && keyStates[options.JUMP_KEY]){
            state.forwardJump && state.forwardJump();
          }
          else if (keyStates[options.LEFT_KEY] && keyStates[options.JUMP_KEY]){
            state.backwardJump && state.backwardJump();
          }

          // Don't move the user if they're trying to move in both directions.
          else if (keyStates[options.RIGHT_KEY] && keyStates[options.LEFT_KEY]) {state.onIdle();}

          // Move them right if released the right key.
          else if (keyStates[options.RIGHT_KEY]) {state.onMoveForward();}

          // Move them left if they released the right key.
          else if (keyStates[options.LEFT_KEY]) {
             //fix on state.moveBackward && state.moveBackward();
          }

          // 
          else if (keyStates[options.JUMP_KEY]) {state.onJump();}
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
          // Player 1
          ////////////
          var player1 = new space.Entity({
            name: 'player1',
            components: [
            
            // Model
            new engine.core.component.Transform({
              /// XXX use initial pos
              position: math.Vector3(-5, FLOOR_POS, 0),
              rotation: math.Vector3(0, 0, 0),
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
                keyStates[keyName] = (e.data.state === 'down');

                switch (e.data.code) {

                  // walk right
                case 'RIGHT':
                  new engine.core.Event({
                  //////!!!!fix!!
                    type: e.data.state === 'down' ? 'MoveForward' : 'Idle'
                  }).dispatch([this.owner]);
                  break;

                  // walk left
                case 'LEFT':
                  new engine.core.Event({
                    type: e.data.state === 'down' ? 'StartMoveBackward' : 'StopMoveBackward'
                  }).dispatch([this.owner]);
                  break;

                  // jump
                case 'UP':
                  new engine.core.Event({
                    type: e.data.state === 'down' ? 'Jump' : null
                  }).dispatch([this.owner]);
                  break;

                  // Block
                case 'DOWN':
                  new engine.core.Event({
                    type: e.data.state === 'down' ? 'Crouch' : 'Idle'
                  }).dispatch([this.owner]);
                  break;

                case 'A':
                  new engine.core.Event({
                    type: e.data.state === 'down' ? 'Punch' : null
                  }).dispatch([this.owner]);
                  break;

                  // Spin player
                case 'W':
                  new engine.core.Event({
                    type: e.data.state === 'down' ? 'SpinKick' : null
                  }).dispatch([this.owner]);
                  break;
                  
                // XXX Test code
                case '0':
                  new engine.core.Event({
                    type: 'KnockOut'
                    }).dispatch([this.owner]);
                  break;
                  
                // XXX Test code
                case '5':
                  new engine.core.Event({
                    type: e.data.state === 'down' ? 'Hit' : null
                    }).dispatch([this.owner]);
                  break;
                  
                  // Kill player
                /*case 'X':
                  new engine.core.Event({
                    type: 'Kill'
                  }).dispatch([this.owner]);
                  break;*/

                } // switch
              } // onKey
            }), //controller
            
            
            new PlayerComponent(playerOneConfig),
            
            new StateComponent(), 
            
            new collision2Service.component.BoundingBox({
                lowerLeft: math.Vector3( -2, -3,  0),
                upperRight: math.Vector3( 0.5,  2,  0 )
            })
            ]
          });




      for(var i = 0; i < 20; i++){

           new space.Entity({
                name: 'cube' + i,
                components: [
                    new engine.core.component.Transform({
                        position: math.Vector3( i * 12, FLOOR_POS-3, 0 ),
                        rotation: math.Vector3( 0, 0, 0 ),
                      //  scale: math.Vector3( 0.8, 5, 2)
                    }),
                    
                    new engine.graphics.component.Model({
                        mesh: resources.mesh,
                        material: resources.material
                    }),
                    
                    new BoxComponent(),
                    
                    new collision2Service.component.BoundingBox({
                        lowerLeft: math.Vector3(  -1, -1, 0 ),
                        upperRight: math.Vector3(  1,  1, 0 )
                    })
                    ]
            }); 
            }
          
          
          

           new space.Entity({
                name: 'cube' + i,
                components: [
                    new engine.core.component.Transform({
                        position: math.Vector3( i * 15, FLOOR_POS-3, 0 ),
                        rotation: math.Vector3( 0, 0, 0 ),
                      //  scale: math.Vector3( 0.8, 5, 2)
                    }),
                    
                    new engine.graphics.component.Model({
                        mesh: resources.mesh,
                        material: resources.material
                    }),
                    
                    new BoxComponent(),
                    
                    new collision2Service.component.BoundingBox({
                        lowerLeft: math.Vector3(  -1, -1, 0 ),
                        upperRight: math.Vector3(  1,  1, 0 )
                    })
                    ]
            }); 
             
/*
           new space.Entity({
                name: 'cube1',
                components: [
                    new engine.core.component.Transform({
                        position: math.Vector3( 16, FLOOR_POS-3, 0 ),
                        rotation: math.Vector3( 0, 0, 0 ),
                      //  scale: math.Vector3( 0.8, 5, 2)
                    }),
                    
                      new engine.graphics.component.Model({
                        mesh: resources.mesh,
                        material: resources.material
                    }),
                    
                    new BoxComponent(),
                            
                    new collision2Service.component.BoundingBox({
                        lowerLeft: math.Vector3( -1, -1, 0 ),
                        upperRight: math.Vector3( 1,  1, 0 )
                    })
                    ]
            }); 
            */


          var camera = new space.Entity({
            name: 'camera',
            components: [
            new engine.core.component.Transform({
              position: math.Vector3(0, 15, 20)
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

          // XXX the animation time is totally random.  It should actually
          // be something sane, probably picked to interact with the
          // simulationTime.delta and then that as well as the speed
          // that the spritesheet includes factored in.  I suspect this code
          // is gonna want some optimization too.
          // var animationTime = 25;
          // var animationTimer = 0;

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
              
             /* if(testCube){
              
              
if(rrr){
  vel = 25;
  yvel = 45;

  aaa = true;
  a = 9.8;
  rrr= false;
}

if(aaa){ 
  yvel -= a*a * delta;
  // console.log(vel);
}

var cubePos = testCube.find('Transform').position;
cubePos[2] -= vel * delta;
cubePos[1] += yvel*1.4 * delta;
cubePos[0] += vel/2 * delta;
testCube.find('Transform').position = cubePos;
              
              //  var cubePos = testCube.find('Transform').position;
                
               // var rot = testCube.find('Transform').rotation;
                
              //  rot[0] += delta;
               // rot[1] += delta;
               // rot[2] += delta;

                
               // cubePos[2] -= velocity + (9.8*9.8* delta);
               // cubePos[1] += 15 * delta;
                //cubePos[0] += 15 * delta;
               
               //  testCube.find('Transform').position = cubePos;
                }*/

               // if(cubePos[2] > 30){
               //   cubePos[2] = -10;
              //  }

               // testCube.find('Transform').position = cubePos;
              
              
              // Player components
              var p1Com = player1.find('Player');
//              var p2Com = player2.find('Player');
              
              var p1Pos = player1.find('Transform').position;
//              var p2Pos = player2.find('Transform').position;
              
              var p1Xpos = p1Pos[2];
//              var p2Xpos = p2Pos[2];
              
              var p1Div = getById('player1');
//              var p2Div = getById('player2');
                
              //
            //  if( p1Xpos < p2Xpos ){
              //  p1Com.setFacing(FACING_LEFT);
//                p2Com.setFacing(FACING_RIGHT);
                // XXX fix this
//                getById('player2').id = 'temp';
  //              getById('player1').id = 'player2';
    //            getById('temp').id = 'player1';
            //  }
            // // else{
                //p1Com.setFacing(FACING_RIGHT);
  //              p2Com.setFacing(FACING_LEFT);                
                // XXX why isn't this necessary?
                //getById('player1').id = 'temp';
                //getById('player2').id = 'player1';
                //getById('temp').id = 'player2';
             // }
              
              // XXX fix me
              p1Div = getById('player1');
//              p2Div = getById('player2');
              
            /*  if( p1Xpos < p2Xpos ){
                p1Div.style.backgroundColor = "green";
             //  p2Div.style.backgroundColor = "orange";   
              }
              else{
                p1Div.style.backgroundColor = "orange";
            //    p2Div.style.backgroundColor = "green";                
              }*/
                                
              // XXX fix this
//              var midPoint = (p1Pos[2] + p2Pos[2])/2;
              var newPos = camera.find('Transform').position;
              newPos[0] = p1Pos[0];
              camera.find('Transform').position = newPos;
              
              camera.find('Camera').target = math.Vector3(newPos[0], 10, -1);
           
              //math.Vector3(-60, 10, midPoint);
                              
              // XXX fix this
              //var diff = Math.abs(p1Xpos - p2Xpos);
              
              //if(diff > 20){
              //  newPos[0] = -33 - (20 - diff);
              //}
              var testPos = p1Pos;
              testPos[0] += 20;
              testPos[1] = 20 + (Math.cos(shake)*3);
             // testPos[2] +=  (Math.cos(shake+5)*3);
              
                 //shake /= 1.5;

              
              //camera.find('Transform').position = testPos;
              
              // XXX fix this
/*              if( p1Com.isKnockedOut() && p2Com.isKnockedOut()){ 
                //console.log('Double KO');
              }
              else if(p1Com.isKnockedOut()){
                //console.log('P2 wins');
              }
              else if(p2Com.isKnockedOut()){
                //console.log('P1 wins');
              }
              
              if(p1Com.isKnockedOut() || p2Com.isKnockedOut()){
                restartGame();
              }*/
            }
          });

          //  var player1 = space.find('player1').find('Player').getPlayer();
          // If player1 is punching and player2 can get hit and player1's hitbox intersects player2's
          // if (..)
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
      }
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