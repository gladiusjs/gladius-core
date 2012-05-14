if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {

  var Extension = require( "base/extension" );

  return new Extension( "gladius-cubicvr", {
      
      services: {
        "renderer": {
          service: require( "services/renderer" ),
          components: {
            // "Camera": require( "components/camera" ),
            "Light": require( "components/light" )
          },
          resources: {
            "Mesh": require( "resources/mesh" ),
            // "MaterialDefinition": require( "resources/material-definition" )
          }
        }
      },
      
      components: {
        // "Model": require( "components/model" )
      },
      
      resources: {
        "LightDefinition": require( "resources/light-definition" )
      }
      
  });

});