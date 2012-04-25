define( function( require ) {
  
  var Event = require( "event" );

  var Component = function( type, provider, dependsOn, task ) {
    this.type = type;
    this.dependsOn = dependsOn || [];
    this.owner = null;
    this._task = task;
    this.provider = provider;
    this._queuedEvents = [];
  };

  function setOwner( owner ) {
    if( owner != this.owner ) {
      var previous = this.owner;
      this.owner = owner;
      var event = new Event({
        type: 'ComponentOwnerChanged',
        queue: false,
        data: {
          current: value,
          previous: previous
        }
      });
      event( this );
    }
  }

  function handleEvent( event ) {

  }

  function handleQueuedEvent() {

  }

  Component.prototype = {
      setOwner: setOwner,
      handleEvent: handleEvent
  };

  return Component;

});