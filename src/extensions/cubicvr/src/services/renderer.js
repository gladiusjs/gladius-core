if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {

  var Service = require( "base/service" );
  require( "extension-lib/CubicVR" );
  var Target = require( "services/target" );

  var Renderer = function( scheduler, options ) {
    options = options || {};
    
    var schedules = {
        "render": {
          tags: ["@render", "graphics"],
          dependsOn: []
        }
    };
    Service.call( this, scheduler, schedules );

    this.target = new Target( options.canvas );
  };

  function render() {
    var context = this.target.context;
    var gl = context.GLCore.gl;
    var spaces = {};
    var sIndex, sLength;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
      for( i = 0, l = lightEntities.length; i < l; ++ i ) {
        var lightComponent = lightEntities[i].find( "Light" );
        lightComponent.prepareForRender();
        cvrLights.push( lightComponent._cvr.light );
      }

      // Render the space for each camera
      for( i = 0, l = cameraEntities.length; i < l; ++ i ) {
        var cameraComponent = cameras[ i ].find( "Camera" );

        for( var mi = 0, ml = models.length; mi < ml; ++mi ) {
          model = models[ mi ].find( 'Model' );
          transform = models[ mi ].find( 'Transform' );
          camera.prepareForRender();

          context.renderObject(
              model.mesh._cvr.mesh,
              camera._cvr.camera,
              transform.absolute,
              cvrLights
          );
        }
      }
    }
  }

  Renderer.prototype = new Service();
  Renderer.prototype.constructor = Renderer;
  Renderer.prototype.render = render;

  return Renderer;

});