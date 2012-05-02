if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {

  var Extension = require( "base/extension" );

  return new Extension({
      
      services: {
        "render": require( "services/render" )
      },
      
      components: {
        "Model": require( "components/model" ),
        "Camera": require( "components/camera" ),
        "Light": require( "components/light" )
      },
      
      resources: {
        "MaterialDefinition": require( "resources/material-definition" ),
        "Mesh": require( "resources/mesh" ),
        "LightDefinition": require( "resources/light-definition" ),
        "Texture": require( "resources/texture" )
      }
      
  });

});