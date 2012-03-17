var totalTime = 0;
var canMove = false;
var shake = 0;
/*
  Simple game based on the "No Comply" WebGL music video.
  TODOs: https://gladius.etherpad.mozilla.org/8
*/
document.addEventListener("DOMContentLoaded", function (e) {

  var getById = function(id){
    return document.getElementById(id);
  }

  var canvas = getById("test-canvas");
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var resources = {};

  //
  var game = function (engine) {
    
      const FACING_RIGHT =   1;
      const FACING_LEFT   = -1;

      const MOVE_SPEED = 45;
      const JUMP_IMPULSE = 50;
      
      const FLOOR_POS = 0;
      
      // Gameplay is 2D, so most objects in the scene have the same z coordinate.
      const GAME_DEPTH = -25;
      
      const PLAYER_BB_HEIGHT = 3.5;
      
      //
      const WALK_ANI_SPEED = 0.085;
      const PUNCH_DURATION   = 0.12;

      const BOSS_WALK_ANI_SPEED = 0.25;
      
      const MAX_HEALTH = 100;
            
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
        name:       'player',
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

      var space = new engine.core.Space();
      var math = engine.math;
        
        // TODO: FIX ME
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
        
        // CubicVR wants the directory where the dae file resides.
        var dir = url.match(/.*\//i);/**/

        try {
          var context = engine.graphics.target.context;
          var scene = context.loadCollada(url, dir);
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
          _updateTexture('idle');
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
      *
      * Health Component is visualized as bars at the top of the screen.
      *
      */
      var HealthComponent = engine.base.Component({
        type: 'Health'
        }, function( options ){
          
          options = options || {};

          var service = engine.logic,
              health = MAX_HEALTH,
              domId = options.domId,
              color = options.color;

          // Only need to do this once on init.
          getById(domId).style.backgroundColor = color;
          
          this.onHurt = function(amtToReduce){

            health -= amtToReduce;
            // clamp the health to the minimum possible.
            health = health < 0 ? 0 : health;
          }
          
          this.onHeal = function(amtToAdd){
            health += amtToAdd;
            // clamp the health to the maximum possible.
            health = health > MAX_HEALTH ? MAX_HEALTH : health;
          }
          
          this.onUpdate = function(){
            // If health is zero, we only see the ugly border around the
            // health bar, so just hide it in that case.

            var show = health > 0 ? "visible" : "hidden";
            getById(domId).style.visibility = show;
            
            // Allow some buffer between health bars
            var halfClientAreaWidth = (window.innerWidth-150)/2;
            var normalizedHealth = health/MAX_HEALTH;

            var final = normalizedHealth * halfClientAreaWidth;            

            getById(domId).style.width = final +  "px";
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
        
      // Boss with launch a bunch of objects user needs to avoid.
      var dropStoneCrate = function(options){

        var size = 3;
        shake = 100;
        
        // buffer
        var b = 0;
        
        var pos = options.position;
        var time =options.time;
        
        var bodyDef = engine.physics.resource.BodyDefinition({
          type: engine.physics.resource.BodyDefinition.bodyType.DYNAMIC,
          linearDamping:  1,
          angularDamping: 1,
          fixedRotation:  false
        });

        var collisionShape = engine.physics.resource.Box( size/2, size/2 );
        var fixtureDef = engine.physics.resource.FixtureDefinition({
          shape:   collisionShape,
          density: 1
        });
        
       var stoneCrate = new space.Entity({
            name: 'stoneCrate',
            components: [
              new engine.core.component.Transform({
                position: math.Vector3(pos[0], pos[1], pos[2] ),
                scale: math.Vector3( size, size, size )
              }),
              new engine.graphics.component.Model(
                resources.stone.mesh
              ),
              
              new StoneCrateComponent({time: time}),
              
              new engine.physics.component.Body({
                bodyDefinition: bodyDef,
                fixtureDefinition: fixtureDef
              }),
              new collision2Service.component.BoundingBox({
                lowerLeft: math.Vector3( -size/2 -b , -size/2 -b,  0 ),
                upperRight: math.Vector3( size/2 +b,  size/2 + b,  0 )
              })
            ]
        });
      };
      
      //
      var makeCrate = function(options){
        
        var boxW = boxH = 3;
        
        // buffer
        var b = 1.4;
        
        var pos = options.position;
        
        var bodyDef = engine.physics.resource.BodyDefinition({
          type: engine.physics.resource.BodyDefinition.bodyType.DYNAMIC,
          linearDamping:  1,
          angularDamping: 1,
          fixedRotation:  false
        });

        var collisionShape = engine.physics.resource.Box( boxW/2, boxH/2 );
        var fixtureDef = engine.physics.resource.FixtureDefinition({
          shape:   collisionShape,
          density: 0.5
        });
        
        new space.Entity({
            name: 'crate',
            components: [
              new engine.core.component.Transform({
                position: math.Vector3(pos[0], pos[1], pos[2] ),
                scale: math.Vector3( boxW, boxH, boxW )
              }),
              new engine.graphics.component.Model(
                resources.crate.mesh
              ),
              new CrateComponent(),
              new engine.physics.component.Body({
                bodyDefinition: bodyDef,
                fixtureDefinition: fixtureDef
              }),
              new collision2Service.component.BoundingBox({
                lowerLeft: math.Vector3( -boxW/2 -b , -boxH/2 -b,  0 ),
                upperRight: math.Vector3( boxW/2 +b,  boxH/2 + b,  0 )
              })
            ]
        });     
      };




      /*
      *
      *  State Component for Boss
      *
      */
      var StateComponentBoss = engine.base.Component({
        type: 'BossState'
        },
        
        function( options ){
          options = options || {};
          var that = this;
          
          var service = engine.logic;

          // walk state
          var WalkState = (function () {
            function WalkState(player) {
              var pl = player;
              
              var aniTimer = 0;
              var walkTimer = 0;
              var totalTimer = 0;
              var direction = 1;
              
              //this.idle = function () {pl.setState(pl.getIdleState());};
              this.jump = function () {   pl.setState(pl.getJumpState());};

              this.activate = function(){
                timer = 0;
                walkTimer = 0;
                totalTimer = 0;
                direction = 1;
              };

              this.update = function (event) {
                var delta = service.time.delta / 1000;
                
                aniTimer += delta;
                walkTimer += delta;
                totalTimer += delta;
                
                var xPos = pl.owner.find('Transform').position[0];
                
                if(aniTimer >= BOSS_WALK_ANI_SPEED){
                  aniTimer = 0;
                  pl.owner.find('Model').updateAction('walk');
                }
                                
                if(totalTimer >= 10){
                  this.jump();
                }
                
                // if going right and we reached border, walk forwards.
                if((direction === 1 && xPos > 50 ) || (direction === -1 && xPos < 37)){
                  direction *= -1;
                }
                
                new engine.core.Event({type: 'LinearImpulse', data: {impulse: [direction * 2500, 0]}}).dispatch( pl.owner );
              };
              
              this.toString = function(){
                return "walk";
              }
            }

            return WalkState;
          }());


          // JumpState - Jump Straight up
          var JumpState = (function () {
            function JumpState(player) {
              var pl = player;
              var timeElapsed = 0;

              this.update = function (event) {
                var delta = service.time.delta / 1000;

                timeElapsed += delta;
                
                // TODO: FIX ME
                if(timeElapsed > 0.25 && pl.owner.find('Transform').position[1] <= 13){
                
                  // make crates when boss lands
                  // comment
                  var time = 10;
                  for(var x = -38, y = 0; x < 35; x += 10, y += 15){
                    time += 0.5;
                    dropStoneCrate({position: [x, y + 150, GAME_DEPTH], time: time});
                  }
                  
                  pl.setState(pl.getWalkState());
                }
              };
                            
              // TODO: FIX ME
              this.land = function(){ pl.setState(pl.getIdleState());};
              
              this.activate = function(){
                timeElapsed = 0;
                
                pl.owner.find('Model').updateAction('jump');
                
                new engine.core.Event({type: 'LinearImpulse', data: {impulse: [0, 100000]}}).dispatch( pl.owner );
              }
              this.toString = function(){
                return 'jump';
              }
            }
            return JumpState;
          }());

          // instances of all the states
          var walkState = new WalkState(this);
          var jumpState = new JumpState(this);
          var state = walkState;

          this.getJumpState = function(){   return jumpState;};
          this.getWalkState = function(){   return walkState;};

          this.setState = function(s){
            if(state !== s){
              state = s;
              state.activate && state.activate();
            }
          };
          
          this.onUpdate = function(t){
            state && state.update(t);
          }
          
          // fix this
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
                new engine.core.Event({type: 'MoveStop', data: {direction: 'left'}}).dispatch( [pl.owner] );
                new engine.core.Event({type: 'MoveStop', data: {direction: 'right'}}).dispatch( [pl.owner] );
                new engine.core.Event({type: 'MoveStop', data: {direction: 'up'}}).dispatch( [pl.owner] );
                new engine.core.Event({type: 'MoveStop', data: {direction: 'down'}}).dispatch( [pl.owner] );                
              }

              this.moveRight = function (){ pl.setState(pl.getMoveRightState());};
              this.moveLeft = function(){   pl.setState(pl.getMoveLeftState());};
              
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



          var MoveRightState = (function () {
            function MoveRightState(player) {
              var pl = player;
              var timer = 0;
              
              // State transitions
              this.idle = function () {
                pl.setState(pl.getIdleState());
              };
               
              this.jump = function () {   pl.setState(pl.getRightJumpState());};
              this.spinKick = function(){ pl.setState(pl.getSpinKickState());};
              this.fall = function(){     pl.setState(pl.getFallState());};

              this.activate = function(){

                timer = 0;
              };

              this.update = function (event) {
                timer += service.time.delta / 1000;
                new engine.core.Event({type: 'LinearImpulse', data: {impulse: [MOVE_SPEED, 0]}}).dispatch( pl.owner );
                if(timer >= WALK_ANI_SPEED){
                  timer = 0;
                  pl.owner.find('Model').updateAction('walk');
                }                
              };
              
              this.toString = function(){
                return "move right";
              }
            }

            return MoveRightState;
          }());
          
          
          
          
          
          
          var MoveLeftState = (function () {
            function MoveLeftState(player) {
              var pl = player;
              var timer = 0;
              
              // State transitions
              this.idle = function () {   pl.setState(pl.getIdleState());};
              this.jump = function () {   pl.setState(pl.getLeftJumpState());};
              this.spinKick = function(){ pl.setState(pl.getSpinKickState());};
              this.fall = function(){     pl.setState(pl.getFallState());};

              this.activate = function(){
                timer = 0;
              };

              this.update = function (event) {
                timer += service.time.delta / 1000;
                new engine.core.Event({type: 'LinearImpulse', data: {impulse: [-MOVE_SPEED, 0]}}).dispatch( pl.owner );
                if(timer >= WALK_ANI_SPEED){
                  timer = 0;
                  pl.owner.find('Model').updateAction('walk');
                }                
              };
              
              this.toString = function(){
                return "move left";
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
              this.land = function () {   pl.setState(pl.getIdleState());};
              
              this.activate = function(){
                timeElapsed = 0;
                pl.owner.find('Model').updateAction('jump');
                new engine.core.Event({type: 'MoveStop', data: {direction: 'up'}}).dispatch( [pl.owner] );
              };
              
              this.toString = function(){
                return 'falling';
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
                
                // TODO: FIX ME
                if(timeElapsed > 0.15 /* && if not colliding with something */){
                  pl.setState(pl.getFallState());                  
                }
              };
                            
              // TODO: FIX ME
              this.land = function(){ pl.setState(pl.getIdleState());};
              
              this.activate = function(){
                timeElapsed = 0;
                pl.owner.find('Model').updateAction('jump');
                
                new engine.core.Event({type: 'LinearImpulse', data: {impulse: [0, 3000]}}).dispatch( pl.owner );
              }
              this.toString = function(){
                return 'jump';
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
                return 'ko';
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
                return 'spin';
              }
            }
            return SpinKickState;
          }());


          // Right Jump State
          var RightJumpState = (function () {
            function RightJumpState(player) {
              var pl = player;
              var timeElapsed = 0;
              
              this.land = function () {   pl.setState(pl.getIdleState());};
              
              this.activate = function(){              
                timeElapsed = 0;
                pl.owner.find('Model').updateAction('jump');                
                
                new engine.core.Event({type: 'LinearImpulse', data: {impulse: [0, JUMP_IMPULSE]}}).dispatch( pl.owner );
              };
              
              this.update = function () {
                var delta = service.time.delta / 1000;
                new engine.core.Event({type: 'LinearImpulse', data: {impulse: [MOVE_SPEED, 0]}}).dispatch( pl.owner );
                timeElapsed += delta;
                var yPos = pl.getTransform().position[1];
                
                if(timeElapsed > 0.1){  //if(yPos <= FLOOR_POS + PLAYER_BB_HEIGHT*2 && 
                  pl.setState(pl.getFallState());
                }                
              };
              
              this.toString = function(){
                return 'forward jump';
              }
            }
            return RightJumpState;
          }());


          // Right Jump State
          var LeftJumpState = (function () {
            function LeftJumpState(player) {
              var pl = player;
              var timeElapsed = 0;
              
              this.land = function () {   pl.setState(pl.getIdleState());};
              
              this.activate = function(){              
                timeElapsed = 0;
                pl.owner.find('Model').updateAction('jump');
                new engine.core.Event({type: 'LinearImpulse', data: {impulse: [0, JUMP_IMPULSE]}}).dispatch( pl.owner );
              };
              
              this.update = function () {
                new engine.core.Event({type: 'LinearImpulse', data: {impulse: [-MOVE_SPEED, 0]}}).dispatch( pl.owner );
                var delta = service.time.delta / 1000;
                timeElapsed += delta;
                var yPos = pl.getTransform().position[1];
                
                if(timeElapsed > 0.1){  //if(yPos <= FLOOR_POS + PLAYER_BB_HEIGHT*2 && 
                  pl.setState(pl.getFallState());
                }                
              };
              
              this.toString = function(){
                return 'left jump';
              }
            }
            return LeftJumpState;
          }());


          // instances of all the state
          var idleState = new IdleState(this);
          var jumpState = new JumpState(this);
          
          var moveRightState = new MoveRightState(this);
          var moveLeftState = new MoveLeftState(this);
          
          var rightJumpState = new RightJumpState(this);
          var leftJumpState = new LeftJumpState(this);
          var crouchState = new CrouchState(this);
          var spinKickState = new SpinKickState(this);
          var fallState = new FallState(this);
          var knockedOutState = new KnockedOutState(this);

          var state = idleState;

          // TODO: FIX ME          
          this.getPlayer = function(){
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
          
          this.onMoveRight = function(){    state.moveRight && state.moveRight();}
          this.onMoveLeft = function(){     state.moveLeft && state.moveLeft();};
          
          this.onCrouch = function(){       state.crouch && state.crouch();}
          this.onPunch = function(){        state.punch && state.punch();}
          this.onSpinKick = function(){     state.spinKick && state.spinKick();};
          this.onKnockOut = function(){     state.knockOut && state.knockOut();};          
        
          // FIX ME
          this.land = function(){   state.land && state.land();};

          // 
          this.getJumpState = function(){return jumpState;}
          this.getIdleState = function(){return idleState;}
          
          this.getMoveRightState = function (){return moveRightState;};
          this.getMoveLeftState = function(){return moveLeftState;};
          
          this.getRightJumpState = function(){return rightJumpState;};
          this.getLeftJumpState = function(){return leftJumpState;};
          
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

        this.onCollision = function(e){
        };
        
        this.onUpdate = function (event) {
          var delta = service.time.delta / 1000;          
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
          //console.log('collide');
        
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
      // Stone Crate Component
      ////////////////////
      
      /*
      * Boss creates these which fall from the sky
      */
      var StoneCrateComponent = engine.base.Component({
        type: 'StoneCrate',
        depends: ['Transform', 'Model']
      },
      function (options) {
      
        options = options || {};
        var that = this;
        
        var timer = 0;
        
        var timeToDie = options.time;
        
        // This is a hack so that this component will have its message queue processed
        var service = engine.logic; 

        this.onCollision = function(e){
          // TODO: check if it collided with player
          //if(e.data.entity.find('Player')){
          //}
          
          if(e.data.entity.name === 'boss'){
            space.remove(this.owner);
            
            e.data.entity.find('Health').onHurt(25);
          }
          
        };
        
        this.onUpdate = function (event) {
          var delta = service.time.delta / 1000;

          timer += delta;
 
           if(timer >= timeToDie){
              space.remove(this.owner);

            }
          
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
      }); // Stone Crate Components
      


      ////////////////////
      // Boss Component
      ////////////////////
      var BossComponent = engine.base.Component({
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
        
        
        var someTimer = 0;
        
        this.facing = FACING_LEFT;

        this.onCollision = function(e){

          if(e.data.entity.name === 'crate'){
            space.remove( e.data.entity );
            this.owner.find('Health').onHurt(25);
          }
          
          if(e.data.entity.find('State')){
            var playerState = e.data.entity.find('State').getCurrState();
            var playerTrans = e.data.entity.find('Transform');

            // XXX move this out
            if(playerState === "spin"){
              this.owner.find('State').onKnockOut();
              //console.log('hit');

              // FIX ME: Prevent the object from colliding with anything else.
              // this.onCollision = function(){};
              // this.velocity = [5, 50, 5];
              // this.acceleration[1] = -9.8 * 20;
            }
            //else {set Linear Vel of object}
          }
        };
        
        this.setFacing = function(f){
          if(f === FACING_LEFT || f === FACING_RIGHT){
            this.facing = f;
            this.walk();
          }
        }
        
        // FIX ME
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
          /*
          someTimer += delta;
          
          // Drop stone crates
          if(someTimer > 25){
            someTimer = 0;
            
//            new engine.core.Event({type: 'LinearImpulse', data: {impulse: [-40, 0]}}).dispatch( player.owner );
            
            // TODO: comment
            var time = 10;
            for(var x = -38, y = 0; x < 35; x += 10, y += 15){
              time += 0.5;
              dropStoneCrate({position: [x, y + 150, GAME_DEPTH], time: time});
            }
          }*/
          
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
        
        var collideID = 0;
        var platformEntity = null;
        
        // This is a hack so that this component will have its message queue processed
        var service = engine.logic; 
        
        this.initialPos = options.initialPos || [0,0,0];
        
        var playerName = options.name || "NoName";
        var facing = FACING_RIGHT;

        this.onCollision = function(e){
          var userPos,
              platPos;
              
          // Make the sprite land
          if( this.owner.find('State').getCurrState() === 'falling' ){
           //this.owner.find('State').getCurrState() === 'forward jump'
            this.owner.find('State').land();
          }

          // If this is the first instance of us colliding with a platform,
          // we must have just landed, which means we should go into an idle state.
          // new collision
          if(collideID !== e.data.entity.id && e.data.entity.name === 'platform'){
          
            userPos = this.owner.find('Transform').position[1];          
            platPos =  e.data.entity.find('Transform').position[1];

            // FIX ME
            // We could have collided with the platform by hitting our head on it,
            // check that we didn't.
            
            // FIX ME: take into account sprite's height
            if( Math.abs(userPos - platPos) > 0.0001){
            //if(userPos <= platPos)
              // grab a reference to the platform
              platformEntity = e.data.entity;
              collideID = e.data.entity.id;
              
              console.log('just landed');
             // this.owner.find('State').land();
            }
          }          
        };
        
        this.jump = function (event) {
          this.owner.find('State').onJump();
        };
                
        this.moveRight = this.onStartMoveRight = function(event){
          this.setFacing(FACING_RIGHT);
          this.owner.find('State').onMoveRight();
        };
        
        this.moveLeft = this.onStartMoveLeft = function(event){
          this.setFacing(FACING_LEFT);
          this.owner.find('State').onMoveLeft();
        };
        
        this.idle = this.onIdle = function(event){
          this.owner.find('State').onIdle();
        }
                
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
              
              //this.owner.find('State').onFall();
            }
          }
          
          document.getElementById('debug').innerHTML = this.owner.find('State').getCurrState();
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
          // Boss
          ////////////
          var bossW = 20,
              bossH = 20;

          var bossBody = engine.physics.resource.BodyDefinition({
                  type: engine.physics.resource.BodyDefinition.bodyType.DYNAMIC,
                  linearDamping: 6,
                  angularDamping: 1,
                  fixedRotation: true
          });

          // Make an obstacle that will collide with the player
          var bossShape = engine.physics.resource.Box( bossW/3, bossH/3 );
          var bossFixture = engine.physics.resource.FixtureDefinition({
            shape:   bossShape,
            density: 8
          });

          var boss = new space.Entity({
              name: 'boss',
              components: [
                new engine.core.component.Transform({
                  /// !!! XXX use initial pos
                  position: math.Vector3(38, FLOOR_POS + 10, GAME_DEPTH),
                  scale: math.Vector3(bossW, bossH, 1),
                  rotation: math.Vector3(0, math.PI, 0)
                }),
                new BitwallModel({
                  sprite: viking.sprites.thug1
                }),
                
                new BossComponent({}),
                
                new HealthComponent({domId: 'boss', color: 'orange'}),
                
                new StateComponentBoss(), 
                
                new engine.physics.component.Body({
                  bodyDefinition: bossBody,
                  fixtureDefinition: bossFixture
                }),

                new collision2Service.component.BoundingBox({
                  lowerLeft: math.Vector3( -bossW/3, -bossH/3, 0),
                  upperRight: math.Vector3( bossW/3,  bossH/3, 0 )
                })
              ]
            });
          //thug1.find('Enemy').setFacing(1);
          //thug1.find('Enemy').walk();*/
          
          
          ////////////                      
          // Player
          ////////////
          var playerBody = engine.physics.resource.BodyDefinition({
            type: engine.physics.resource.BodyDefinition.bodyType.DYNAMIC,
            linearDamping:  2,
            angularDamping: 1,
            fixedRotation:  true
          });

          // Make an obstacle that will collide with the player
          var playerShape = engine.physics.resource.Box( 0.75, 2 );
          var playerFixture = engine.physics.resource.FixtureDefinition({
            shape:   playerShape,
            density: 5
          });

          var player = new space.Entity({
            name: 'player',
            components: [
            
            // Model
            new engine.core.component.Transform({
              /// XXX use initial pos
              position: math.Vector3(30, FLOOR_POS + 105, GAME_DEPTH),
              scale: math.Vector3(7, 7, 7)
            }),
            
            // Graphic Representation
            new BitwallModel({
              sprite: viking.sprites.kraddy
            }),
            
            new HealthComponent({domId: 'player', color: 'green'}),
            
            new engine.input.component.Controller({
            
              onKey: function (e) {
                // keep state of the keys
                var keyName = e.data.code;
                keyStates[keyName] = (e.data.state === 'down') ? true : false;
                
                switch(keyName){
                  case '1':makeCrate({position: [40, 40, GAME_DEPTH]});break;
                }
                
              } // onKey
            }), //controller
            
            
            new PlayerComponent(keyConfig),
            
            new StateComponent(), 
            
            new engine.physics.component.Body({
              bodyDefinition: playerBody,
              fixtureDefinition: playerFixture
            }),

             new collision2Service.component.BoundingBox({
               lowerLeft: math.Vector3( -2, -3,  0),
               upperRight: math.Vector3( 0.5,  2,  0 )
              })
            ]
          });




          // floor
          var floorBodyDef = engine.physics.resource.BodyDefinition({
            type: engine.physics.resource.BodyDefinition.bodyType.STATIC,
            linearDamping:  1,
            angularDamping: 1,
            fixedRotation:  true
          });

          var floorCollisionShape = engine.physics.resource.Box( 150, .1 );
          var floorFixtureDef = engine.physics.resource.FixtureDefinition({
            shape: floorCollisionShape,
            density: 0
          });

          var floor = new space.Entity({
              name: 'platform',
              components: [
                 new engine.core.component.Transform({
                  position: math.Vector3( 0, FLOOR_POS - 1, 0 ),
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
             // We need this light so white borders around sprites aren't drawn.
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
              
              totalTime += delta;
              
              if(totalTime > 1){
                canMove = true;
                //var movieTop = getById('movieTop').style.height;
              }
              
              // Player components
              var p1Com = player.find('Player');
              var p1Pos = player.find('Transform').position;
              var p1Xpos = p1Pos[0];
              var p1Div = getById('player');
              // XXX fix me
              p1Div = getById('player'); 
              
              var newPos = camera.find('Transform').position;
              newPos[0] = p1Pos[0];
              newPos[1] = p1Pos[1];
              
              var shaking = Math.sin(shake) * 2;
              shake /= 1.1;
              
              camera.find('Transform').position = [newPos[0] + shaking,newPos[1] + 15 + shaking, 25 + shaking/2];
              camera.find('Camera').target = [newPos[0], 4 + p1Pos[1] + shaking/2, -1];
              
              var playerState = player.find('State');
              //var thugState = thug1.find('State');
              //var thugPos = thug1.find('Transform').position;
              
              //var currFacing = thug1.find('Enemy').facing;
              
              /*if(thugPos[0] < -10 && currFacing === -1){
                  thug1.find('Enemy').setFacing(1);
               }
               else if( thugPos[0] > 10 && currFacing === 1){
                 thug1.find('Enemy').setFacing(-1);
               }*/
            if(canMove){
                if(keyStates[keyConfig.RIGHT_KEY] && keyStates[keyConfig.JUMP_KEY]){
                  player.find('Player').jump();
                }
                else if (keyStates[keyConfig.LEFT_KEY] && keyStates[keyConfig.JUMP_KEY]){
                  player.find('Player').jump();
                }
                // Don't move the user if they're trying to move in both directions.
                else if (keyStates[keyConfig.RIGHT_KEY] && keyStates[keyConfig.LEFT_KEY]) {
                  player.find('Player').idle();
                }
                // Move them right if released the right key.
                else if (keyStates[keyConfig.RIGHT_KEY]) {
                  player.find('Player').moveRight();
                }
                // Move them left if they released the left key.
                else if (keyStates[keyConfig.LEFT_KEY]) {
                  player.find('Player').moveLeft();
                }
                // 
                else if (keyStates[keyConfig.JUMP_KEY]) {
                  player.find('Player').jump();
                }
                else{
                  player.find('Player').idle();
                  player.find('Health').onHeal(.1);
                }
              }
            }
          });

          // Start the engine!
          engine.run();
        };


      ////////////////
      // Load some sprites
      ////////////////
      viking.loadSprite('./sprites/thug1.sprite');
      viking.loadSprite('./sprites/kraddy.sprite');

      engine.core.resource.get([
      {
        type: engine.core.resource.Collada,
        url: "city/intro_city-anim.dae",
        load: colladaLoader,
        onsuccess: function (instance) {

          for(var i = 0; i < instance.meshes.length; i++){

            new space.Entity({
              name: instance.names[i],
              components: [
                new engine.core.component.Transform({
                  position: instance.positions[i],
                  rotation: instance.rotations[i],
                  scale:    instance.scales[i]
                }),
                
                new engine.graphics.component.Model(
                   instance.meshes[i]),
              ]
            });
          }
        },
        onfailure: function (error) {
          console.log("error loading collada resource: " + error);
        }
      },
      
      {
        type: engine.core.resource.Collada,
        url: 'platform/platform.dae',
        load: colladaLoader,
        onsuccess: function (instance) {
        
          // Change these to change the width and height of the platforms.
          var platW = 8,
              platH = 4;
          
          // Use these to change the dimensions of the parts of the floor
          var rightFloorW = 50,
              rightFloorH = 15;
              
          // Used for the right and left wall to prevent the user from
          // going off the scene.
          var wallW = 2,
              wallH = 150;

            // platform Box2d
            var bodyDef = engine.physics.resource.BodyDefinition({
              type: engine.physics.resource.BodyDefinition.bodyType.STATIC,
              linearDamping:  1,
              angularDamping: 1,
              fixedRotation:  true
            });


            var platformShape = engine.physics.resource.Box( platW/2, platH/2 );
            var platDef = engine.physics.resource.FixtureDefinition({
              shape:   platformShape,
              density: 0
            });

            var floorShape = engine.physics.resource.Box( rightFloorW/2, rightFloorH/2 );
            var floorDef = engine.physics.resource.FixtureDefinition({
              shape:   floorShape,
              density: 0
            });
            
            var wallShape = engine.physics.resource.Box( wallW/2, wallH/2 );
            var wallDef = engine.physics.resource.FixtureDefinition({
              shape:   wallShape,
              density: 0
            });
            

          // Left Floor, where the user starts
          new space.Entity({
              name: 'platform',
              components: [
                new engine.core.component.Transform({
                  position: math.Vector3( -36.2, FLOOR_POS -1.5, GAME_DEPTH ),
                  scale: math.Vector3( rightFloorW, rightFloorH, 5)
                }),
                new engine.graphics.component.Model(
                  instance.meshes[0]
                ),                   
                new PlatformComponent(),
                new collision2Service.component.BoundingBox({
                  lowerLeft: math.Vector3( -rightFloorW/2, -rightFloorH/2,  0),
                  upperRight: math.Vector3( rightFloorW/2,  rightFloorH/2,  0 )
                }),
                new engine.physics.component.Body({
                  bodyDefinition: bodyDef,
                  fixtureDefinition: floorDef
                }),
              ]
            });
          
          
            // Right Floor, where the boos starts
            new space.Entity({
              name: 'platform',
              components: [
                new engine.core.component.Transform({
                  position: math.Vector3( 33.2, FLOOR_POS -1.5, GAME_DEPTH ),
                  scale: math.Vector3( rightFloorW, rightFloorH, 5)
                }),
                new engine.graphics.component.Model(
                  instance.meshes[0]
                ),                   
                new PlatformComponent(),
                new collision2Service.component.BoundingBox({
                  lowerLeft: math.Vector3( -rightFloorW/2, -rightFloorH/2,  0),
                  upperRight: math.Vector3( rightFloorW/2,  rightFloorH/2,  0 )
                }),
                new engine.physics.component.Body({
                  bodyDefinition: bodyDef,
                  fixtureDefinition: floorDef
                }),
              ]
            });
            
            
            
            // Left wall
            new space.Entity({
              name: 'wall',
              components: [
                new engine.core.component.Transform({
                  position: math.Vector3( -58.5, FLOOR_POS -15, GAME_DEPTH ),
                  scale: math.Vector3( wallW, wallH, 5)
                }),
                // TODO: Remove before release
                new engine.graphics.component.Model(
                  instance.meshes[0]
                ),
                new collision2Service.component.BoundingBox({
                  lowerLeft: math.Vector3( -wallW/2, -wallH/2,  0),
                  upperRight: math.Vector3( wallW/2,  wallH/2,  0 )
                }),
                new engine.physics.component.Body({
                  bodyDefinition: bodyDef,
                  fixtureDefinition: wallDef
                }),
              ]
            });


            // Right wall
            new space.Entity({
              name: 'wall',
              components: [
                new engine.core.component.Transform({
                  position: math.Vector3( 58.5, FLOOR_POS -15, GAME_DEPTH ),
                  scale: math.Vector3( wallW, wallH, 5)
                }),
                // TODO: Remove before release
                new engine.graphics.component.Model(
                  instance.meshes[0]
                ),
                new collision2Service.component.BoundingBox({
                  lowerLeft: math.Vector3( -wallW/2, -wallH/2,  0),
                  upperRight: math.Vector3( wallW/2,  wallH/2,  0 )
                }),
                new engine.physics.component.Body({
                  bodyDefinition: bodyDef,
                  fixtureDefinition: wallDef
                }),
              ]
            });
            
          
          // These are the platforms user can jump on
          for(var i = 0; i < 3; i++){
            new space.Entity({
              name: 'platform',
              components: [
                new engine.core.component.Transform({
                  position: math.Vector3( i*15, 20 + FLOOR_POS + (i*5), GAME_DEPTH ),
                  scale: math.Vector3( platW, platH, 5 )
                }),
                new engine.graphics.component.Model(
                  instance.meshes[0]
                ),                   
                new PlatformComponent(),
                new collision2Service.component.BoundingBox({
                  lowerLeft: math.Vector3( -platW/2, -platH/2,  0),
                  upperRight: math.Vector3( platW/2,  platH/2,  0 )
                }),
                new engine.physics.component.Body({
                  bodyDefinition: bodyDef,
                  fixtureDefinition: platDef
                }),
              ]
            });
          }
        }
      },

      {
        type: engine.core.resource.Collada,
        url: 'crate/crate.dae',
        load: colladaLoader,
        onsuccess: function (instance) {
          // We'll be making crates dynamically so we need to make an accessible reference. 
          resources.crate = {
            mesh: instance.meshes[0]
          };
        },
        onfailure: function (error) {
          console.log(error);
        }
      },

      {
        type: engine.core.resource.Collada,
        url: 'stone/stone.dae',
        load: colladaLoader,
        onsuccess: function (instance) {
          // We'll be making stone crates dynamically so we need to make an accessible reference. 
          resources.stone = {
            mesh: instance.meshes[0]
          };
        },
        onfailure: function (error) {
          console.log(error);
        }
      },
      
      {
        type: engine.graphics.resource.Mesh,
        url: 'procedural-mesh.js',
        load: engine.core.resource.proceduralLoad,
        onsuccess: function (mesh) {
          resources['mesh'] = mesh;
        },
        onfailure: function (error) {}
      },
      
      {
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
      physics: {
          src: 'physics/2d/box2d/service',
          options: {
              gravity: [0, -98]
          }
      },
      logic: 'logic/game/service'
    }
  }, game);

});
