if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  var Task = require( "core/function-task" );

  var Service = function( scheduler, schedules, dependsOn ) {
    this._schedules = schedules || {};
    this.dependsOn = dependsOn || [];
    this._tasks = {};
    this._registeredComponents = {};

    if( scheduler ) {
      var i, l;
      var callbackNames = Object.keys( this._schedules );
      for( i = 0, l = callbackNames.length; i < l; ++ i ) {
        var callbackName = callbackNames[i];
        if( !this[callbackName] ) {
          throw new Error( "missing scheduler target: " + callbackName );
        }
        var schedule = this._schedules[callbackName] || {};
        // Create a new task to run this callback
        this._tasks[callbackName] = new Task( scheduler, this[callbackName],
            schedule, this );
        this._tasks[callbackName].start();
      }
    }
  };
  
  function registerComponent( id, component ) {
    if( !this._registeredComponents.hasOwnProperty( component.type ) ) {
      this._registeredComponents[component.type] = {};
    }
    this._registeredComponents[component.type][id] = component;
    
    return this;
  }
  
  function unregisterComponent( id, component ) {
    if( this._registeredComponents.hasOwnProperty( component.type ) &&
        this._registeredComponents[component.type].hasOwnProperty( id ) ) {
      delete this._registeredComponents[component.type][id];
    }
    
    return this;
  }
  
  function suspend() {
    var i, l;
    var taskNames = Object.keys( this._tasks );
    for( i = 0, l = taskNames.length; i < l; ++ i ) {
      var taskName = taskNames[i];
      this._tasks[taskName].pause();
    }
    
    return this;
  }
  
  function resume() {
    var i, l;
    var taskNames = Object.keys( this._tasks );
    for( i = 0, l = taskNames.length; i < l; ++ i ) {
      var taskName = taskNames[i];
      var schedule = this._schedules[taskName] || {};
      this._tasks[taskName].start( schedule );
    }
    
    return this;
  }
  
  function handleEvent( event ) {
    var i, l;

    if( "on" + event.type in this ) {
      var handler = this["on" + event.type];
      try {
        handler.call( this, event );
      } catch( error ) {
        console.log( error );
      }
    }
  }

  Service.prototype = {
      registerComponent: registerComponent,
      unregisterComponent: unregisterComponent,
      suspend: suspend,
      resume: resume,
      handleEvent: handleEvent
  };

  return Service;

});