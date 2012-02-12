/**
  Simple fighting game based on the "No Comply" WebGL video.
*/
document.addEventListener("DOMContentLoaded", function (e) {

  var canvas = document.getElementById("test-canvas");
  var resources = {};

  // XXX fix me
  var thugAction = 'idle';

  //
  var game = function (engine) {
    
      const FACING_RIGHT = -1;
      const FACING_LEFT   = 1;

      //////////////////
      // Player config
      /////////////////
      
      // Player 1 starts on the left side of the screen facing right
      var playerOneConfig = {
        RIGHT_KEY:  'RIGHT',
        LEFT_KEY:   'LEFT',
        JUMP_KEY:   'UP',
        CROUCH_KEY: 'DOWN',
        name:       'player1',
        dir:        FACING_RIGHT
      };

      // Player 2 starts on the right side of the screen facing left
      var playerTwoConfig = {
        RIGHT_KEY:  'L',
        LEFT_KEY:   'J',
        JUMP_KEY:   'I',
        CROUCH_KEY: 'K',
        name:       'player2',
        dir:        FACING_LEFT
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

      var space;
      var math = engine.math;

      const LEFT_BORDER = 60;
      const RIGHT_BORDER = 10;
      const MOVE_SPEED = 15;
      
      const FLOOR_POS = 9.9;
      const GRAVITY = 0.98;
      const JUMP_HEIGHT = 45;
      
      //
      const WALK_ANI_SPEED = 0.085;
      const PUNCH_DURATION   = 0.425;
      const THROW_FIREBALL_DURATION = 0.5;
      
      // Time needed to walk backwards before throwing fireball
      const FIREBALL_WAIT = 1.0;
      const FIREBALL_SPEED = 0.8;
      
      // Global state of the keyboard.
      var keyStates = [];

      ///////////////
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


      //////////
      // Health Component
      //////////
      var HealthComponent = engine.base.Component({
        type: 'Health'
        }, function( options ){
          
          options = options || {};
          
          var service = engine.logic;          
          var val = 500;
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



      // PlayerComponent
      var PlayerComponent = engine.base.Component({
        type: 'Player',
        depends: ['Transform', 'Model']
      }, function (options) {
        options = options || {};
        var that = this;
        
        //////////////////////
        // Character states
        //////////////////////
        
        /**
        *
        *
        */
        var IdleState = (function () {

          function IdleState(player) {
            var pl = player;

            this.moveForward = function () {pl.setState(pl.getMoveForwardState());};
            this.moveBackward = function () {pl.setState(pl.getMoveBackwardState());};
            this.jump = function () {pl.setState(pl.getJumpState());};
            this.idle = function () {};
            this.block = function () {pl.setState(pl.getBlockState());};
            this.punch = function () {pl.setState(pl.getPunchState());};
            //this.kick = function () {pl.setState(pl.getKickState());};
            this.throwFireBall = function () {pl.setState(pl.getThrowFireBallState());};
            this.spin = function () {pl.setState(pl.getSpinState());};
            //this.dead = function () {pl.setState(pl.getDeadState());}
            this.knockOut = function(){pl.setState(pl.getKnockedOutState());};
            
            this.forwardJump = function () {  pl.setState(pl.getForwardJumpState());};
            this.backwardJump = function (){  pl.setState(pl.getBackwardJumpState());};

            this.hit = function(){
              pl.health -= 15;
              
              if(pl.health <= 0){
                this.knockOut();
              }
            }

            this.update = function (t, pc, m) {
              m.updateAction('idle');
              
              if(pl.speed[1] === 0){
                pl.speed[0] = 0;
              }
              // XXX
              // When the character is idle, we may want to switch between
              // two images so they don't look so static.
            };

            this.toString = function () {
              return "Idle State";
            };
          }

          return IdleState;
        }());


        /**
        *
        * Sprite jumps and can't block, then is hit and goes into this state.
        *
        */
        var FallingDownState = (function () {

          function FallingDownState(player) {
            var pl = player;

            // XXX Can this happen?
            this.hit = function(){
            };

            this.update = function (t, pc, m) {
              pl.model.updateAction('falling-down');              
              
              // XXX
              if(pl.speed[1] === 0){
                //pl.speed[0] = 0;
              }
              
              // XXX if alrady jumping back, do we puch them back farther?
              pl.speed[0] = 15 * pl.dir;
              
              if(pc.position[1] <= FLOOR_POS){
              
                // Once the player lands, find out if they just died
                if(pl.health <= 0){
                  pl.setState(pl.getKnockedOutState());
                }
                else{
                  pl.setState(pl.getIdleState());
                }
              }
            };

            this.toString = function () {
              return "Idle State";
            };
          }

          return FallingDownState;
        }());


        /**
        *
        * Character is spinning around and can get hit by the other player.
        *
        */
        var SpinState = (function () {

          function SpinState(player) {

            var pl = player;
            var timeElapsed = 0;

            //this.dead = function () {
              //pl.setState(pl.getDeadState());
            //};
            
            // XXX
            this.hit = function(){};
            
            this.onActivate = function(){
              timeElapsed = 0;
            };

            // Should we slow down the character?
            this.update = function (t, pc, m) {
              //pl.aniState = 'idle';
              //pl.trans.position;
              
              timeElapsed += t;
              var rot = pc.rotation;

              // rotate the sprite very fast          
              if (timeElapsed < 2) {              
                var a = pl.trans;
                a.rotation[1] += 1;
                console.log(a[1]);
                //  rot[1] += 15;
                pl.trans = a;
                //pc.rotation = rot;
              }
              else {
                timeElapsed = 0;

                // re-orient the character
                rot[1] = 3.14159/2;
                pc.rotation = rot;

                pl.setState(pl.getIdleState());
              }
            };

            this.toString = function () {
              return "Spin State";
            };
          }

          return SpinState;
        }());

        /**
          Character is frozen and can get hit by the other player.
        */
        var FrozenState = (function () {

          function FrozenState(player) {

            var pl = player;
            var timeElapsed = 0;

            //this.dead = function () {
              //pl.setState(pl.getDeadState());
            //}

            // Should we slow down the character?
            this.update = function (t, pc) {
              timeElapsed += t;
            };

            this.toString = function () {
              return "Frozen State";
            };
          }

          return FrozenState;
        }());

        /**
          Users can't transition to another state from the dead state.
        */
        /*var DeadState = (function () {

          function DeadState(player) {
            var pl = player;

            this.update = function (t, pc) {
              //pl.aniState = 'knock-down';
            };

            this.toString = function () {
              return "Dead State";
            };
          }

          return DeadState;
        }());*/


        /**
        *
        * Users can't transition to another state from the dead state.
        *
        */
        var KnockedOutState = (function () {
          
          function KnockedOutState(player) {
            var pl = player;
            
            this.onActivate = function(){
              pl.model.updateAction('knocked-out');
            }
            
            this.update = function (t, pc) {
              pl.speed[0] = 0;
            };

            this.toString = function () {
              return "Knocked Out State";
            };
          }

          return KnockedOutState;
        }());


        /**
        *
        *  Blocking
        *
        */
        var BlockState = (function () {

          function BlockState(player) {
            var pl = player;

            this.idle = function () {
              pl.setState(pl.getIdleState());
            };
            
            // XXX should this method exist?
            this.knockOut = function(){
              pl.setState(pl.getKnockedOutState());
            }
            
            // Since sprite is blocking, only take a bit of the damage.
            this.hit = function(d){
              pl.health -= d/3;
              if(pl.health <= 0){
                this.knockOut();
              }
            };
            
            /*this.dead = function () {
              pl.setState(pl.getDeadState());
            }*/

            this.onActivate = function(){
              pl.model.updateAction('block');
              pl.speed[0] = 0;
            };
            
            this.update = function (t) {
            };

            this.toString = function () {
              return "Block State";
            };
          }

          return BlockState;
        }());


        /**
        *
        *
        */
        var ThrowFireBallState = (function () {

          function ThrowFireBallState(player) {
            var pl = player;
            var timeElapsed = 0;

            // Sprite can still get hit by a fireball.
            this.hit = function(d){
              pl.health -= d;
              if(pl.health <= 0){
                pl.setState(pl.getKnockedOutState());
              }
            };
            
            this.onActivate = function() {
          
              pl.timeWalkingBK = 0;
              // Reuse the punch animation because we're cheap.
              pl.model.updateAction('punch');
              timeElapsed = 0;
              
              // Sprite can't move when they're throwing a fireball.
              pl.speed[0] = 0;
              
              var pos = pl.trans.position;
              //   var pos = [pl.position[0], pl.position[1], pl.position[2]];
              // XXX
              var dir = pl.dir;

              // Add owner to fireball
              new space.Entity({
                  name: 'fireball',
                  components: [
                    new engine.core.component.Transform({
                      position: math.Vector3( pos[0], pos[1], pos[2] ),
                      rotation: math.Vector3( 0, 0, 0 ),
                      scale: math.Vector3(1.5, 1.5, 1.5)
                    }),
                    new engine.graphics.component.Model({
                      mesh: resources.mesh,
                      material: resources.material
                    }),
                    new FireBallComponent({position:pos, direction: dir})
                  ]
                });
            };
            
            this.spin = function () {
              pl.setState(pl.getSpinState());
            };

            this.update = function (t, pc) {
              timeElapsed += t;

              if (timeElapsed > THROW_FIREBALL_DURATION) {
                pl.setState(pl.getIdleState());
              }
            };

            this.toString = function () {
              return "Throw Fire Ball State";
            };
          }

          return ThrowFireBallState;
        }());

        /**
        *
        *
        */
        var PunchState = (function () {

          function PunchState(player) {
            var pl = player;
            var punchTimeElapsed = 0;

            // XXX
            // If a character is punching, can they be spun? Wouldn't the other sprite
            // run into the punch?
            // this.spin
            
            this.knockOut = function(){
              pl.setState(pl.getKnockedOutState());
            }
            
            // Sprite can still get hit by a fireball if punching
            this.hit = function(d){
              pl.health -= d;
              if(pl.health <= 0){
                this.knockOut();
              }
            }

            this.onActivate = function(){
            
              // Check to see if this is actually a fireball
              if(pl.timeWalkingBK >= FIREBALL_WAIT){
                pl.setState(pl.getThrowFireBallState());
              }
              else{
                pl.model.updateAction('punch');
                punchTimeElapsed = 0;
                pl.speed[0] = 0;
              }
            }

            this.update = function (t, pc) {
              punchTimeElapsed += t;
              
              if (punchTimeElapsed > PUNCH_DURATION) {
                pl.setState(pl.getIdleState());
              }
            };

            this.toString = function () {
              return "Punch State";
            };
          }

          return PunchState;
        }());

        /**
         */
        /*var KickState = (function () {

          function KickState(player) {
            var pl = player;
            var kickTimeElapsed = 0;

            this.dead = function () {
//              pl.setState(pl.getDeadState());
            }

            this.update = function (t) {
              // XXX
              //pl.aniState = 'kick';

              kickTimeElapsed += t;
              if (kickTimeElapsed > 0.5) {
                kickTimeElapsed = 0;
                pl.setState(pl.getIdleState());
              }
            };

            this.toString = function () {
              return "Kick State";
            };
          }

          return KickState;
        }());*/

        /**
        *
        *
        */
        var MoveForwardState = (function () {

          function MoveForwardState(player) {
            var pl = player;
            var timer = 0;

            this.moveForward = function () {/*console.log('already moving forward');*/};
            this.moveBackward = function () {/*console.log('already moving backward');*/};
            
            this.knockOut = function(){
              pl.setState(pl.getKnockedOutState());
            };
            
            this.hit = function(d){
              pl.health -= d;
              if(pl.health <= 0){
                this.knockOut();
              }
            };

            // XXX
            this.forwardJump = function () {
              pl.setState(pl.getForwardJumpState());
            };
            this.jump = function () {
              pl.setState(pl.getForwardJumpState());
            };
            this.idle = function () {
              pl.setState(pl.getIdleState());
            };
            this.block = function () {
              pl.setState(pl.getBlockState());
            };
            this.punch = function () {
              pl.setState(pl.getPunchState());
            };
            //this.kick = function () {
            //  pl.setState(pl.getKickState());
            //};
            this.throwFireBall = function () {
              pl.setState(pl.getThrowFireBallState());
            };
            this.dead = function () {
//              pl.setState(pl.getDeadState());
            };
            this.spin = function () {
              pl.setState(pl.getSpinState());
            };
            this.onActivate = function(){
              timer = 0;
            };

            this.update = function (t, pc, m) {
              pl.speed[0] = MOVE_SPEED;
              
              timer += t;
              
              if(timer >= WALK_ANI_SPEED){
                timer = 0;
                m.updateAction('walk');
              }
            };

            this.toString = function () {
              return "Move Forward State";
            };
          }

          return MoveForwardState;
        }());

        /**
         */
        var MoveBackwardState = (function () {

          function MoveBackwardState(player) {
            var pl = player;
            var timer = 0;

            this.moveForward = function () {};
            this.moveBackward = function () {};

            //this.knockOut = function(){
            //  pl.setState(pl.getKnockedOutState());
            //};
            
            this.hit = function(d){
              pl.health -= d;
              if(pl.health <= 0){
                pl.setState(pl.getKnockedOutState());
              }
            };

            this.jump = function () {
              pl.setState(pl.getBackwardJumpState());
            };
            this.idle = function () {
              pl.setState(pl.getIdleState());
            };
            this.block = function () {
              pl.setState(pl.getBlockState());
            };
            this.punch = function () {
              pl.setState(pl.getPunchState());
            };
            //this.kick = function () {
            //  pl.setState(pl.getKickState());
            //};
            this.throwFireBall = function () {
              pl.setState(pl.getThrowFireBallState());
            };
            this.spin = function () {
              pl.setState(pl.getSpinState());
            };

            this.dead = function () {
//              pl.setState(pl.getDeadState());
            }
            this.onActivate = function(){
              timer = 0;
              player.model.updateAction('walk');
            };
            this.update = function (t, pc, m) {
              timer += t;
              pl.timeWalkingBK += t;
              
              if(timer >= WALK_ANI_SPEED){
                timer = 0;
                m.updateAction('walk');
              }

              pl.speed[0] = -MOVE_SPEED;
            };

            this.toString = function () {
              return "Move Backward State";
            };
          }

          return MoveBackwardState;
        }());

        /**
          Player is recovering from being hit. At this point they just need to wait until
          the character gets back up.
        */
        var RecoverState = (function () {

          function RecoverState(player) {
            var pl = player;

            this.dead = function () {
//              pl.setState(pl.getDeadState());
            }

            this.update = function (t, pc) {
              //pl.aniState = 'hurt';
              // change sprite animation here of character getting back up.
            };

            this.toString = function () {
              return "Recover State";
            };
          }

          return RecoverState;
        }());


        /**
         */
        var JumpState = (function () {

          function JumpState(player) {
            var pl = player;
            var jumpTimeElapsed = 0;

            // XXX can they be spun?
            this.kick = function () {};
            
            this.onActivate = function(){
              jumpTimeElapsed = 0;
              pl.model.updateAction('jump');
              pl.speed[0] = 0;
              
              if(pl.speed[1] === 0){
                pl.speed[1] = JUMP_HEIGHT;
              }
            };
            
            this.hit = function(d){
              pl.health -= d;
              pl.setState(pl.getFallingDownState());
            };



//            this.dead = function () {
//              pl.setState(pl.getDeadState());
//            };

            this.update = function (t, pc, m) {
              jumpTimeElapsed += t;

              // only do the check if he left the floor, otherwise
              // the test will pass as soon as the jump starts.
              if(pc.position[1] <= FLOOR_POS && jumpTimeElapsed > 0.5){
                pl.setState(pl.getIdleState());
              }
            };

            this.toString = function () {
              return "Jump State";
            };

          }
          return JumpState;
        }());

        /**
        *
        *  Character walks forward and jumps
        *  
        */
        var ForwardJumpState = (function () {

          function ForwardJumpState(player) {
            var pl = player;
            var jumpTimeElapsed = 0;

            // XXX fix me
            this.kick = function () {};

            this.hit = function(d){
              pl.health -= d;
              pl.setState(pl.getFallingDownState());
            };
                        
            this.onActivate = function(){              
              jumpTimeElapsed = 0;
              pl.model.updateAction('jump');
              pl.speed[0] = MOVE_SPEED;
                                      
              if(pl.speed[1] === 0){
                pl.speed[1] = JUMP_HEIGHT;
              }
            };
            
            this.dead = function () {
//              pl.setState(pl.getDeadState());
            };
            

            this.update = function (t, pc, m) {
              jumpTimeElapsed += t;





              // XXX
              var test = pc.rotation;
              test[2] += t * math.TAU;
              test[0] += t * math.TAU;
              pc.rotation = test;
              
              if(pc.position[1] <= FLOOR_POS && jumpTimeElapsed > 0.5){
                //test[2] = 0
                //pc.rotation = test;
                pl.setState(pl.getIdleState());
              }
            };

            this.toString = function () {
              return "Forward Jump State";
            };

          }
          return ForwardJumpState;
        }());


        /**
        *
        * Character walks backward and jumps
        *
        */
        var BackwardJumpState = (function () {

          function BackwardJumpState(player) {
            var pl = player;
            var jumpTimeElapsed = 0;

            // XXX fix me
            this.kick = function () {};

            this.hit = function(d){
              pl.health -= d;
              pl.setState(pl.getFallingDownState());
            };

            this.onActivate = function(){
              pl.model.updateAction('jump');
              jumpTimeElapsed = 0;
              pl.speed[0] = -MOVE_SPEED;
                       
              if(pl.speed[1] === 0){
                pl.speed[1] = JUMP_HEIGHT;
              }
            };

            this.dead = function () {
//              pl.setState(pl.getDeadState());
            };

            this.update = function (t, pc, m) {
              jumpTimeElapsed += t;
              
              // XXX
              //var test = pc.rotation;
              //test[0] += t * math.TAU;
              //pc.rotation = test;
              
              if(pc.position[1] <= FLOOR_POS && jumpTimeElapsed > 0.5){
                //test[0] = 0
                //pc.rotation = test;
                pl.setState(pl.getIdleState());
              }
            };

            this.toString = function () {
              return "Backward Jump State";
            };

          }
          return BackwardJumpState;
        }());


        this.health = 500;
        var playerName = options.name || "NoName";
        this.dir = options.dir;
        this.speed = [0, 0];
        
        // XXX
        this.name = playerName;
        
        // for fireballs
        this.timeWalkingBK = 0;
        
        var idleState = new IdleState(this);
        var blockState = new BlockState(this);
        var jumpState = new JumpState(this);
        var punchState = new PunchState(this);
        //var kickState = new KickState(this);
        //var deadState = new DeadState(this);
        var recoverState = new RecoverState(this);
        var spinState = new SpinState(this);
        var frozenState = new FrozenState(this);
        var throwFireBallState = new ThrowFireBallState(this);
        var moveForwardState = new MoveForwardState(this);
        var moveBackwardState = new MoveBackwardState(this);
        var forwardJumpState = new ForwardJumpState(this);
        var backwardJumpState = new BackwardJumpState(this);
        var fallingDownState = new FallingDownState(this);
        
        var knockedOutState = new KnockedOutState(this);
                    
        // XXX rename to currentState
        var state = idleState;
        
        // convert to getters
        this.getIdleState = function () {     return idleState;  };
        this.getBlockState = function () {    return blockState;  };
        this.getJumpState = function () {     return jumpState;  };
        this.getPunchState = function () {    return punchState;  };
        //this.getKickState = function () {     return kickState;  };  
        //this.getDeadState = function () {     return deadState;  };  
        this.getRecoverState = function () {  return recoverState;  }  
        this.getSpinState = function () {     return spinState;  };  
        this.getFrozenState = function () {   return frozenState;  };  
        this.getThrowFireBallState = function () {  return throwFireBallState;};  
        this.getMoveForwardState = function () {    return moveForwardState;  };  
        this.getMoveBackwardState = function () {   return moveBackwardState;  };  
        this.getForwardJumpState = function () {    return forwardJumpState;  };  
        this.getBackwardJumpState = function () {   return backwardJumpState };
        this.getFallingDownState = function() {     return fallingDownState; };
        
        this.getKnockedOutState = function(){ return knockedOutState;}
                    
        var service = engine.logic; // This is a hack so that this component will have its message queue processed



        
        //
        this.stayInBounds = function(pos){
          if(pos[2] > LEFT_BORDER){
            pos[2] = LEFT_BORDER;
          }
          if(pos[2] < RIGHT_BORDER){
            pos[2] = RIGHT_BORDER;
          }

          if(pos[1] <= FLOOR_POS){//JUMP_HEIGHT) {
            pos[1] = FLOOR_POS;
            this.speed[1] = 0;
          }
        }

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
        };
        
        
        this.onKick = function (event) {
          state.kick && state.kick();
        };
        this.onJump = function (event) {
          state.jump && state.jump();
        };
        this.onKnockOut = function(event){
          state.knockOut && state.knockOut();
        };
        // XXX get damage from event
        this.onHit = function(event){
          state.hit && state.hit(15);
        };
        // Can no longer directly throw fireballs
        //this.onThrowFireBall = function (event) {
        //  state.throwFireBall && state.throwFireBall();
        //};
        this.onKill = function (event) {
          state.dead && state.dead();
        };
        this.onSpin = function (event) {
          state.spin && state.spin();
        };
        
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
            document.getElementById(playerName).style.width = this.health + "px";
          }
          
          // XXX
          var transform = this.owner.find('Transform');

          this.trans = this.owner.find('Transform');
          this.model = this.owner.find('Model');

          state.update(delta, transform, this.model);
                    
          var pos = transform.position;
          
          this.speed[1] -= GRAVITY * 100 * delta;
          
          pos[1] += this.speed[1] * delta;
          pos[2] -= this.speed[0] * delta;
          this.stayInBounds(pos);
          
          transform.position = pos;
          
          if(this.dir === FACING_RIGHT){
            var temp = this.owner.find('Transform').rotation;
            temp[1] = math.PI/2;
            this.owner.find('Transform').rotation = temp;
          }
          else{
            var temp = this.owner.find('Transform').rotation;
            temp[1] = -math.PI/2;
            this.owner.find('Transform').rotation = temp;
          }
          
          // XXX fix direction
          if (keyStates[options.RIGHT_KEY] && keyStates[options.JUMP_KEY]){
            state.forwardJump && state.forwardJump();
          }
          else if (keyStates[options.LEFT_KEY] && keyStates[options.JUMP_KEY]){
            state.backwardJump && state.backwardJump();
          }

          // Don't move the user if they're trying to move in both directions.
          else if (keyStates[options.RIGHT_KEY] && keyStates[options.LEFT_KEY]) {
             state.idle && state.idle();
          }

          // Move them right if released the left key.
          else if (keyStates[options.RIGHT_KEY]) {
            state.moveForward && state.moveForward();
          }

          // Move them left if they released the right key.
          else if (keyStates[options.LEFT_KEY]) {
             state.moveForward && state.moveBackward();
          }

          // 
          else if (keyStates[options.JUMP_KEY]) {
            state.jump && state.jump();
          }
          
          printd(playerName, state.toString());
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
      
      
      var run = function () {

          canvas = engine.graphics.target.element;

          ////////////                      
          // Player 2
          ////////////
          var player2 = new space.Entity({
            name: 'player2',
            components: [
            new engine.core.component.Transform({
              position: math.Vector3(-50, FLOOR_POS, 20),
              rotation: math.Vector3(0, -math.PI / 2, 0),
              scale: math.Vector3(7, 7, 7)
            }),

            new BitwallModel({
              sprite: viking.sprites.thug1
            }),
            
            new HealthComponent({domId: 'player2'}),
            
            new engine.input.component.Controller({
              onKey: function (e) {

                // keep state of the keys
                var keyName = e.data.code;
                keyStates[keyName] = (e.data.state === 'down');

                switch (e.data.code) {

                  // walk right
                case 'L':
                  new engine.core.Event({
                    type: e.data.state === 'down' ? 'StartMoveForward' : 'StopMoveForward'
                  }).dispatch([this.owner]);
                  break;
                  
                case 'T':
                 /*   new engine.core.Event({
                      type: 'Health'
                    }).dispatch([this.owner]);*/
                  break;

                  // walk left
                case 'J':
                  new engine.core.Event({
                    type: e.data.state === 'down' ? 'StartMoveBackward' : 'StopMoveBackward'
                  }).dispatch([this.owner]);
                  break;

                  // jump
                case 'I':
                  new engine.core.Event({
                    type: e.data.state === 'down' ? 'Jump' : null
                  }).dispatch([this.owner]);
                  break;

                  // Punch
                case 'Y':
                  new engine.core.Event({
                    type: e.data.state === 'down' ? 'Punch' : 'PunchReleased'
                  }).dispatch([this.owner]);
                  break;

                  // Kick
                case 'U':
                  new engine.core.Event({
                    type: 'Kick'
                  }).dispatch([this.owner]);
                  break;

                  // Block
                case 'B':
                  new engine.core.Event({
                    type: e.data.state === 'down' ? 'StartBlock' : 'StopBlock'
                  }).dispatch([this.owner]);
                  break;

                  // Fireball!
                case 'M':
                  new engine.core.Event({
                    type: 'ThrowFireBall'
                  }).dispatch([this.owner]);
                  break;

                case '0':
                  new engine.core.Event({
                    type: 'KnockOut'
                    }).dispatch([this.owner]);
                  break;

                case '5':
                  new engine.core.Event({
                    type: 'Hit'
                    }).dispatch([this.owner]);
                  break;

                  // Spin player
                case '1':
                  new engine.core.Event({
                    type: 'Spin'
                  }).dispatch([this.owner]);
                  break;

                } //switdh
              } //onKey
            }), //controller
            new PlayerComponent(playerTwoConfig)

            ]
          });



          ///////////////
          /// NPC 1
          ///////////////
          /*var npc1 = new space.Entity({
            name: 'NPC1',
            components: [
              new engine.core.component.Transform({
                position: math.Vector3(-53, FLOOR_POS, 25),
                rotation: math.Vector3(0, math.PI / 2, 0),
                scale: math.Vector3(4, 4, 4)
              }), new BitwallModel({
                sprite: viking.sprites.thug5
              }),
              new PlayerComponent()
            ]
          });*/



          ////////////                      
          // Player 1
          ////////////
          var player1 = new space.Entity({
            name: 'player1',
            components: [
            new engine.core.component.Transform({
              position: math.Vector3(-50, FLOOR_POS, 35),
              // in front of red house.
              rotation: math.Vector3(0.5, math.PI / 2, 0.5),
              scale: math.Vector3(7, 7, 7)
            }),
            
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
                    type: e.data.state === 'down' ? 'StartMoveForward' : 'StopMoveForward'
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

                case 'A':
                  new engine.core.Event({
                    type: e.data.state === 'down' ? 'Punch' : 'PunchReleased'
                  }).dispatch([this.owner]);
                  break;

                  // Kick
                case 'S':
                  new engine.core.Event({
                    type: 'Kick'
                  }).dispatch([this.owner]);
                  break;

                  // Block
                case 'D':
                  new engine.core.Event({
                    type: e.data.state === 'down' ? 'StartBlock' : 'StopBlock'
                  }).dispatch([this.owner]);
                  break;

                  // Spin player
                case 'W':
                  new engine.core.Event({
                    type: 'Spin'
                  }).dispatch([this.owner]);
                  break;
                  
                case '0':
                  new engine.core.Event({
                    type: 'KnockOut'
                    }).dispatch([this.owner]);
                  break;

                case '5':
                  new engine.core.Event({
                    type: 'Hit'
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
            new PlayerComponent(playerOneConfig)]
          });


          var camera = new space.Entity({
            name: 'camera',
            components: [
            new engine.core.component.Transform({
              position: math.Vector3(-33, 15, 30)
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
                diffuse: [0, 0, 0,0 ],
                specular: [0, 0, 0 ],
                intensity: 10,
                distance: 0
            })
            ]
          });
          camera.find('Camera').target = math.Vector3(-60, 10, 30);

          // XXX the animation time is totally random.  It should actually
          // be something sane, probably picked to interact with the
          // simulationTime.delta and then that as well as the speed
          // that the spritesheet includes factored in.  I suspect this code
          // is gonna want some optimization too.
          // var animationTime = 25;
          // var animationTimer = 0;

          ////////////////
          // Task
          ////////////////
          var task = new engine.scheduler.Task({
            schedule: {
              phase: engine.scheduler.phases.UPDATE
            },
            callback: function () {
              var delta = engine.scheduler.simulationTime.delta / 1000;
              //bitwall.find('Transform').rotation = 
              //  math.matrix4.add([bitwall.find('Transform').rotation,
              //                   [0, math.TAU * delta * 0.1, 0]]);
              
                  var p1Xpos = player1.find('Transform').position[2];
                var p2Xpos = player2.find('Transform').position[2];
                
                
                //
                if( p1Xpos < p2Xpos ){
                  player1.find('Player').setFacing(FACING_LEFT);
                  player2.find('Player').setFacing(FACING_RIGHT); 
                }
                else{
                  player1.find('Player').setFacing(FACING_RIGHT);
                  player2.find('Player').setFacing(FACING_LEFT);
                }
                
                // First cut for cam movement
                var diff = p1Xpos - p2Xpos;
                
                if(diff > 19){
                  var test = camera.find('Transform').position;
                  test[0] = -33 - (20-diff);
                  camera.find('Transform').position = test;
                }

              // Start/Restart animation
              /*if (!animationTimer) {
                
                var p1ani = player1.find('Player').aniState;
                var p2ani = player2.find('Player').aniState;
                            
                player1.find('Model').updateAction(p1ani);
                player2.find('Model').updateAction(p2ani);
                
                // Move fireballs?
                // console.log(space.find('fireball'));
              
                // reset the timer
                animationTimer = animationTime;
              }
              // Update animation
              else {
                --animationTimer;
              }*/
              
              //npc1.find('Model').updateAction('walk-front');;
              
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