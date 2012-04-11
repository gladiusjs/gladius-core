define( function ( require ) {
  
  var guid = require( "common/guid" );

  var Task = function( thunk ) {
    this.T_STARTED = 0;
    this.T_PAUSED = 1;
    this.T_CANCELLED = 2;
    this.T_FINISHED = 3;
    
    this.R_RUNNING = 0;
    this.R_BLOCKED = 1;
    this.R_RESOLVED = 2;
    this.R_REJECTED = 3;
    
    this._thunk = thunk;
    
    this.id = guid();
    this.result = null;
  };
  
} );