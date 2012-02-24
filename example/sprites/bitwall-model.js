/*global engine:false, define:false */

/* XXX we get the engine instance from the global scope. some upcoming
 * refactoring will fix this.
 */

define(function() {

  var BitwallModel = engine.base.Component({
    type : 'Model',
    depends : ['Transform']
  }, function(options) {
    options = options || {};
    var _this = this;
    var service = engine.graphics;
    var CubicVR = service.target.context;

    var _mesh = new engine.graphics.resource.Mesh();
    var _cvrmesh = _mesh._cvr.mesh;
    var _material;


    // Thanks to the NoComply demo's CubicVR-bitmap_cube_array.js' for the
    // much of the following code

    var gl = CubicVR.GLCore.gl;
    var tex = new CubicVR.Texture();    
    var _sprite = options.sprite;

    // Update the texture by setting it to the next frame of a specific action.
    // Note the reading it by calling .frame() increments has the side-effect
    // of incrementing the next pointer
    function _updateTexture(action) {
      gl.bindTexture(gl.TEXTURE_2D, CubicVR.Textures[tex.tex_id]);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                    _sprite[action].frame());
      gl.bindTexture(gl.TEXTURE_2D, null);
    }

    // Set the bitwall to a particular action (which encompasses a set of
    // animation frames), and update the texture to the next frame of that 
    // action.  Note that if the action param is omitted, the existing action
    // will continue stepping.
    var _action = options.action || null;
    this.updateAction = function(action) {
      _action = action || _action;
      _updateTexture(_action);
    };

    
    function buildMaterial() {

      tex.setFilter(CubicVR.enums.texture.filter.NEAREST);
      tex.use();
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      _updateTexture(_action);
      _material = new engine.graphics.resource.Material({
        color : [1, 1, 1],
        textures : {
          color : tex
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
    }

    buildMaterial();
    buildMesh();

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
  return BitwallModel;
});
