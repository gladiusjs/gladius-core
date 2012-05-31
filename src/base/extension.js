if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {

  var Extension = function( name, options ) {
    if( typeof name !== "string" || name.length === 0 ) {
      throw new Error( "extension needs a non-trivial name" );
    }
    this.name = name;

    options = options || {};
    var serviceNames, serviceName, service;
    var componentNames, componentName, component;
    var resourceNames, resourceName, resource;
    var i, l;
    var j, m;

    this.services = {};
    if( options.hasOwnProperty( "services" ) ) {
      serviceNames = Object.keys( options.services );
      for( i = 0, l = serviceNames.length; i < l; ++ i ) {
        serviceName = serviceNames[i];
        service = options.services[serviceName];
        if( typeof service === "function" ) {
          this.services[serviceName] = service;
        } else if( typeof service === "object" ) {
          this.services[serviceName] = {};
          this.services[serviceName].service = service.service;

          if( service.hasOwnProperty( "components" ) ) {
            this.services[serviceName].components = {};
            componentNames = Object.keys( service.components );
            for( j = 0, m = componentNames.length; j < m; ++ j ) {
              componentName = componentNames[j];
              this.services[serviceName].components[componentName] = service.components[componentName];
            }
          }

          if( service.hasOwnProperty( "resources" ) ) {
            this.services[serviceName].resources = {};
            resourceNames = Object.keys( service.resources );
            for( j = 0, m = resourceNames.length; j < m; ++ j ) {
              resourceName = resourceNames[j];
              this.services[serviceName].resources[resourceName] = service.resources[resourceName];
            }
          }
        } else {
          throw new Error( "malformed extension" );
        }
      }
    }

    this.components = {};
    if( options.hasOwnProperty( "components" ) ) {
      this.components = options.components;
    }

    this.resources = {};
    if( options.hasOwnProperty( "resources" ) ) {
      this.resources = options.resources;
    }
  };

  return Extension;

});