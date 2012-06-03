if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function ( require ) {

  var Service = require( "base/service" );
  var Event = require( "core/event" );

  var Updater = function( scheduler, options ) {
    options = options || {};
    
    var schedules = {
        "update": {
          tags: ["@update", "logic"],
          dependsOn: ["physics"]
        }
    };
    Service.call( this, scheduler, schedules );
  };

  function update() {
    var registeredComponents = this._registeredComponents;

    // Update all logic components
    var component;
    var updateEvent = new Event( 'Update', false );
    for( var componentType in registeredComponents ) {
      for( var entityId in registeredComponents[componentType] ) {
        component = registeredComponents[componentType][entityId];
        while( component.handleQueuedEvent() ) {}
        updateEvent.dispatch( component );
      }
    }
  }

  Updater.prototype = new Service();
  Updater.prototype.constructor = Updater;
  Updater.prototype.update = update;

  return Updater;

});