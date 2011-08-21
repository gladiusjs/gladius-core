/*jshint white: false, onevar: false, strict: false, plusplus: false */
/*global define: false, window: false, console: false */

define( function ( require ) {

  var CubicVR = require( 'CubicVR.js/CubicVR' ),
      lang = require( '../core/lang' );

  // CubicVR does not use define() to declare a module, just grab it
  // via global.
  CubicVR = this.CubicVR;

  function graphicsCubicVR( options ) {

    this.CubicVR = CubicVR;

    var mainCanvas, mainLoop;

    var scenesByName = {},
        scenesByIndex = [];

    options = options && options.graphics ? options.graphics : {};

    var gl = CubicVR.init( options.canvas, options.vertexShader, options.fragmentShader );
    if (!gl) {
      console.log('CubicVR Error: Could not init GL');
      return false;
    } //if

    mainCanvas = CubicVR.getCanvas();
    this.getCanvas = function() {
        return mainCanvas;
    };

    this.getWidth = function() {
        return mainCanvas.width;
    };

    this.getHeight = function() {
        return mainCanvas.height;
    };

    var layout = new CubicVR.Layout( {
        width: mainCanvas.width,
        height: mainCanvas.height
    } );

    this.getLayout = function() {
        return layout;
    };

    var mainLoopFunc = options && options.mainLoop ? options.mainLoop : function ( timer, gl ) {
        layout.render();
    };

    mainLoop = new CubicVR.MainLoop(mainLoopFunc);

    this.getScenes = function () {
      return scenesByName;
    };

    this.getScene = function ( name ) {
      return scenesByName[name];
    };

    // TODO: secretrobotron -> make this work (CubicVR needs help too)
    this.addScene = function ( scene ) {
      mainLoop.addScene(scene);
    };

    // TODO: secretrobotron -> make this work (CubicVR needs help too)
    this.removeScene = function ( scene ) {
      //mainLoop.removeScene(scene);
    };

    this.pushScene = function ( scene, options ) {
      scene = scene.graphics;
      options = options || {};
      mainLoop.pushSceneGroup({
        scenes: [scene],
        start: options.start,
        stop: options.stop,
        update: options.update
      });
    };

    this.popScene = function () {
      var scene = mainLoop.renderStack[mainLoop.renderStack.length-1].scenes[0];
      mainLoop.popSceneGroup();
      return scene;
    };

    this.pushSceneGroup = function ( scenes, options ) {
      options = options || {};
      mainLoop.pushSceneGroup({
        scenes: scenes,
        start: options.start,
        stop: options.stop,
        update: options.update
      });
    };

    this.popSceneGroup = function () {
      var scenes = mainLoop.renderStack[mainLoop.renderStack.length-1].scenes;
      mainLoop.popSceneGroup();
      return scenes;
    };

    /***
     * Mesh
     */
    var Mesh = this.Mesh = function ( options ) {
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
              scale: [1, 1, 1]
            },
            size: options.size
          });
        }
      };

      this.addPrimitive = function ( options ) {
        var type = options.type;
        if ( type in primitiveTypes ) {
          primitiveTypes[type](options);
        } //if
      };

      if ( options ) {
        if ( options.loadFrom ) {
          var mesh = CubicVR.loadMesh(options.loadFrom);
          this.booleanAdd( mesh );
        }

        if ( options.primitives ) {
          for ( var i=0, l=options.primitives.length; i<l; ++i ) {
            this.addPrimitive(options.primitives[i]);
          } //for
        } //if

        if ( options.finalize ) {
          this.prepare();
        } //if
      } //if

    }; //Mesh
    Mesh.prototype = new CubicVR.Mesh();
    Mesh.prototype.constructor = Mesh;

    /***
     * SceneObject
     */
    var SceneObject = this.SceneObject = function ( options ) {
      options = options || {};
      CubicVR.SceneObject.call(this, options.mesh, options.name);
      if ( options.position ) {
        this.position = options.position;
      }
      if ( options.rotation ) {
        this.rotation = options.rotation;
      }
    }; //ScenObject
    SceneObject.prototype = new CubicVR.SceneObject();
    SceneObject.prototype.constructor = SceneObject;

    /***
     * Camera
     */
    var Camera = this.Camera = function ( options ) {
      options = options || {};

      var cameraOptions = {
        width: options ? options.width : mainCanvas.width,
        height: options ? options.height : mainCanvas.height
      };

      lang.extend(cameraOptions, options);

      CubicVR.Camera.call(this, cameraOptions);

      if (!options || !options.target) {
        this.target = [this.position[0], this.position[1], this.position[2]-1];
      } //if

      this.setTargeted( ( options.targeted === undefined ? true : options.targeted ));

      this.getType = function () {
        return "Camera";
      };
    }; //Camera
    Camera.prototype = new CubicVR.Camera();
    Camera.prototype.constructor = Camera;

    /*
    var LayoutElement = this.LayoutElement = function( options ) {
        options = options || {};

        var texture = new CubicVR.Texture( options.texture );

        var layoutElementOptions = {
            texture: texture
        };

        lang.extend( layoutElementOptions, options );

        CubicVR.View.call( this, layoutElementOptions );
    };
    LayoutElement.prototype = new CubicVR.View();
    LayoutElement.prototype.constructor = LayoutElement;

    this.addLayoutElement = function( element ) {
        layout.addSubview( element );
    };

    this.removeLayoutElement = function( element ) {
        layout.removeSubview( element );
    };
    */

    /***
     * Scene
     */
    var Scene = this.Scene = function ( options ) {
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
            disable: options.disable
          };
        }
      };

      CubicVR.Scene.call(this, sceneOptions);

      var that = this;

      this.setCamera = function ( camera ) {
        that.camera = camera;
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

      if (options.resizable !== false) {
        CubicVR.addResizeable(this);
      }

    }; //Scene
    Scene.prototype = new CubicVR.Scene();
    Scene.prototype.constructor = Scene;

  } //system

  return graphicsCubicVR;
});
