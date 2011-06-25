(function (window, document) {

function Paladin() {
    if( this === window ) {
        throw new Error( 'Must instantiate Paladin with "new".' );
    }
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

Paladin.tasker = new Tasker();

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
