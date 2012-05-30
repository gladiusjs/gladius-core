if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  function Space( clock ) {
    // This will normally be the system simulation clock, but for a UI space
    // it might be the realtime clock instead.
    this.clock = new Clock( clock.signal ); // This clock controls updates for
                                            // all entities in this space
    this.id = guid();
    this.size = 0; // The number of entities in this space

    this._entities = {}; // Maps entity ID to object
    this._nameIndex = {}; // Maps name to entity ID
    this._tagIndex = {}; // Maps tag to entity ID
  }

  var guid = require( "common/guid" );
  var Entity = require( "core/entity" );
  var Clock = require( "core/clock" );

  function add( entity ) {
    var i, l;

    this._entities[entity.id] = entity;
    entity.space = this;
    ++ this.size;

    if( entity.name ) {
      if( !this._nameIndex.hasOwnProperty( entity.name ) ) {
        this._nameIndex[entity.name] = [];
      }
      this._nameIndex[entity.name].push( entity.id );
    }

    if( entity.tags ) {
      for( i = 0, l = entity.tags.length; i < l; ++ i ) {
        var tag = entity.tags[i];
        if( !this._tagIndex.hasOwnProperty( tag ) ) {
          this._tagIndex[tag] = [];
        }
        this._tagIndex[tag].push( entity.id );
      }
    }

    // Recursively add child entities to the space
    if( entity._children ) {
      for( var childId in entity._children ){
        this.add.call( this, entity._children[childId] );
      }
    }

    return this;
  }

  function remove( entity ) {
    var i, l;

    if( this._entities.hasOwnProperty( entity.id ) ) {
      delete this._entities[entity.id];
      entity.space = null;
      -- this.size;

      if( entity.name ) {
        if( this._nameIndex.hasOwnProperty( entity.name ) ) {
          delete this._nameIndex[entity.name];
        }
      }

      if( entity.tags ) {
        for( i = 0, l = entity.tags.length; i < l; ++ i ) {
          var tag = entity.tags[i];
          delete this._tagIndex[entity.id];
        }
      }

      // Recursively remove child entities from the space
      if( entity._children ) {
        for( var childId in entity._children ){
          this.remove.call( this, entity._children[childId] );
        }
      }
    } else {
      throw new Error("attempted to remove unavailable entity " +
        entity.toString());
    }

    return this;
  }
  
  function findNamed( name ) {
    if( this._nameIndex.hasOwnProperty( name ) ) {
      var id = this._nameIndex[name][0];
      return this._entities[id];
    }
    
    return null;
  }
  
  function findAllNamed( name ) {
    var i, l;
    if( this._nameIndex.hasOwnProperty( name ) ) {
      var ids = this._nameIndex[name];
      var result = [];
      for( i = 0, l = ids.length; i < l; ++ i ) {
        var id = ids[i];
        result.push( this._entities[id] );
      }
      return result;
    }
    
    return [];
  }
  
  function findTagged( tag ) {
    if( this._tagIndex.hasOwnProperty( tag ) ) {
      var id = this._tagIndex[tag][0];
      return this._entities[id];
    }
    
    return null;
  }
  
  function findAllTagged( tag ) {
    var i, l;
    if( this._tagIndex.hasOwnProperty( tag ) ) {
      var ids = this._tagIndex[tag];
      var result = [];
      for( i = 0, l = ids.length; i < l; ++ i ) {
        var id = ids[i];
        result.push( this._entities[id] );
      }
      return result;
    }
    
    return [];
  }
  
  function findWith( type ) {
    var i, l;
    var entityIds = Object.keys( this._entities );
    for( i = 0, l = entityIds.length; i < l; ++ i ) {
      var id = entityIds[i];
      var entity = this._entities[id];
      if( entity.hasComponent( type ) ) {
        return entity;
      }
    }
    
    return null;
  }
  
  function findAllWith( type ) {
    var i, l;
    var result = [];
    var entityIds = Object.keys( this._entities );
    for( i = 0, l = entityIds.length; i < l; ++ i ) {
      var id = entityIds[i];
      var entity = this._entities[id];
      if( entity.hasComponent( type ) ) {
        result.push( entity );
      }
    }
    
    return result;
  }

  Space.prototype = {
      add: add,
      remove: remove,
      findNamed: findNamed,
      findAllNamed: findAllNamed,
      findTagged: findTagged,
      findAllTagged: findAllTagged,
      findWith: findWith,
      findAllWith: findAllWith
  };

  return Space;

});