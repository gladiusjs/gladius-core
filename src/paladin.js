(function (window, document) {

function Paladin() {
    
    var that = this;
    
    if( this === window ) {
        throw new Error( 'Must instantiate Paladin with "new".' );
    }
    
    this.onMouseDown = function () { return function (ev)
    {
        alert( '!' );
    }; }();
    
};

window.Paladin = Paladin;

Paladin.prototype.run = function() {    
    Paladin.tasker.run();    
};

function Tasker() {

    // enumerations
    this.CONT = 0;
    this.DONE = 1;
    this.AGAIN = 2;

    // private vars
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
    }; //run

    this.terminate = function() {
        terminate = true;
    }; //terminate

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
    }; //add

    this.remove = function( task ) {
        if( task._id in tasksById ) {
            delete tasksById[task._id];
        }
        if ( task.name && task.name in tasksByName ) {
            delete tasksByName[task.name];
        }
    };

}; //Tasker

function Messenger() {
    
    var callbacks = {},
        that = this;
    
    this.listen = function( options ) {
        if( !callbacks.hasOwnProperty( options.event ) )
            callbacks[options.event] = {};
        callbacks[options.event][options.entity.getId()] = {
            callback: options.callback,
            parameters: options.parameters,
            persistent: options.persistent
        };
    };
    
    this.ignore = function( options ) {
        if( callbacks.hasOwnProperty( options.event ) &&
                callbacks[options.event].hasOwnProperty( options.entity.getId() ) )
            delete callbacks[options.event][options.entity.getId()];
        if( 0 == Object.keys( callbacks[options.event] ).length )
            delete callbacks[options.event];
    };
    
    this.ignoreAll = function( options ) {
        
    };
    
    this.send = function( options ) {        
    };
    
};

// FIXME(alan.kligman@gmail.com): This is a hack.
var nextEntityId = 0;

function Entity() {
    
    var id = nextEntityId ++,
        that = this;
    
    this.getId = function() {
        return id;
    };
    
    this.listen = function( options ) {
        Paladin.messenger.listen( {
            entity: that,
            event: options.event,
            callback: options.callback,
            parameters: options.parameters || undefined,
            persistent: options.persistent || true
        } );
    };
    
    this.ignore = function( options ) {
        Paladin.messenger.ignore( {
            entity: that,
            event: options.event
        } );
    };
    
};

// Attach core instances to Paladin.
Paladin.tasker = new Tasker();
Paladin.messenger = new Messenger();

// Attach prototypes to Paladin.
Paladin.Entity = Entity;

/*
Tasker.prototype.add = function( name, callback ) {
};
Tasker.prototype.removeByName = function( name ) {    
};
*/
/*
Tasker.prototype.addDeferred = function( name, delay, callback ) {
    console.log( 'Task.addDeferred' );
};
*/

})( window, document );
