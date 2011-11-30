/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
    
    var BufferedPriorityQueue = function( queue ) {
        
        var _queue = [ {}, {} ],
            _index = 0,
            _size = [0, 0];
        
        // Add an object to the write buffer
        this.enqueue = function( object, priority ) {
            var queue = _queue[_index];
            if( !queue.hasOwnProperty( priority ) ) {
                queue[priority] = [];
            }
            queue[priority].push( object );
            ++ _size[_index];
        };
        
        // Remove and return the next item in the read buffer
        this.dequeue = function() {
            -- _size[_index ^ 1];
            var queue = _queue[_index ^ 1];
            return queue[Object.keys( queue ).sort()[0]].shift();
        };
        
        // Swap the read and write buffers
        this.swap = function() {
            _index ^= 1;
        };
        
        // Return the size of the read buffer
        Object.defineProperty( this, 'size', {
            get:function() {
                return _size[_index ^ 1];
            }
        });
        
        // Clear the write buffer
        this.clear = function() {
            _queue[_index] = {};
        };
        
        
        
        
    };
    
    return BufferedPriorityQueue;
    
});