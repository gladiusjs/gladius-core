/*global engine:false, define:false, viking:false */

/* XXX we get the engine instance from the global scope. some upcoming
 * refactoring will fix this.
 */

/* 
 * BitWallModel is an animated 3d model created by taking a 2d sprite image
 * from the F1LT3R's Sprite-Viking Blitr library and extruding it into 
 * 3 dimensions creating a layered look.
 * 
 * Sprite-Viking Blitr sprite sheets offer a set of actions for each sprite
 * sheet, each comprised of a number of animation frames.  
 * 
 * Calling myBitwallModel.updateAction will update the model to the next
 * frame of the specified action.
 * 
 * Thanks to the NoComply demo's CubicVR-bitmap_cube_array.js' for the
 * much of the following code.
 */

// define this module to depend on sprite-viking-blitr 
define(['sprite-viking-blitr'], function() {

  var BitwallModel = engine.base.Component({
    type : 'Model',
    depends : ['Transform']
  }, function(options) {
    options = options || {};
    var that = this;
    var service = engine.graphics;
    var CubicVR = service.target.context;
    var gl = CubicVR.GLCore.gl;

    // XXX This is super fragile and depends on the sprite JSON file being
    // named with the same prefix that is used inside the JSON file as "name"
    // property (which is what viking uses to expose the loaded sprite on
    // viking's global object).
    var spriteName = options.spriteURL.split(".")[0];
    
    // We use a single texture, and animate the bitwall by updating the image
    // on it.
    var texture = new CubicVR.Texture();    

    // Update the texture for the bitwall by setting it to the next frame 
    // of the given action.  This has the side effect of incrementing the next
    // frame pointer inside the action.
    function updateTexture(action) {
      gl.bindTexture(gl.TEXTURE_2D, CubicVR.Textures[texture.tex_id]);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                    viking.sprites[spriteName][action].frame());
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
    

    // Set the bitwall to a particular action (which encompasses a set of
    // animation frames), and update the texture to the next frame of that
    // action.  Note that if the action param is omitted, the existing
    // action will update to the next frame.
    this.currentAction = options.action || null;
    this.updateAction = function(action) {
      that.currentAction = action || that.currentAction;
      updateTexture(that.currentAction);
    };

    function buildMaterial() {
      texture.setFilter(CubicVR.enums.texture.filter.NEAREST);
      texture.use();
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      updateTexture(that.currentAction);
      return new engine.graphics.resource.Material({
        color : [1, 1, 1],
        textures : {
          color : texture
        }
      });
    }

    function buildMesh(material) {
      
      var _cvrmat = material._cvr.material;

      // gladius Mesh object that we will return
      var mesh = new engine.graphics.resource.Mesh();
      var _cvrmesh = mesh._cvr.mesh; // CubicVR Mesh that it wraps 

      // The work of building the mesh of stacked sprites is all done using
      // CubicVR primitives into the wrapped CVR Mesh.
      var transform = new CubicVR.Transform();
      transform.clearStack();
      transform.scale([1, 1, 1]);

      var tmpMesh = new CubicVR.Mesh();
      CubicVR.genPlaneObject(tmpMesh, 1.0, _cvrmat);

      tmpMesh.faces[0].uvs = [[1, 0], [1, 1], [0, 1], [0, 0]];
      tmpMesh.faces[1].uvs = [[0, 0], [0, 1], [1, 1], [1, 0]];

      var is = 0.1 / 8.0;

      // create outside faces first to help with Early-Z
      transform.clearStack();
      transform.translate([0, 0, -0.05]);
      _cvrmesh.booleanAdd(tmpMesh, transform);
      transform.clearStack();
      transform.translate([0, 0, 0.05]);
      _cvrmesh.booleanAdd(tmpMesh, transform);

      var p;

      for (var i = -0.05 + is; i < 0.05 - is; i += is) {
        transform.clearStack();
        transform.translate([0, 0, i]);
        _cvrmesh.booleanAdd(tmpMesh, transform);
        p++;
      }

      _cvrmesh.calcNormals();
      _cvrmesh.triangulateQuads();
      _cvrmesh.compile();

      return mesh;
    }

    // stuff we're going to build up after we load
    var material;
    this.mesh = null;
    
    // Loads spriteURL (expected to have been passed in via options) into 
    // viking.  Once this completes the model is constructed and initialized,
    // and the callback is called.
    this.init = function bitwallModelInit(callback) {
      
      function callbackWrapper() {

        // now that the sprite has loaded, we can build our material and mesh
        material = buildMaterial();
        that.mesh = buildMesh(material);
        
        // tell the caller that we're all done!
        callback();
      }
      viking.loadSprite(options.spriteURL, {callback: callbackWrapper});
    };


    // The remaining bits are boilerplate code taken from the generic model
    // code so that this object behaves the way the engine expects.

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
      if(that.mesh && material && that.mesh._cvr && material._cvr) {
        that.mesh.prepare({
          material : material
        });
      } //if
    };
    //prepare

    that.prepare();

  });
  return BitwallModel;
});
