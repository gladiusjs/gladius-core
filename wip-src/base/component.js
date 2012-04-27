define( function( require ) {

  var Event = require( "event" );

  var Component = function( type, provider, dependsOn ) {
    this.type = type;
    this.provider = provider;
    this.dependsOn = dependsOn || [];
    this.owner = null;
    this._queuedEvents = [];
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
      event( this );
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