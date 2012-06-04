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
    this.parent = null;
    this._children = {};
    this.space = null;
    this.size = 0;
    this._components = {};
    this.tags = tags || [];

    // Add components from the constructor list
    if( components && components.length > 0) {
      if (this.validateDependencies.call(this, components)){
        var i, l;
        for ( i = 0, l = components.length; i < l; ++ i){
          this.addComponent.call(this, components[i], true);
        }
      }else{
        throw new Error( "required component missing" );
      }
    }

    if( parent ) {
      this.setParent( parent );
    }
  };

  function addComponent( component, force ) {
    if (force || this.validateDependencies.call(this, component)){
      var previous = this.removeComponent( component.type );
      component.setOwner( this );
      this._components[component.type] = component;
      ++ this.size;

      var event = new Event( "EntityComponentAdded", component );
      event.dispatch( this );
      return previous;
    } else {
      throw new Error( "required component missing");
    }
  }

  function removeComponent( type ) {
    var previous = null;
    if( this.hasComponent( type ) ) {
      previous = this._components[type];
      delete this._components[type];
      previous.setOwner( null );
      -- this.size;
      
      var event = new Event( "EntityComponentRemoved", previous );
      event.dispatch( this );

      //We need to re-pack the internal components into an array so that
      //validate dependencies knows what to do with it
      var componentArray = [];
      var componentTypes = Object.keys(this._components);
      for(var comIndex = 0; comIndex < componentTypes.length; comIndex++){
        componentArray.push(this._components[componentTypes[comIndex]]);
      }
      //What we've done here is cause all of the existing components to be re-validated
      //now that one of them has been removed
      if (!this.validateDependencies.call({_components: []}, componentArray)){
        throw new Error( "required component removed from entity- component dependency missing");
      }
    }
    return previous;
  }

  function setParent( parent ) {
    var event;
    if( parent !== this.parent ) {
      if( this.parent ) {
        event = new Event( "ChildEntityRemoved", this );
        event.dispatch( this.parent );
      }
      
      var previous = this.parent;
      this.parent = parent;
      
      event = new Event( "EntityParentChanged",
          { previous: previous, current: parent } );
      event.dispatch( this );
      
      if( this.parent ) {
        event = new Event( "ChildEntityAdded", this );
        event.dispatch( this.parent );
      }
    }
  }
  
  function setSpace( space ) {
    if( space !== this.space ) {
      var previous = this.space;
      this.space = space;

      if (!this.space && this.active){
        setActive.call(this, false);
      }

      var event = new Event( "EntitySpaceChanged",
          { previous: previous, current: space } );
      event.dispatch( this );
    }
  }
  
  function setActive( value ) {
    var event;

    if (this.space){
      if( value) {
        this.active = true;
        event = new Event( "EntityActivationChanged", true );
      } else {
        this.active = false;
        event = new Event( "EntityActivationChanged", false );
      }
    } else {
      if (value){
        throw new Error( "Cannot set active to true on an entity that isn't in a space" );
      } else {
        this.active = false;
        event = new Event( "EntityActivationChanged", false);
      }
    }
    event.dispatch( this );
    
    return this;
  }

  function findComponent( type ) {
    if( this._components.hasOwnProperty( type ) ) {
      return this._components[type];
    }

    return null;
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
    } else if (args){
      if( componentTypes.indexOf( args ) < 0 ) {
        return false;
      }
    } else {
      return true;
    }
    return true;
  }

  //Check a list of components that we're going to add and make sure
  //that all components that they are dependent on either already exist in
  //this entity or are being added
  function validateDependencies(componentsToValidate){
    var componentTypes = Object.keys(this._components);
    if (Array.isArray(componentsToValidate)){
      componentsToValidate.forEach(
        function (component){
          componentTypes.push(component.type);
        }
      );
    }else{
      componentTypes.push(componentsToValidate.type);
      componentsToValidate = [componentsToValidate];
    }

    var component;
    for (var comIndex = 0; comIndex < componentsToValidate.length; comIndex++){
      component = componentsToValidate[comIndex];
      for (var depIndex = 0; depIndex < component.dependsOn.length; depIndex++){
        if (componentTypes.indexOf(component.dependsOn[depIndex]) < 0){
          return false;
        }
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
      findComponent: findComponent,
      hasComponent: hasComponent,
      addComponent: addComponent,
      removeComponent: removeComponent,
      validateDependencies: validateDependencies,
      handleEvent: handleEvent,
      onChildEntityAdded: onChildEntityAdded,
      onChildEntityRemoved: onChildEntityRemoved
  };

  return Entity;

});