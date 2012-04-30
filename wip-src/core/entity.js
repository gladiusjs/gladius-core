if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  var guid = require( "common/guid" );
  var Event = require( "core/event" );

  var Entity = function( name, components, parent ) {
    this.id = guid();
    this.name = name || "";
    this.active = false;
    this.parent = parent || null;
    this._children = {};
    this.manager = null;
    this.size = 0;
    this._components = {};

    // Add components from the constructor list
    if( components ) {
      var i, l;
      for( i = 0, l = components.length; i < l; ++ i ) {
        var component = components[i];
        // Make sure all dependencies are satisfied
        // Note: Components with dependencies must appear after the components
        // they depend on in the list
        if( !this.contains( component.dependsOn ) ) {
          throw new Error( "required component missing" );
        } else {
          this.addComponent( component );
        }
      }
    }    
  };

  function setParent( parent ) {
    var event;
    if( parent !== this.parent ) {
      if( this.parent ) {
        event = new Event( "ChildEntityRemoved", this );
        event( this.parent );
      }
      
      var previous = this.parent;
      this.parent = parent;
      
      event = new Event( "EntityParentChanged",
          { previous: previous, current: parent } );
      event( this );
      
      if( this.parent ) {
        event = new Event( "ChildEntityAdded", this );
        event( this.parent );
      }
    }
  }
  
  function setManager( manager ) {
    if( manager !== this.manager ) {
      var previous = this.manager;
      this.manager = manager;
      
      var event = new Event( "EntityManagerChanged",
          { previous: previous, current: manager } );
      event( this );
    }
  }
  
  function setActive( value ) {
    var event;
    if( value && this.manager ) {
      this.active = true;
      event = new Event( "ActivateComponent" );
    } else {
      this.active = false;
      event = new Event( "DeactivateComponent" );
    }
    event( this );
    
    return this;
  }

  function handleEvent( event ) {
    var componentTypes = Object.keys( this._components );
    var i, l;

    if( "on" + event.type in this ) {
      var handler = this["on" + event.type];
      try {
        handler.call( this, event );
      } catch( error ) {
        console.log( error );
      }
    }

    for( i = 0, l = componentTypes.length; i < l; ++ i ) {
      var componentType = componentsTypes[i];
      var component = this._components[componentType];
      component.handleEvent.call( component, event );
    }
  }
  
  function onChildEntityAdded( event ) {
    var child = event.data;
    this._children[child.id] = child;
  }
  
  function onChildEntityRemoved( event ) {
    var child = event.data;
    delete this._children[child.id];
  }

  Entity.prototype = {
      setParent: setParent,
      setManager: setManager,
      setActive: setActive,
      handleEvent: handleEvent,
      onChildAdded: onChildAdded,
      onChildRemoved: onChildRemoved
  };

  return Entity;

});