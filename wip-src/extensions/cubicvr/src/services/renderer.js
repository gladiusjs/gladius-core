if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {

  var Service = require( "base/service" );
  require( "extension-lib/CubicVR" );
  var Target = require( "services/target" );

  var Renderer = function( engine, scheduler, canvas ) {
    var schedules = {
        "render": {
          tags: ["graphics"],
          dependsOn: ["@render"]
        }
    };
    Service.call( this, scheduler, "Renderer", schedules );

    this.engine = engine;
    this.target = new Target( canvas );
  };

  function render() {
    var gl = this.target.context.GLCore.gl;
    var spaces = {};
    var sIndex, sLength;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // TD: This is quick and dirty and not the most efficient
    var cameraOwnerIds = Object.keys( this.registeredComponents["Camera"] || {} );
    cameraOwnerIds.forEach( function( id ) {
      var ownerSpace = this.registeredComponents["Camera"][id].owner.space;
      if( !spaces.hasOwnProperty( ownerSpace.id ) ) {
        spaces[ownerSpace.id] = ownerSpace;
      }
    });
    var spaceIds = Object.keys( spaces );

    for( sIndex = 0, sLength = spaces.length; sIndex < sLength; ++ sIndex ) {
      var space = spaces[sIndex];
      var i, l;
      var cameraEntities = space.findAllWith( "Camera" );
      var modelEntities = space.findAllWith( "Model" );
      var lightEntities = space.findAllWith( "Light" );
      
      // Handle lights for the current space

      var cvrLights = [];
      for( var li = 0, ll = lights.length; li < ll; ++li ) {
        var lightComponent = lights[ li ].find( 'Light' );
        lightComponent.prepareForRender();
        cvrLights.push( lightComponent._cvr.light );
      } //for lights

      for( var ci = 0, cl = cameras.length; ci < cl; ++ci ) {
        camera = cameras[ ci ].find( 'Camera' );

        if( camera.active ) {
          for( var mi = 0, ml = models.length; mi < ml; ++mi ) {

            model = models[ mi ].find( 'Model' );
            transform = models[ mi ].find( 'Transform' );
            camera.prepareForRender();

            _target.context.renderObject(
              model.mesh._cvr.mesh,
              camera._cvr.camera,
              transform.absolute,
              cvrLights
            );

          } //for models
        } //if

      } //for cameras

    }

    /*
    var scenes = {},
      scene,
      cameras,
      camera,
      models,
      model,
      transform,
      lights,
      gl = _target.context.GLCore.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // TD: This is quick and dirty and not the most efficient
    var cameraEntities = Object.keys( that.components.Camera || {} );
    cameraEntities.forEach( function( id ) {
      if( !scenes.hasOwnProperty( that.components.Camera[id].owner.manager.id ) ) {
        scenes[that.components.Camera[id].owner.manager.id] =
          that.components.Camera[id].owner.manager;
      }
    });
    var sceneIDs = Object.keys( scenes );

    for( var si = 0, sl = sceneIDs.length; si < sl; ++si ) {
      scene = scenes[ sceneIDs[si] ];
      cameras = scene.findAllWith( 'Camera' );
      models = scene.findAllWith( 'Model' );
      lights = scene.findAllWith( 'Light' );

      var cvrLights = [];
      for( var li = 0, ll = lights.length; li < ll; ++li ) {
        var lightComponent = lights[ li ].find( 'Light' );
        lightComponent.prepareForRender();
        cvrLights.push( lightComponent._cvr.light );
      } //for lights

      for( var ci = 0, cl = cameras.length; ci < cl; ++ci ) {
        camera = cameras[ ci ].find( 'Camera' );

        if( camera.active ) {
          for( var mi = 0, ml = models.length; mi < ml; ++mi ) {

            model = models[ mi ].find( 'Model' );
            transform = models[ mi ].find( 'Transform' );
            camera.prepareForRender();

            _target.context.renderObject(
              model.mesh._cvr.mesh,
              camera._cvr.camera,
              transform.absolute,
              cvrLights
            );

          } //for models
        } //if

      } //for cameras

    } //for scenes

    ++_renderedFrames;

     */

  }

  Renderer.prototype = new Service();
  Renderer.prototype.constructor = Renderer;
  Renderer.prototype.render = render;

});