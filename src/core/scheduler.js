/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
    
    var lang = require( 'lang' );
    var Delegate = require( 'common/delegate' );
    var Task = require( './task' );
    var Timer = require( './timer' );
    var Graph = require( 'common/graph' );
    var phases = require( 'core/scheduler-phases' );
    
    var Scheduler = function( options ) {
        
        options = options || {};
        
        var _tasks = {},
            _phases = {};
        
        for( var phase in phases ) {
            _phases[phases[phase]] = new Graph();
        }
        
        var _running = false,
            that = this,              
            _previousTime,
            _schedule,
            _tick = new Delegate();    // Time signal, sent each frame
        
        this.Timer = Timer({ tick: _tick });        
        this.Task = Task({ manager: this });
        
        Object.defineProperty( this, 'phases', {
           get: function() {
               return phases;
           } 
        });

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
                    requestAnimationFrame( run );
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
                    requestAnimationFrame( run );
                }
                
                _running = false;
            }            
        };        
        
        var dispatch = function() {
            for( var phase in _phases ) {
                var dag = _phases[phase];
                if( !_schedule ) {
                    _schedule = _phases[phase].sort();
                }

                while( _schedule.length > 0 ) {
                    var task = _tasks[_schedule.shift()];

                    if( task && task.active ) {
                        task.scheduled = false;
                        try{                            
                            task.callback();
                        } catch( e ) {
                            // Suspend the scheduler and return
                            that.suspend();
                            return;
                        }

                        if( task.active ) {
                            task.scheduled = true;
                        } else {
                            dag.remove( task.id );
                        }
                    }
                }
                
                _schedule = null;
            }
        };
        
        this.add = function( task ) {
            if( !task.scheduled ) {
                task.scheduled = true;
                _tasks[task.id] = task;

                if( !_phases.hasOwnProperty( task.schedule.phase ) ) {
                    throw 'invalid phase: ' + task.schedule.phase;
                }
                
                var dag = _phases[task.schedule.phase];
                
                if( task.group ) {
                    dag.link( task.id, task.group );
                } else {
                    dag.insert( task.id );
                }
                
                if( task.depends ) {
                    for( var i = 0, l = task.depends.length; i < l; ++ i ) {
                        dag.link( task.depends[i], task.id );
                    }                 
                }                
            }
        };
        
        this.remove = function( task ) {
            if( task.scheduled && task.manager === this ) {
                task.scheduled = false;
                
                delete _tasks[task.id];
            }
        };
        
        if( options.active ) {
            this.resume();
        }
        
    };
    
    return Scheduler;
    
});
