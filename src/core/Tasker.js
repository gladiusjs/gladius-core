/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function () {
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
          terminate = false,
          that = this;

      this.run = function() {
          for( var id in tasksById ) {
              var task = tasksById[id];
              var last = task.time;
              task.time = Date.now();
              task.dt = task.time - last;
              task.elapsed = task.time - task.start;
              if( task.run ) {
                  if( task.DONE === task._callback( task ) ) {
                      task.run = false;
                      that.remove( task );
                  }
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
              time: Date.now(),
              run: true,
              dt: 0,
              elapsed: 0,
              start: Date.now(),

              DONE: 0,
              CONTINUE: 1,
              AGAIN: 2,

              suspend: function() {
                  this.run = false;
              },
              resume: function() {
                  this.run = true;
              }
          };

          tasksById[id] = task;
          return task;
      };

      this.remove = function( task ) {
          if( task._id in tasksById ) {
              delete tasksById[task._id];
          }
      };

      this.hasTask = function( task ) {
          return task._id in tasksById;
      };

  }

  return Tasker;
});
