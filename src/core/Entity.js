/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

  var SpatialComponent = require( './SpatialComponent' );

  /***
   * Entity
   *
   * An entity is a basic game object. It is a container object for components. Each
   * entity has a unique identifier.
   */
  var nextEntityId = 0;   // FIXME(alan.kligman@gmail.com): This is a hack.
  function Entity( paladin, options ) {

      var id = nextEntityId ++,
          componentsByType = {},
          parent = null,
          that = this,
          i;

      this.children = [];

      this.spatial = new SpatialComponent( paladin );

      this.getId = function() {
          return id;
      };

      this.listen = function( options ) {
          paladin.messenger.listen( {
              entity: that,
              event: options.event,
              callback: options.callback,
              parameters: options.parameters || [],
              persistent: options.persistent || true
          } );
      };

      this.ignore = function( options ) {
          paladin.messenger.ignore( {
              entity: that,
              event: options.event
          } );
      };

      this.send = function( options ) {
          paladin.messenger.send( {
              event: options.event,
              parameters: options.parameters || []
          } );
      };

      this.addComponent = function( component ) {
          var componentType = component.getType();
          if( !componentsByType.hasOwnProperty( componentType ) )
              componentsByType[componentType] = [];
          componentsByType[componentType].push( component );
          component.onAdd( this );
      };

      this.removeComponent = function( component ) {
          var componentType = component.getType();
          if( componentsByType.hasOwnProperty( componentType ) ) {
              for( var i = 0; i < componentsByType[componentType].length; ++ i ) {
                  if( component === componentsByType[componentType][i] ) {
                      component.onRemove( this );
                      componentsByType[componentType].remove( i );
                      break;
                  }
              }
          }
      };

      this.getComponents = function( componentType, subType ) {
          var components,
            i;
          if( componentType && componentsByType.hasOwnProperty( componentType ) ) {
              components = componentsByType[ componentType ];
              if ( components && subType ) {
                  for( i = 0; i < components.length; ++ i ) {
                      if ( components[i].subtype.indexOf( subType ) > -1 ) {
                          return components[i];
                      }
                  }
              }
              return components;
          }
          else {
              components = [];
              for( i = 0; i < componentsByType.length; ++ i ) {
                  components.concat( componentsByType[i] );
              }
              return components;
          }
      };

      this.hasComponent = function( componentType ) {
          return componentType && componentsByType.hasOwnProperty( componentType );
      };

      this.setParent = function( newParentEntity ) {
          if( parent )
              parent.children.remove( this );

          newParentEntity.children.push( this );
          this.spatial.setParent( newParentEntity.spatial );
          parent = newParentEntity;
      };

      options = options || {};

      if ( options.parent ) {
          this.setParent( options.parent );
      }

      if ( options.children ) {
        for ( i=0; i<options.children.length; ++i) {
          options.children[i].setParent(this);
        } //for
      } //if

      if ( options.listeners ) {
        for ( var eventName in options.listeners ) {
          var callback, params, persistent;
          if ( options.listeners[ eventName ] instanceof Function ) {
            callback = options.listeners[ eventName ];
          }
          else {
            callback = options.callback;
            params = options.parameters;
            persistent = options.persistent;
          }
          this.listen( {
            event: eventName,
            callback: callback,
            parameters: params,
            persistent: persistent
          });
        } //for
      } //if

      if ( options.components ) {
        for ( i=0; i<options.components.length; ++i ) {
          this.addComponent( options.components[ i ] );
        } //for
      } //if

      if ( options.init ) {
          options.init( this );
      }

  }

  return Entity;

});
