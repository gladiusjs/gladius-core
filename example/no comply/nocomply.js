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

      //////////////////
      // Player config
      /////////////////
      var playerOneConfig = {
        RIGHT_KEY:  'RIGHT',
        LEFT_KEY:   'LEFT',
        JUMP_KEY:   'UP',
        CROUCH_KEY: 'DOWN',
        name:       'player1'
      };

      var playerTwoConfig = {
        RIGHT_KEY:  'L',
        LEFT_KEY:   'J',
        JUMP_KEY:   'I',
        CROUCH_KEY: 'K',
        name:       'player2'
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

      const LEFT_BORDER = 40;
      const RIGHT_BORDER = 19;
      const MOVE_SPEED = 0.2;
      //const JUMP_HEIGHT
      // Global state of the keyboard.
      var keyStates = [];




      ///////////////
      ///////////////
      function colladaLoader(url, onsuccess, onfailure) {
        // XXX figure out why this is necessary
        window.CubicVR = engine.graphics.target.context;

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
            
            pos[2] -= 0.1 * dir;
            
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


      /////////////
      // Health Component
      /////////////
/*      var HealthComponent = engine.base.Component({
        type: 'Health',
        depends: ['Transform', 'Model']
        },
        function( options ){
          var that = this;
          var service = engine.logic;
                  
          this.onUpdate = function (){
          
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

        });*/





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
            this.kick = function () {pl.setState(pl.getKickState());};
            this.throwFireBall = function () {pl.setState(pl.getThrowFireBallState());};
            this.spin = function () {pl.setState(pl.getSpinState());};
            this.dead = function () {pl.setState(pl.getDeadState());}

            this.update = function (t, pc) {
              pl.aniState = 'idle';
              
              var pos = pc.position;
              pos[1] = 10.7;
              pc.position = pos;

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
          Character is spinning around and can get hit by the other player.
        */
        var SpinState = (function () {

          function SpinState(player) {

            var pl = player;
            var timeElapsed = 0;

            /*this.moveForward = function(){};
            this.moveBackward = function(){};
            this.jump = function(){};
            this.idle = function(){};
            this.block = function(){};
            this.punch = function(){};
            this.kick = function(){};
            this.throwFireBall = function(){};
            this.spin = function(){};*/

            this.dead = function () {
              pl.setState(pl.getDeadState());
            }

            // Should we slow down the character?
            this.update = function (t, pc) {
              
              pl.aniState = 'idle';
              
              timeElapsed += t;
              var rot = pc.rotation;

              // rotate the sprite very fast          
              if (timeElapsed < 2) {
                rot[1] += 15;
                pc.rotation = rot;
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
              return "Spin State: " + (2 - timeElapsed);
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

            /*this.moveForward = function(){};
            this.moveBackward = function(){};
            this.jump = function(){};
            this.idle = function(){};
            this.block = function(){};
            this.punch = function(){};
            this.kick = function(){};
            this.throwFireBall = function(){};
            this.spin = function(){};
            this.freeze = function(){}*/

            this.dead = function () {
              pl.setState(pl.getDeadState());
            }

            // Should we slow down the character?
            this.update = function (t, pc) {

              
              timeElapsed += t;
            };

            this.toString = function () {
              return "Frozen State: " + (2 - timeElapsed);
            };
          }

          return FrozenState;
        }());

        /**
          Users can't transition to another state from the dead state.
        */
        var DeadState = (function () {

          function DeadState(player) {
            var pl = player;

            /*this.moveForward = function(){};
            this.moveBackward = function(){};
            this.jump = function(){};
            this.idle = function(){};
            this.block = function(){};
            this.punch = function(){};
            this.kick = function(){};*/

            this.update = function (t, pc) {
              pl.aniState = 'knock-down';
              pc.rotation
            };

            this.toString = function () {
              return "Dead State";
            };

          }

          return DeadState;
        }());

        /**
         */
        var BlockState = (function () {

          function BlockState(player) {
            var pl = player;

            /*this.moveForward = function(){console.log('cant move if blocking');};
            this.moveBackward = function(){console.log('cant move if blocking');};
            this.jump = function(){console.log('cant jump if blocking');};    
            this.block = function(){console.log('already blocking');};
            this.punch = function(){console.log('cant punch if blocking');};
            this.kick = function(){console.log('cant kick if blocking');};*/

            this.idle = function () {
              pl.setState(pl.getIdleState());
            };
            this.dead = function () {
              pl.setState(pl.getDeadState());
            }

            this.update = function (t) {};

            this.toString = function () {
              return "Block State";
            };
          }

          return BlockState;
        }());


        /**
         */
        var ThrowFireBallState = (function () {

          function ThrowFireBallState(player) {
            var pl = player;
            var timeElapsed = 0;

            /*this.moveForward = function(){};
            this.moveBackward = function(){};
            this.jump = function(){};
            this.idle = function(){};
            this.block = function(){};
            this.punch = function(){};
            this.kick = function(){};*/

            this.onActivate = function() {

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
                    })
                    ,
                    new FireBallComponent({position:pos, direction: dir})
                  ]
                });
            };
            
            this.spin = function () {
              pl.setState(pl.getSpinState());
            };

            this.dead = function () {
              pl.setState(pl.getDeadState());
            }

            this.update = function (t, pc) {
              // Reuse the punch animation because we're cheap.
              pl.aniState = 'punch';
              
              timeElapsed += t;

              if (timeElapsed > 0.5) {
                timeElapsed = 0;
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
         */
        var PunchState = (function () {

          function PunchState(player) {
            var pl = player;
            var punchTimeElapsed = 0;

            /*this.moveForward = function(){console.log('cant move forward if punching');};
            this.moveBackward = function(){console.log('cant move forward if punching');};
            this.jump = function(){console.log('cant jump if punching');};
            this.idle = function(){console.log('cant idle if punching');};
            this.block = function(){console.log('cant block if punching');};
            this.punch = function(){console.log('already punching');};
            this.kick = function(){console.log('cant kick if punching');};*/

            // XXX
            // If a character is punching, can they be spun? Wouldn't they
            // run into the punch?
            //this.spin
            this.dead = function () {
              pl.setState(pl.getDeadState());
            }

            this.update = function (t, pc) {
              pl.aniState = 'punch';
              
              punchTimeElapsed += t;
              if (punchTimeElapsed > 0.5) {
                punchTimeElapsed = 0;
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
        var KickState = (function () {

          function KickState(player) {
            var pl = player;
            var kickTimeElapsed = 0;

            this.moveForward = function(){console.log('cant move forward if kicking');};
            this.moveBackward = function(){console.log('cant move backward if kicking');};
            this.jump = function(){console.log('cant jump if kicking');};
            this.idle = function(){p.setState('cant idle if kicking');};
            this.block = function(){console.log('cant block if kicking');};
            this.punch = function(){console.log('cant punch if kicking');};
            this.kick = function(){console.log('already kicking');};

            this.dead = function () {
              pl.setState(pl.getDeadState());
            }

            this.update = function (t) {
            
//XX            
//              pl.aniState = 'kick';

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
        }());

        /**
         */
        var MoveForwardState = (function () {

          function MoveForwardState(player) {
            var pl = player;

            this.moveForward = function () {
              //console.log('already moving forward');
            };
            this.moveBackward = function () {
              //console.log('already moving backward');
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
            this.kick = function () {
              pl.setState(pl.getKickState());
            };
            this.throwFireBall = function () {
              pl.setState(pl.getThrowFireBallState());
            };
            this.dead = function () {
              pl.setState(pl.getDeadState());
            };

            this.spin = function () {
              pl.setState(pl.getSpinState());
            };

            this.update = function (t, pc) {
              pl.aniState = 'walk';

              var pos = pc.position;
              // near the boxes of the abandoned house
              if (pos[2] > RIGHT_BORDER) {
                pos[2] -= MOVE_SPEED;
                pc.position = pos;
              }
              
              if(pos[2] < 24){
                pl.dir = -1;
                var rr = pc.rotation; //this.owner.find('Transform').rotation;
                pc.rotation = rr;
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

            this.moveForward = function () {};
            this.moveBackward = function () {};

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
            this.kick = function () {
              pl.setState(pl.getKickState());
            };
            this.throwFireBall = function () {
              pl.setState(pl.getThrowFireBallState());
            };
            this.spin = function () {
              pl.setState(pl.getSpinState());
            };

            this.dead = function () {
              pl.setState(pl.getDeadState());
            }

            this.update = function (t, pc) {
              var pos = pc.position;
              pl.aniState = 'walk';

              if (pos[2] < LEFT_BORDER) {
                pos[2] += MOVE_SPEED;
                pc.position = pos;
              }
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

            /*this.moveForward = function(){};
            this.moveBackward = function(){};
            this.jump = function(){};
            this.idle = function(){};
            this.block = function(){};
            this.punch = function(){};
            this.kick = function(){};
            this.throwFireBall = function(){};*/

            this.dead = function () {
              pl.setState(pl.getDeadState());
            }

            this.update = function (t, pc) {
              pl.aniState = 'hurt';
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

            /*this.moveForward = function(){console.log('cant move forward if jumping');};
          this.moveBackward = function(){console.log('cant move backward if jumping');};
          this.jump = function(){console.log('already jumping');};
          this.idle = function(){console.log('cant idle while jumping');};
          this.block = function(){console.log('cant block if jumping');};
          this.punch = function(){alert('take care of this case!');};*/

            // XXX can they be spun?
            // XXX
            this.kick = function () {
              alert('fix me');
            };
            this.hit = function () {
              // XXX
              // fix me
            };


            this.dead = function () {
              pl.setState(pl.getDeadState());
            };

            this.update = function (t, pc) {

              pl.aniState = 'jump';

              jumpTimeElapsed += t;

              if (jumpTimeElapsed < 1) {
                pos = pc.position;
                pos[1] += Math.sin(jumpTimeElapsed * Math.PI * 2) * 1.013;
                pc.position = pos;
              }

              if (jumpTimeElapsed >= 1) {
                // XXX fix this
                pos[1] = 8;
                pc.position[1] = 8;
                //console.log(pc.position);
                pl.setState(pl.getIdleState());
                jumpTimeElapsed = 0;

                /// fix this.
                // Let's say the user moves forward, jumps then lets go of moving
                // forward key. They still need to move forward until they land
                //  player.removeState(player.getMoveForwardState());
              }
            };

            this.toString = function () {
              return "Jump State: " + jumpTimeElapsed;
            };

          }
          return JumpState;
        }());

        /**
        Character walks forward and jumps
        */
        var ForwardJumpState = (function () {

          function ForwardJumpState(player) {
            var pl = player;
            var jumpTimeElapsed = 0;

            /*this.moveForward = function(){console.log('cant move forward if jumping');};
          this.moveBackward = function(){console.log('cant move backward if jumping');};
          this.jump = function(){console.log('already jumping');};
          this.idle = function(){console.log('cant idle while jumping');};
          this.block = function(){console.log('cant block if jumping');};
          this.punch = function(){alert('take care of this case!');};*/

            // XXX
            this.kick = function () {
              alert('fix me');
            };
            this.hit = function () {
              // XXX
              // fix me
            };

            this.dead = function () {
              pl.setState(pl.getDeadState());
            };

            this.update = function (t, pc) {
              jumpTimeElapsed += t;
              
              pl.aniState = 'jump';

              // XXX Fix this
              if (jumpTimeElapsed < 1) {
                pos = pc.position;
                pos[1] += Math.sin(jumpTimeElapsed * Math.PI * 2) * 1.013;

                // Fix this XXX
                if (pos[2] > RIGHT_BORDER) {
                  pos[2] -= MOVE_SPEED;
                  pc.position = pos;
                }

                pc.position = pos;
              }

              if (jumpTimeElapsed >= 1) {
                // XXX fix this
                pos[1] = 8;
                pc.position[1] = 8;
                //console.log(pc.position);
                pl.setState(pl.getIdleState());
                jumpTimeElapsed = 0;

                /// fix this.
                // Let's say the user moves forward, jumps then lets go of moving
                // forward key. They still need to move forward until they land
                //  player.removeState(player.getMoveForwardState());
              }
            };

            this.toString = function () {
              return "Forward Jump State: " + jumpTimeElapsed;
            };

          }
          return ForwardJumpState;
        }());


        /**
        Character walks backward and jumps
        */
        var BackwardJumpState = (function () {

          function BackwardJumpState(player) {
            var pl = player;
            var jumpTimeElapsed = 0;

            /*this.moveForward = function(){console.log('cant move forward if jumping');};
          this.moveBackward = function(){console.log('cant move backward if jumping');};
          this.jump = function(){console.log('already jumping');};
          this.idle = function(){console.log('cant idle while jumping');};
          this.block = function(){console.log('cant block if jumping');};
          this.punch = function(){alert('take care of this case!');};*/

            // XXX
            this.kick = function () {
              alert('fix me');
            };
            this.hit = function () {
              // XXX
              // fix me
            };

            this.dead = function () {
              pl.setState(pl.getDeadState());
            };

            this.update = function (t, pc) {
              pl.aniState = 'jump';
              jumpTimeElapsed += t;
              var pos = pc.position;

              if (jumpTimeElapsed < 1) {
                pos[1] += Math.sin(jumpTimeElapsed * Math.PI * 2) * 1.013;

                // Fix this XXX
                if (pos[2] < LEFT_BORDER) {
                  pos[2] += MOVE_SPEED;
                  pc.position = pos;
                }

                pc.position = pos;
              }

              if (jumpTimeElapsed >= 1) {
                // XXX fix this
                pos[1] = 8;
                pc.position[1] = 8;
                //console.log(pc.position);
                pl.setState(pl.getIdleState());
                jumpTimeElapsed = 0;

                /// fix this.
                // Let's say the user moves forward, jumps then lets go of moving
                // forward key. They still need to move forward until they land
                //  player.removeState(player.getMoveForwardState());
              }
            };

            this.toString = function () {
              return "Backward Jump State: " + jumpTimeElapsed;
            };

          }
          return BackwardJumpState;
        }());


        var health = 500;
        var playerName = options.name || "NoName";
        
        var idleState = new IdleState(this);
        var blockState = new BlockState(this);
        var jumpState = new JumpState(this);
        var punchState = new PunchState(this);
        var kickState = new KickState(this);
        var deadState = new DeadState(this);
        var recoverState = new RecoverState(this);
        var spinState = new SpinState(this);
        var frozenState = new FrozenState(this);
        var throwFireBallState = new ThrowFireBallState(this);
        var moveForwardState = new MoveForwardState(this);
        var moveBackwardState = new MoveBackwardState(this);
        var forwardJumpState = new ForwardJumpState(this);
        var backwardJumpState = new BackwardJumpState(this);
                    
        // XXX rename to currentState
        var state = idleState;
        
        // convert to getters
        this.getIdleState = function () {     return idleState;  };
        this.getBlockState = function () {    return blockState;  };
        this.getJumpState = function () {     return jumpState;  };
        this.getPunchState = function () {    return punchState;  };
        this.getKickState = function () {     return kickState;  };  
        this.getDeadState = function () {     return deadState;  };  
        this.getRecoverState = function () {  return recoverState;  }  
        this.getSpinState = function () {     return spinState;  };  
        this.getFrozenState = function () {   return frozenState;  };  
        this.getThrowFireBallState = function () {  return throwFireBallState;};  
        this.getMoveForwardState = function () {    return moveForwardState;  };  
        this.getMoveBackwardState = function () {   return moveBackwardState;  };  
        this.getForwardJumpState = function () {    return forwardJumpState;  };  
        this.getBackwardJumpState = function () {   return backwardJumpState }; 

        var service = engine.logic; // This is a hack so that this component will have its message queue processed

        this.setState = function (s) {
          if(state !== s){
            console.log('State changed: ' + s.toString());
            state = s;
            state.onActivate && state.onActivate();
          }
        };
        
        this.aniState = 'idle';
        
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
        this.onPunch = function (event) {
          state.punch && state.punch();
        };
        this.onKick = function (event) {
          state.kick && state.kick();
        };
        this.onJump = function (event) {
          state.jump && state.jump();
        };
        
        // XXX test code
        this.onTest = function(){
//          health -= 15;
  //ttt        document.getElementById(playerName).style.width = health + "px";
        };
        
        this.onThrowFireBall = function (event) {
          state.throwFireBall && state.throwFireBall();
        };
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
          var transform = this.owner.find('Transform');

          this.dir = 1;
          this.trans = this.owner.find('Transform');

          // Don't move the user if they're trying to move in both directions.
          if (keyStates[options.RIGHT_KEY] && keyStates[options.LEFT_KEY]) {
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

          state.update(delta, transform);
          
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
/*          var rat = new space.Entity({
            name: 'rat',
            components: [
              new engine.core.component.Transform({
                position: math.Vector3(-50, 15.7, 20),
                rotation: math.Vector3(0, -math.PI / 2, 0),
                scale: math.Vector3(7, 7, 7)
              }),

            ]
          });*/
            

          ////////////                      
          // Player 2
          ////////////
          var player2 = new space.Entity({
            name: 'player2',
            components: [
            new engine.core.component.Transform({
              position: math.Vector3(-50, 15.7, 20),
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
//                  new engine.core.Event({
  //                  type: 'Health'
    //              }).dispatch([this.owner]);
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
                    type: 'Jump'
                  }).dispatch([this.owner]);
                  break;

                  // Punch
                case 'Y':
                  new engine.core.Event({
                    type: 'Punch'
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




          /// NPC 1
          var npc1 = new space.Entity({
            name: 'NPC1',
            components: [
              new engine.core.component.Transform({
                position: math.Vector3(-53, 8.7, 25),
                rotation: math.Vector3(0, math.PI / 2, 0),
                scale: math.Vector3(4, 4, 4)
              }), new BitwallModel({
                sprite: viking.sprites.thug5
              }),
              new PlayerComponent()
            ]
          });







          ////////////                      
          // Player 1
          ////////////
          var player1 = new space.Entity({
            name: 'player1',
            components: [
            new engine.core.component.Transform({
              position: math.Vector3(-50, 8.7, 35),
              // in front of red house.
              rotation: math.Vector3(0, math.PI / 2, 0),
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
                    type: 'Jump'
                  }).dispatch([this.owner]);
                  break;

                case 'A':
                  new engine.core.Event({
                    type: 'Punch'
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

                  // Fireball
                case 'F':
                  new engine.core.Event({
                    type: 'ThrowFireBall'
                  }).dispatch([this.owner]);
                  break;

                  // Spin player
                case 'W':
                  new engine.core.Event({
                    type: 'Spin'
                  }).dispatch([this.owner]);
                  break;

                  // Kill player
                /*case 'X':
                  new engine.core.Event({
                    type: 'Kill'
                  }).dispatch([this.owner]);
                  break;*/

                } // aswitdh
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
            })]
          });
          camera.find('Camera').target = math.Vector3(-60, 10, 30);

          // XXX the animation time of 10 is totally random.  It should actually
          // be something sane, probably picked to interact with the
          // simulationTime.delta and then that as well as the speed
          // that the spritesheet includes factored in.  I suspect this code
          // is gonna want some optimization too.
          var animationTime = 5;
          var animationTimer = 0;

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
              if (!animationTimer) {
                // XXX update animation
                
                var p1ani = player1.find('Player').aniState;
                var p2ani = player2.find('Player').aniState;
                
                //var npc1ani = npc1.find('Player').aniState;
                
                player1.find('Model').updateAction(p1ani);
                player2.find('Model').updateAction(p2ani);
                
                npc1.find('Model').updateAction('walk-front');  
                
                
                
                // Move fireballs
//                console.log(space.find('fireball'));


                
                
                // reset the timer
                animationTimer = animationTime;
              }
              else {
                --animationTimer;
              }
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
      viking.loadSprite('./sprites/kraddy.sprite', {});
      viking.loadSprite('./sprites/thug2.sprite', {});
      viking.loadSprite('./sprites/thug3.sprite', {});
      viking.loadSprite('./sprites/thug4.sprite', {});
      viking.loadSprite('./sprites/thug5.sprite', {});
      viking.loadSprite('./sprites/smallrat.sprite', {});

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