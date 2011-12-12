/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
    
    var Delegate = require( './delegate' );
    var Task = require( './task' );
    var Timer = require( './timer' );
    var PriorityQueue = require( '../common/buffered-priority-queue' );
   
    var Scheduler = function( options ) {
        
        options = options || {};
        
        var _queue = new PriorityQueue(),
            _running = false,
            that = this;        
        
        var _previousTime;        
        var _tick = new Delegate();    // Time signal, sent each frame
        
        this.Timer = Timer({ tick: _tick });        
        this.Task = Task({ manager: this });

        var _realTime = new this.Timer();
        Object.defineProperty( this, 'realTime', {
            get: function() {
                return _realTime;
            }
        });
        
        var _simulationTime = new this.Timer();
        Object.defineProperty( this, 'simulationTime', {
            get: function() {
                return _simulationTime;
            }
        });
        
        var _frame = 0;
        Object.defineProperty( this, 'frame', {
            get: function() {
                return _frame;
            }
        });
        
        var _active = false;
        Object.defineProperty( this, 'active', {
            get: function() {
                return _active;
            }
        });
              
        this.suspend = function() {
            _active = false;
        };
        
        this.clear = function() {
            _queue = [];
        };
        
        this.resume = function() {
            if( !_active ) {                
                _active = true;
                if( undefined === _previousTime ) {
                    _previousTime = Date.now();
                }
                if( !_running ) {
                    setTimeout( run, 0 );
                }
            }
        };
        
        var run = function() {            
            if( _active && !_running ) {
                _running = true;
                
                ++ _frame;
                
                var delta = Date.now() - _previousTime;
                _previousTime += delta;
                _tick( delta );        // Send tick event
                dispatch();            // Dispatch queued tasks
                if( _active ) {
                    setTimeout( run, 0 );
                }
                
                _running = false;
            }            
        };        
        
        var dispatch = function() {
            _queue.swap();            
            
            while( _queue.size > 0 ) {
                var task = _queue.dequeue();
                if( task && task.active ) {
                    task.scheduled = false;
                    task.callback();
                    if( task.active ) {
                        task.scheduled = true;
                        _queue.enqueue( task, task.priority );
                    }
                }
            }
        };
        
        this.add = function( task ) { 
            if( !task.scheduled ) {
                task.scheduled = true;                
                _queue.enqueue( task, task.priority );                
            }
        };
        
        this.remove = function( task ) {
            if( task.scheduled && task.manager === this ) {
                task.scheduled = false;
            }
        };
        
        if( options.active ) {
            this.resume();
        }
        
    };
    
    return Scheduler;
    
});
