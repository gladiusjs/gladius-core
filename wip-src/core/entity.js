if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  var guid = require( "common/guid" );
  var Event = require( "core/event" );

  var Entity = function( name, components, tags, parent ) {
    this.id = guid();
    this.name = name || "";
    this.active = false;
    this.parent = parent || null;
    this._children = {};
    this.space = null;
    this.size = 0;
    this._components = {};
    this.tags = tags || [];

    // Add components from the constructor list
    if( components ) {
      var i, l;
      for( i = 0, l = components.length; i < l; ++ i ) {
        var component = components[i];
        // Make sure all dependencies are satisfied
        // Note: Components with dependencies must appear after the components
        // they depend on in the list
        if( !this.hasComponent( component.dependsOn ) ) {
          throw new Error( "required component missing" );
        } else {
          this.addComponent.call( this, component );
        }
      }
    }
  };
  
  function addComponent( component ) {
    var previous = this.removeComponent( component.type );
    component.setOwner( this );
    this._components[component.type] = component;
    ++ this.size;
    
    var event = new Event( "EntityComponentAdded", component );
    event( this );
    return previous;
  }
  
  function removeComponent( type ) {
    var previous = null;
    if( this.hasComponent( type ) ) {
      previous = this._components[type];
      delete this._components[type];
      previous.setOwner( null );
      -- this.size;
      
      var event = new Event( "EntityComponentRemoved", previous );
      event( this );
    }
    return previous;
  }

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
  
  function setSpace( space ) {
    if( space !== this.space ) {
      var previous = this.space;
      this.space = space;
      
      var event = new Event( "EntitySpaceChanged",
          { previous: previous, current: space } );
      event( this );
    }
  }
  
  function setActive( value ) {
    var event;
    if( value && this.space ) {
      this.active = true;
      event = new Event( "ActivateComponent" );
    } else {
      this.active = false;
      event = new Event( "DeactivateComponent" );
    }
    event( this );
    
    return this;
  }
  
  function hasComponent( args ) {
    var i, l;
    var componentTypes = Object.keys( this._components );
    if( Array.isArray( args ) ) {
      if( args.length === 0 ) {
        return true;
      }
      for( i = 0, l = args.length; i < l; ++ i ) {
        if( componentTypes.indexOf( args[i] ) < 0 ) {
          return false;
        }
      }
    } else {
      if( componentTypes.indexOf( args ) < 0 ) {
        return false;
      }
    }
    return true;
  }

  function handleEvent( event ) {
    var componentTypes = Object.keys( this._components );
    var i, l;

    if( this["on" + event.type] ) {
      var handler = this["on" + event.type];
      try {
        handler.call( this, event );
      } catch( error ) {
        console.log( error );
      }
    }

    for( i = 0, l = componentTypes.length; i < l; ++ i ) {
      var componentType = componentTypes[i];
      var component = this._components[componentType];
      if( component.handleEvent ) {
        component.handleEvent.call( component, event );
      }
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
      setSpace: setSpace,
      setActive: setActive,
      hasComponent: hasComponent,
      addComponent: addComponent,
      removeComponent: removeComponent,
      handleEvent: handleEvent,
      onChildEntityAdded: onChildEntityAdded,
      onChildEntityRemoved: onChildEntityRemoved
  };

  return Entity;

});