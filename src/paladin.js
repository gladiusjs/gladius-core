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
Paladin.init = function( options ) {
    Paladin.subsystem.init();
    if( options && options.debug )
        Paladin.debug = console.log;
    else
        Paladin.debug = function () {};
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
 * Entity
 * 
 * An entity is a basic game object. It is a container object for components. Each
 * entity has a unique identifier.
 */
var nextEntityId = 0;   // FIXME(alan.kligman@gmail.com): This is a hack.
function Entity() {
    
    var id = nextEntityId ++,
        componentsByType = {},
        children = [],
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
    this.requires = options.requires || [];
    this.parent = null;
};
Component.prototype.getType = function() {
    return this.type;
};
Component.prototype.getSubtype = function() {
    return this.subtype;
};

function SpatialComponent( position, rotation ) {
    this.position = position ? position : [0, 0, 0];   // X, Y, Z
    this.rotation = rotation ? rotation : [0, 0, 0];  // Roll, pitch, yaw
    this.object = new Paladin.graphics.SceneObject( {
        position: this.position,
        rotation: this.rotation
    } );
}
SpatialComponent.prototype = new Component( { 
    type: 'core',
    subtype: [ 'spatial' ]
} );
SpatialComponent.prototype.constructor = SpatialComponent;
SpatialComponent.prototype.addChild = function ( child ) {
    Paladin.debug( "binding child to spatial" );
    this.object.bindChild( child.object );
};
SpatialComponent.prototype.setParent = function( parent ) {
    Paladin.debug( "setting spatial parent" );
    this.parent = parent;
    parent.addChild( this );
};

function SceneComponent( options ) {
    Paladin.debug( "constructing a new scene" );
    options = options || {};
    this.render = new Paladin.graphics.Scene( {
        fov: 60,
        resizable: true
    } );
    this.spatial = new Paladin.component.Spatial();
    this.render.bindSceneObject( this.spatial.object );
}
SceneComponent.prototype = new Component( {
    type: 'core',
    subtype: [ 'scene' ]
} );
SceneComponent.prototype.constructor = SceneComponent;
SceneComponent.prototype.addChild = function( child ) {
    Paladin.debug( "setting scene child" );
    if( child.constructor == CameraComponent ) {
        Paladin.debug( "bind camera to scene" );
        this.render.bindCamera( child.camera );
    }
    else {
        Paladin.debug( "bind component to scene" );
        this.spatial.addChild( child );
    }
};
SceneComponent.prototype.setParent = function( parent ) {
    // Nothing to do.
};

function CameraComponent( options ) {
    this.camera = (options && options.camera) ? options.camera : new Paladin.graphics.Camera();
    this.spatial = (options && options.spatial) ? options.spatial : null;
}
CameraComponent.prototype = new Component( {
    type: 'graphics',
    subtype: [ 'camera' ],
    requires: [ 'spatial' ]
} );
CameraComponent.prototype.constructor = CameraComponent;
CameraComponent.prototype.addChild = function( child ) {
    this.spatial.addChild( child );
};
CameraComponent.prototype.setParent = function( parent ) {
    Paladin.debug( "setting camera parent" );
    this.parent = parent;
    parent.addChild( this );
};
CameraComponent.prototype.setSpatial = function( spatial ) {
    Paladin.debug( "setting camera spatial" );
    this.spatial = spatial;
    this.camera.position = spatial.position;
    this.camera.rotation = spatial.rotation;
};
CameraComponent.prototype.setTarget = function( target ) {
    this.camera.target = target;
};

function ModelComponent( options ) {
    this.object = new Paladin.graphics.SceneObject( { mesh: options.mesh } );
    this.spatial = (options && options.spatial) ? options.spatial : null;
    this.mesh = (options && options.mesh) ? options.mesh : null;
    this.material = (options && options.material) ? options.material : null;
};
ModelComponent.prototype = new Component( {
    type: 'graphics',
    subtype: [ 'model' ],
    requires: [ 'spatial' ]
} );
ModelComponent.prototype.constructor = ModelComponent;

ModelComponent.prototype.addChild = function( child ) {
    this.object.bindChild( child.object );
};
ModelComponent.prototype.setParent = function( parent ) {
    this.parent = parent;
    parent.addChild( this );
};
ModelComponent.prototype.setSpatial = function( spatial ) {
    /* FIXME(alan.kligman@gmail.com):
     * This needs to be properly managed.
     */
    this.spatial = spatial;    
    this.object.position = spatial.position;
    this.object.rotation = spatial.rotation;
};
ModelComponent.prototype.setMesh = function( mesh ) {
    this.mesh = mesh;
    this.object.obj = mesh;
};
ModelComponent.prototype.setMaterial = function( material ) {
    this.material = material;
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
Paladin.Entity = Entity;
Paladin.component.Spatial = SpatialComponent;
Paladin.component.Camera = CameraComponent;
Paladin.component.Model = ModelComponent;
Paladin.component.Scene = SceneComponent;
Paladin.component.Light = null;

})( window, document );
