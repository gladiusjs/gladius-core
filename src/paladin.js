(function (window, document) {

function Paladin() {
    if( this === window ) {
        throw new Error( 'Must instantiate Paladin with "new".' );
    }
};
window.Paladin = Paladin;
Paladin.prototype.run = function() {    
    tasker.run();    
};

function Tasker() {
    this._nextId = 0;
    this._tasksById = {};
    this._tasksByName = {};
    this._terminate = false;
};
window.tasker = new Tasker();
Tasker.prototype.run = function() {
    for( var id in this._tasksById ) {
        var task = this._tasksById[id];
        task.time = Date.now();
        if( task.DONE == task._callback( task ) )
            this.remove( task );
    }
    
    if( !this._terminate )
        setTimeout( this.run.bind( this ), 0 );
};
Tasker.prototype.terminate = function() {
    this._terminate = true;
};
Tasker.prototype.add = function( callback ) {
    var id = this._nextId ++;
    var task = {
        _callback: callback,            
        _id: id,
        name: null,
        time: Date.now(),
        CONT: 0,
        DONE: 1,
        AGAIN: 2
    };
    
    this._tasksById[id] = task;
    return task;
};
Tasker.prototype.remove = function( task ) {
    if( task._id in this._tasksById ) {
        delete this._tasksById[task._id];
    }
    // FIXME(alan.kligman): Also remove the task from the named index.
};

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