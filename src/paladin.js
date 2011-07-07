(function (window, document) {
    
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice( (to || from) + 1 || this.length );
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};
    
/***
 * Paladin
 * 
 * This is where we put all of our goodies. Some are instances, like the subsystems,
 * and others are prototypes to be used and extended.
 */
Paladin = {};
Paladin.component = {};
Paladin.init = function() {
    Paladin.subsystem.init();
};
Paladin.run = function() {
    Paladin.tasker.run();
};
window.Paladin = Paladin;

/***
 * Tasker
 * 
 * Provides a mechanism for scheduling callbacks to run each frame.
 */
function Tasker() {

    this.CONT = 0;
    this.DONE = 1;
    this.AGAIN = 2;

    var nextId = 0,
        tasksById = {},
        tasksByName = {},
        terminate = false,
        that = this;
    
    this.run = function() {
        for( var id in tasksById ) {
            var task = tasksById[id];
            task.time = Date.now();
            if( task.DONE === task._callback( task ) ) {
                that.remove( task );
            }
        }
        
        if( !terminate ) {
            setTimeout( that.run, 0 );
        }
    };

    this.terminate = function() {
        terminate = true;
    };

    this.add = function( options ) {
        var id = nextId ++;
        var task = {
            _callback: options.callback || function () {},            
            _id: id,
            name: options.name || undefined,
            time: Date.now(),
            CONT: 0,
            DONE: 1,
            AGAIN: 2
        };
        
        tasksById[id] = task;
        if( task.name )
            tasksByName[task.name] = task;
        return task;
    };

    this.remove = function( task ) {
        if( task._id in tasksById ) {
            delete tasksById[task._id];
        }
        if ( task.name && task.name in tasksByName ) {
            delete tasksByName[task.name];
        }
    };

};

/***
 * Loader
 * 
 * Provide resource loaders for game assets like models, textures and sounds.
 */
function Loader() {
  
    var that = this,
        graphics = undefined,
        physics = undefined,
        sound = undefined;

};

/***
 * MouseWatcher
 * 
 * Caches the current mouse position and provides access to the coordinates.
 */
function MouseWatcher() {

    var mousePosition = {
            x: undefined,
            y: undefined
        },
        that = this;    

    this.getX = function() {
        return mousePosition['x'];
    };

    this.getY = function() {
        return mousePosition['y'];
    };

    this._mouseMove = function( event ) {
        mousePosition['x'] = event.pageX;
        mousePosition['y'] = event.pageY;
    };

    window.addEventListener( 'mousemove', this._mouseMove, true );
    window.addEventListener( 'mouseover', this._mouseMove, true );
};

/***
 * Messenger
 * 
 * Provide a mechanism for game entities to listen for events and to send
 * events. An event is an arbitrary string. Some Javascript events are
 * handled here and converted to game engine events so that entities can
 * listen for them.
 */
function Messenger() {
    
    var callbacks = {},
        that = this;
    
    this.listen = function( options ) {
        var id = options.entity.getId();
        if( !callbacks.hasOwnProperty( options.event ) )
            callbacks[options.event] = {};        
        callbacks[options.event][id] = {
            callback: options.callback.bind( options.entity ),
            parameters: options.parameters,
            persistent: options.persistent
        };
    };
    
    this.ignore = function( options ) {
        if( callbacks.hasOwnProperty( options.event ) ) {
            if( callbacks[options.event].hasOwnProperty( options.entity.getId() ) )
                delete callbacks[options.event][options.entity.getId()];
            if( 0 == Object.keys( callbacks[options.event] ).length )
                delete callbacks[options.event];
        }
    };
    
    this.ignoreAll = function( options ) {
        
    };
    
    this.send = function( options ) {
        if( callbacks.hasOwnProperty( options.event ) ) {
            listeners = callbacks[options.event];
            for( var id in listeners ) {
                var callback = listeners[id].callback,
                    parameters = listeners[id].parameters,
                    persistent = listeners[id].persistent;
                
                callback( parameters.concat( options.parameters ) );
                if( !persistent )
                    delete callbacks[options.event][id];
            }
        }
    };

    this._keyDown = function( event ) {
        that.send( {
            event: that._convertKeyEvent( event, 'down' ),
            parameters: []
        } );
    };
    
    this._keyUp = function( event ) {
        that.send( {
            event: that._convertKeyEvent( event, 'up' ),
            parameters: []
        } );        
    };

    this._mouseButtonDown = function( event ) {
        that.send( {
            event: that._convertMouseButtonEvent( event, 'down' ),
            parameters: []
        } );        
    };

    this._mouseButtonUp = function( event ) {
        that.send( {
            event: that._convertMouseButtonEvent( event, 'up' ),
            parameters: []
        } );        
    };

    this._mouseWheelScroll = function( event ) {
        that.send( {
            event: that._convertMouseWheelEvent( event ),
            parameters: []
        } );        
    };
    
    this._convertKeyEvent = function( event, mode ) {
        var code = event.keyCode;
        
        var components = [];
        if( event.shiftKey || code == 16 )
            components.push( 'shift' );
        if( event.ctrlKey || code == 17 )
            components.push( 'control' );
        if( event.altKey || code == 18 )
            components.push( 'alt' );
        if( event.metaKey || code == 0 )
            components.push( 'meta' );

        if( code == 0 || (code >= 16 && code <= 18) || code == 224 ) {
            // These are modifier keys, do nothing.
        }
        else if( code == 27 )
            components.push( 'escape' );
        else if( code == 37 )
            components.push( 'larrow' );
        else if( code == 38 )
            components.push( 'uarrow' );
        else if( code == 39 )
            components.push( 'rarrow' );
        else if( code == 40 )
            components.push( 'darrow' );
        else if( (code >= 48 && code <= 90) )         
            components.push( String.fromCharCode( code ).toLocaleLowerCase() );
        else
            components.push( '<' + code + '>' );
        
        components.push( mode );
        
        result = components.join( '-' );
        return result;
    };

    this._convertMouseButtonEvent = function( event, mode ) {
        var code = event.button;

        var components = [];
        if( event.shiftKey )
            components.push( 'shift' );
        if( event.ctrlKey )
            components.push( 'control' );
        if( event.altKey )
            components.push( 'alt' );
        if( event.metaKey )
            components.push( 'meta' );

        if( code == 0 )
            components.push( 'mouse1' );
        else if( code == 2 )
            components.push( 'mouse2' );
        else if( code == 1 )
            components.push( 'mouse3' );
        else
            components.push( '<' + code + '>' );

        components.push( mode );

        result = components.join( '-' );
        return result;
    };

    this._convertMouseWheelEvent = function( event ) {
        var code = event.detail;

        var components = [];
        if( event.shiftKey )
            components.push( 'shift' );
        if( event.ctrlKey )
            components.push( 'control' );
        if( event.altKey )
            components.push( 'alt' );
        if( event.metaKey )
            components.push( 'meta' );

        if( code < 0 )
            components.push( 'wheel-up' );
        else if( code > 0 )
            components.push( 'wheel-down' );

        result = components.join( '-' );
        return result;
    };
    
    window.addEventListener( 'keydown', this._keyDown, true );
    window.addEventListener( 'keyup', this._keyUp, true );
    window.addEventListener( 'mousedown', this._mouseButtonDown, true );
    window.addEventListener( 'mouseup', this._mouseButtonUp, true );
    window.addEventListener( 'DOMMouseScroll', this._mouseWheelScroll, true );
};

/***
 * Scene
 */
function Scene() {
  
    var that = this;
        scene = new Paladin.graphics.Scene( {
            fov: 60
        } );

    this.addChild = function( child ) {
      
    };
        
};

/***
 * Entity
 * 
 * An entity is a basic game object. It is a container object for components. Each
 * entity has a unique identifier.
 */
var nextEntityId = 0;   // FIXME(alan.kligman@gmail.com): This is a hack.
function Entity() {
    
    var id = nextEntityId ++,
        componentsByType = {},
        that = this;
    
    this.getId = function() {
        return id;
    };

    this.listen = function( options ) {
        Paladin.messenger.listen( {
            entity: that,
            event: options.event,
            callback: options.callback,
            parameters: options.parameters || [],
            persistent: options.persistent || true
        } );
    };
    
    this.ignore = function( options ) {
        Paladin.messenger.ignore( {
            entity: that,
            event: options.event
        } );
    };
    
    this.send = function( options ) {
        Paladin.messenger.send( {
            event: options.event,
            parameters: options.parameters || []
        } );
    };
    
    this.addComponent = function( component, options ) {
        var componentType = component.getType();
        /* Note(alan.kligman@gmail.com):
         * We don't allow more than one component of the same type. This
         * might change in the future, so this step could be removed.
         */
        var previousComponents = removeComponent( componentType, {} );
        componentsByType[componentType] = component;

        
        component.onAdd( this );
        return previousComponents;
    };
    
    this.removeComponent = function( component ) {
        var componentType = component.getType();
        for( var i = 0; i < componentsByType[componentType].length; ++ i ) {
            if( componentsByType[componentType][i] == component ) {
                componentsByType[componentType][i].onRemove( this );
                componentsByType[componentType].remove( i );
                break;
            }
        }        
    };
    
    this.getComponents = function( componentType ) {
        if( componentType && componentsByType.hasOwnProperty( componentType ) )
            return componentsByType[componentType];        
        
        return [];
    };
    
    this.hasComponent = function( componentType ) {
        return componentType && componentsByType.hasOwnProperty( componentType );
    };
    
    this.addChild = function( child ) {
        if( child.hasComponent( 'graphics' ) ) {
            /* Note:
             * If there is also no spatial component, we assume 0 for both position and rotation.
             */
            if( !hasComponent( 'graphics' ) )
                addComponent( new Paladin.component.GraphicsNode() );
            
            graphicsComponent = getComponents( 'graphics', null, 1 );            
            graphicsComponent.addChild( child.getComponents( 'graphics', null, 1 ) );
        }
    };
    
    this.setParent = function( parent ) {
      parent.addChild( this );
    };
};

// Placeholder prototypes for a few things we'll need.
function Point3() {
    this.x = undefined;
    this.y = undefined;
    this.z = undefined;
};

function Vector3() {
    this.x = undefined;
    this.y = undefined;
    this.z = undefined;
};

/***
 * Component (prototype interface)
 * 
 * A component is a basic unit of game functionality. Components are narrow in scope and are composed
 * together by entities to form game objects.
 */
function Component( options ) {
    this.type = options.type || undefined;
    this.subtype = options.subtype || [];
};
Component.prototype.getType = function() {
    return this.type;
};
Component.prototype.getSubtype = function() {
    return this.subtype;
};
Component.prototype.onAdd = function( entity ) {
    this.entity = entity;
};
Component.prototype.onRemove = function( entity ) {
    this.entity = null;
};
Component.prototype.onReset = function( entity) {
};

function SpatialComponent() {
    this.position = new Point3();   // X, Y, Z
    this.rotation = new Vector3();  // Roll, pitch, yaw
}
SpatialComponent.prototype = new Component( { 
    type: 'spatial' 
} );
SpatialComponent.prototype.constructor = SpatialComponent;
SpatialComponent.parent = Component;

function CameraComponent( options ) {
    this.camera = (options && options.camera) ? options.camera : new Paladin.graphics.Camera();
}
CameraComponent.prototype = new Component( {
    type: 'graphics',
    subtype: [ 'camera' ]
} );
CameraComponent.prototype.constructor = CameraComponent;
CameraComponent.parent = Component;
CameraComponent.onAdd = function( entity ) {
    this.parent.onAdd( entity );
};
CameraComponent.onRemove = function( entity ) {
    this.parent.onRemove( entity );
};
CameraComponent.onReset = function( entity ) {
    this.parent.onReset( entity );
};
CameraComponent.prototype.addChild = function( child ) {
    this.camera.addChild( child );
};
CameraComponent.prototype.setParent = function( parent ) {
    parent.addChild( this );
};

function ModelComponent( options ) {
    this.mesh = options.mesh || undefined;
    this.object = new Paladin.graphics.SceneObject( { mesh: options.mesh, name: options.name } );
};
ModelComponent.prototype = new Component( {
    type: 'graphics',
    subtype: [ 'model' ]
} );
ModelComponent.prototype.constructor = ModelComponent;
ModelComponent.parent = Component;
ModelComponent.onAdd = function( entity ) {
    this.parent.onAdd( entity );
};
ModelComponent.onRemove = function( entity ) {
    this.parent.onRemove( entity );
};
ModelComponent.onReset = function( entity ) {
    this.parent.onReset( entity );
};
ModelComponent.prototype.addChild = function( child ) {
    this.object.bindChild( child );
};
ModelComponent.prototype.setParent = function( parent ) {
    parent.addChild( this );
};

Paladin.tasker = new Tasker();
Paladin.messenger = new Messenger();
Paladin.mouseWatcher = new MouseWatcher();
Paladin.loader = new Loader();

// These are registration points for external implementations. They should be instances.
Paladin.graphics = undefined;
Paladin.physics = undefined;
Paladin.sound = undefined;

// Attach prototypes to Paladin.
Paladin.Scene = Scene;
Paladin.Entity = Entity;
Paladin.component.Spatial = SpatialComponent;
Paladin.component.Camera = CameraComponent;
Paladin.component.Model = ModelComponent;
Paladin.component.Light = null;

})( window, document );
