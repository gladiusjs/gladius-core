if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  var Component = require( "base/component" );
  var extend = require( "common/extend" );

  var Actor = function( service, eventMap ) {
    Component.call( this, "Logic", service, [] );

    eventMap = eventMap || {};

    // Set up event handlers
    var i, l;
    var eventNames = Object.keys( eventMap );
    for( i = 0, l = eventNames.length; i < l; ++ i ) {
      var eventName = eventNames[i];
      this["on" + eventName] = eventMap[eventName];
    }
  };
  Actor.prototype = new Component();
  Actor.prototype.constructor = Actor;

  function onEntitySpaceChanged( event ) {
    var data = event.data;
    if( data.previous === null && data.current !== null && this.owner !== null ) {
      this.provider.registerComponent( this.owner.id, this );
    }

    if( data.previous !== null && data.current === null && this.owner !== null ) {
      this.provider.unregisterComponent( this.owner.id, this );
    }
  }

  function onComponentOwnerChanged( event ) {
    var data = event.data;
    if( data.previous === null && this.owner !== null ) {
      this.provider.registerComponent( this.owner.id, this );
    }

    if( this.owner === null && data.previous !== null ) {
      this.provider.unregisterComponent( data.previous.id, this );
    }
  }

  function onEntityActivationChanged( event ) {
    var active = event.data;
    if( active ) {
      this.provider.registerComponent( this.owner.id, this );
    } else {
      this.provider.unregisterComponent( this.owner.id, this );
    }
  }

  var prototype = {
    onEntitySpaceChanged: onEntitySpaceChanged,
    onComponentOwnerChanged: onComponentOwnerChanged,
    onEntityActivationChanged: onEntityActivationChanged
  };
  extend( Actor.prototype, prototype );

  return Actor;

});