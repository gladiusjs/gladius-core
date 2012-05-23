if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  var Event = require( "core/event" );

  var Component = function( type, provider, dependsOn ) {
    this.type = type; // String identifying the type of this component
    this.provider = provider; // Reference to the object instance that provides
                              // this component
    this.dependsOn = dependsOn || []; // List of component types that this
                                      // component depends on
    this.owner = null; // Reference to the entity instance that owns this
    this._queuedEvents = []; // List of queued events
  };

  function setOwner( owner ) {
    if( owner !== this.owner ) {
      var previous = this.owner;
      this.owner = owner;
      var event = new Event(
        'ComponentOwnerChanged',
        {
          current: owner,
          previous: previous
        },
        false
      );
      event.dispatch( this );
    }
  }

  function handleEvent( event ) {
    if( "on" + event.type in this ) {
      if( event.queue ) {
        this._queuedEvents.push( event );
      } else {
        var handler = this["on" + event.type];
        try {
          handler.call( this, event );
        } catch( error ) {
          console.log( error );
        }
      }
    }
  }

  function handleQueuedEvent() {
    if( this._queuedEvents.length > 0 ) {
      var event = this._queuedEvents.shift();
      if( "on" + event.type in this ) {
        var handler = this["on" + event.type];
        try {
          handler.call( this, event );
        } catch( error ) {
          console.log( error );
        }
      }
    }
    return this._queuedEvents.length;
  }

  Component.prototype = {
      setOwner: setOwner,
      handleEvent: handleEvent,
      handleQueuedEvent: handleQueuedEvent
  };

  return Component;

});