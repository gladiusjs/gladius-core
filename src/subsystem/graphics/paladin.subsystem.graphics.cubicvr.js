(function (window, document, undefined, Paladin, CubicVR) {

  var mainCanvas, mainLoop;

  var scenesByName = {},
      scenesByIndex = [];

  function extend ( object, extra ) {
    for ( var prop in extra ) {
      if ( extra.hasOwnProperty(prop) ) {
        object[prop] = extra[prop];
      } //if
    } //for
  } //extend

  /*************************************************************
   * Mesh
   */
  function Mesh ( options ) {
    var name = options ? options.name : undefined;
    CubicVR.Mesh.call(this, name);

    var that = this;

    var primitiveTypes = {
      'box': function (options) {
        CubicVR.primitives.box({
          mesh: that,
          material: new CubicVR.Material(options.material),
          transform: options.transform,
          uvmapper: options.uvmapper || {
            projectionMode: CubicVR.enums.uv.projection.CUBIC,
            scale: [1, 1, 1],
          },
          size: options.size,
        });
      },
    };

    this.addPrimitive = function ( options ) {
      var type = options.type;
      if ( type in primitiveTypes ) {
        primitiveTypes[type](options);
      } //if
    };

    if ( options ) {
      if ( options.primitives ) {
        for ( var i=0, l=options.primitives.length; i<l; ++i ) {
          this.addPrimitive(options.primitives[i]);
        } //for
      } //if 

      if ( options.finalize ) {
        this.prepare();
      } //if
    } //if

  } //Mesh
  Mesh.prototype = CubicVR.Mesh.prototype;
  Mesh.prototype.constructor = Mesh;

  /*************************************************************
   * SceneObject
   */
  function SceneObject ( options ) {
    CubicVR.SceneObject.call(this, options.mesh, options.name);
  } //ScenObject
  SceneObject.prototype = CubicVR.SceneObject.prototype;
  SceneObject.prototype.constructor = SceneObject;

  /*************************************************************
   * Scene
   */
  function Camera ( options ) {
    var cameraOptions = {
      width: options ? options.width : mainCanvas.width,
      height: options ? options.height : mainCanvas.height,
    };

    extend(cameraOptions, options);

    CubicVR.Camera.call(this, cameraOptions);

    if (!options || !options.target) {
      this.target = [this.position[0], this.position[1], this.position[2]-1];
    } //if

    this.getType = function () {
      return "Camera";
    };
  } //Camera
  Camera.prototype = CubicVR.Camera.prototype;
  Camera.prototype.constructor = Camera;

  /*************************************************************
   * Scene
   */
  function Scene ( options ) {
    var sceneOptions = {
      width: options.width || mainCanvas.width,
      height: options.height || mainCanvas.height,
      name: options.name || "scene" + scenesByIndex.length + "" + Date.now(),
      fov: options.fov || 45,

      //TODO: secretrobotron -> decide how to accept update functions
      setup: options.setup || function (scene) {
        scene.camera.position = [0, 0, 0];
        scene.camera.target = [0, 0, 1];
        return {
          update: options.update || function (timer, gl) {
            scene.evaluate(timer.getSeconds());
            scene.updateShadows();
          },
          enable: options.enable,
          disable: options.disable,
        };
      },
    };

    CubicVR.Scene.call(this, sceneOptions);

    var that = this;

    this.setCamera = function ( camera ) {
      scene.camera = camera;
    };

    this.pause = function () {
      that.paused = true;
    };

    this.resume = function () {
      that.paused = false;
    };

    this.getType = function () {
      return "Scene";
    };

    options.resizable !== false && CubicVR.addResizeable(this);

  } //Scene
  Scene.prototype = CubicVR.Scene.prototype;
  Scene.prototype.constructor = Scene;

  /*************************************************************
   * subsystem api object
   */
  var system = {

    start: function (options) {

      var gl = CubicVR.init();
      if (!gl) {
        console.log('CubicVR Error: Could not init GL');
        return false;
      } //if

      mainCanvas = CubicVR.getCanvas();

      var mainLoopFunc = options && options.mainLoop ? options.mainLoop : function ( timer, gl ) {
      };

      mainLoop = new CubicVR.MainLoop(mainLoopFunc);
      
      return true;
    },

    getScenes: function () {
      return scenesByName;
    },

    getScene: function ( name ) {
      return scenesByName[name];
    },

    // TODO: secretrobotron -> make this work (CubicVR needs help too)
    addScene: function ( scene ) {
      mainLoop.addScene(scene);
    },

    // TODO: secretrobotron -> make this work (CubicVR needs help too)
    removeScene: function ( scene ) {
      //mainLoop.removeScene(scene);
    },

    pushScene: function ( scene, options ) {
      mainLoop.pushSceneGroup({
        scenes: [scene],
        start: options.start,
        stop: options.stop,
        update: options.update,
      });
    },

    popScene: function () {
      var scene = mainLoop.renderStack[mainLoop.renderStack.length-1].scenes[0];
      mainLoop.popSceneGroup();
      return scene;
    },

    pushSceneGroup: function ( scenes, options ) {
      mainLoop.pushSceneGroup({
        scenes: scenes,
        start: options.start,
        stop: options.stop,
        update: options.update,
      });
    },

    popSceneGroup: function () {
      var scenes = mainLoop.renderStack[mainLoop.renderStack.length-1].scenes;
      mainLoop.popSceneGroup();
      return scenes;
    },

    Scene: Scene,
    Camera: Camera,
    Mesh: Mesh,
    SceneObject: SceneObject,
  }; //system

  Paladin.subsystem.register( "graphics", system );

})(window, document, undefined, Paladin, CubicVR);
