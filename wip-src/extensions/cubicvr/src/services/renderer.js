if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {

  var Service = require( "base/service" );

  var Renderer = function( scheduler ) {
    var schedules = {
        "render": {
          tags: ["graphics"],
          dependsOn: ["@render"]
        }
    };
    Service.call( this, scheduler, "Renderer", schedules, undefined );
  };
  Renderer.prototype = new Service();
  Renderer.prototype.constructor = Renderer;

});