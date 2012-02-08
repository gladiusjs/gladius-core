/*global Sprite, viking, console, gladius*/
document.addEventListener("DOMContentLoaded", function(e) {

  var printd = function(div, str) {
    document.getElementById(div).innerHTML = str + '<p>';
  };
  var cleard = function(div) {
    document.getElementById(div).innerHTML = '';
  };
  var canvas = document.getElementById("test-canvas");

  var game = function(engine) {
    var math = engine.math;

    var CubicVR = engine.graphics.target.context;

/*
    var SpriteSheet = new engine.base.Resource({
      type : 'SpriteSheet'
    }, function(data) {
      var options = {
        // name : this.url XXX no access here
        name: "thug1"
      };
      this.data = new Sprite(JSON.parse(data), options, viking);
      return;
    });
*/

    // Thanks to the NoComply demo's CubicVR-bitmap_cube_array.js' for the
    // BitwallModel code
    var BitwallModel = engine.base.Component({
      type : 'Model',
      depends : ['Transform']
    }, function(options) {
      options = options || {};
      var _this = this;
      var service = engine.graphics;
      var gl = CubicVR.GLCore.gl;

      var _sprite = options.sprite;
      var _mesh = new engine.graphics.resource.Mesh();
      var _cvrmesh = _mesh._cvr.mesh;
      var _material;
      var tex = new CubicVR.Texture();

      var _action = options.action || null;
      this.updateAction = function( action ) {
          _action = action;
          _updateTexture( action );
      };
           
      function _updateTexture( action ) {
          // initialize it to a sprite image
          gl.bindTexture(gl.TEXTURE_2D, CubicVR.Textures[tex.tex_id]);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, 
            _sprite[action].frame());
          gl.bindTexture(gl.TEXTURE_2D, null);
      };

      function buildMaterial() {

        // create an empty texture        
        tex.setFilter(CubicVR.enums.texture.filter.NEAREST);
        tex.use();
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);    
        
        _updateTexture( 'walk' );
        
        _material = new engine.graphics.resource.Material({
          color : [1, 1, 1],
          textures: {
            color: tex
          }
        });
      }

      buildMaterial();
      var _cvrmat = _material._cvr.material;

      var tmpMesh = new CubicVR.Mesh();

      var trans = new CubicVR.Transform();

      trans.clearStack();
      trans.scale([1, 1, 1]);

      CubicVR.genPlaneObject(tmpMesh, 1.0, _cvrmat);

      tmpMesh.faces[0].uvs = [[1, 0], [1, 1], [0, 1], [0, 0]];
      tmpMesh.faces[1].uvs = [[0, 0], [0, 1], [1, 1], [1, 0]];

      var is = 0.1 / 8.0;

      // create outside faces first to help with Early-Z
      trans.clearStack();
      trans.translate([0, 0, -0.05]);
      _cvrmesh.booleanAdd(tmpMesh, trans);
      trans.clearStack();
      trans.translate([0, 0, 0.05]);
      _cvrmesh.booleanAdd(tmpMesh, trans);

      var p;

      for(var i = -0.05 + is; i < 0.05 - is; i += is) {
        trans.clearStack();
        trans.translate([0, 0, i]);
        _cvrmesh.booleanAdd(tmpMesh, trans);
        p++;
      }

      _cvrmesh.calcNormals();
      _cvrmesh.triangulateQuads();
      _cvrmesh.compile();

      Object.defineProperty(this, "mesh", {
        enumerable : true,
        get : function() {
          return _mesh;
        }
      });

      this.onComponentOwnerChanged = function(e) {
        if(e.data.previous === null && this.owner !== null) {
          service.registerComponent(this.owner.id, this);
        }

        if(this.owner === null && e.data.previous !== null) {
          service.unregisterComponent(e.data.previous.id, this);
        }
      };

      this.onEntityManagerChanged = function(e) {
        if(e.data.previous === null && e.data.current !== null && this.owner !== null) {
          service.registerComponent(this.owner.id, this);
        }

        if(e.data.previous !== null && e.data.current === null && this.owner !== null) {
          service.unregisterComponent(this.owner.id, this);
        }
      };

      this.prepare = function() {
        if(_mesh && _material && _mesh._cvr && _material._cvr) {
          _mesh.prepare({
            material : _material
          });
        } //if
      };
      //prepare

      _this.prepare();

    });
    
    var run = function() {

      // Make a new space for our entities
      var space = new engine.core.Space();

      // Make some entities and arrange them
      canvas = engine.graphics.target.element;

      var bitwall = new space.Entity({
        name : 'cube0',
        components : [new engine.core.component.Transform({
          position : math.Vector3(0, 0, 0),
          rotation : math.Vector3(0, 0, 0)
        }), new BitwallModel({ sprite: viking.sprites.thug1 })
        ]
      });

      var camera = new space.Entity({
        name : 'camera',
        components : [new engine.core.component.Transform({
          position : math.Vector3(0, 0, 2)
        }), new engine.graphics.component.Camera({
          active : true,
          width : canvas.width,
          height : canvas.height,
          fov : 60
        }), new engine.graphics.component.Light({
          intensity : 2
        })]
      });
      camera.find('Camera').target = math.Vector3(0, 0, 0);

      var task = new engine.scheduler.Task({
        schedule : {
          phase : engine.scheduler.phases.UPDATE
        },
        callback : function() {
          var delta = engine.scheduler.simulationTime.delta / 1000;
          bitwall.find('Transform').rotation = math.matrix4.add([bitwall.find('Transform').rotation, [0, math.TAU * delta * 0.1, 0]]);
        }
      });

      // Start the engine!
      engine.run();

    };
    
    viking.loadSprite('./thug1.sprite', {callback: run});
    
/*
    engine.core.resource.get([{
      type : SpriteSheet,
      url : "thug1.sprite",
      onsuccess : function(spriteSheet) {
        // XXXdmose spriteSheet is a Resource object, with one
        // "data" property which is the Sprite object itself.
        // Need to talk with ack about this API, I feel the
        // default loader should strip object and property in
        // the caller and just pass the Sprite.
        console.log("spriteSheet loaded");
      },
      onfailure : function(error) {
        console.log("spriteSheet load error" + error);
      }
    }], {
      oncomplete : run
    });
    
    */
  };

  gladius.create({
    debug : true,
    services : {
      graphics : {
        src : 'graphics/service',
        options : {
          canvas : canvas
        }
      }
    }
  }, game);

});
