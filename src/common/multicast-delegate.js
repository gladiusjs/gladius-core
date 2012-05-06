if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  var guid = require( "common/guid" );
  
  function subscribe( callback ) {
    if( !callback.hasOwnProperty( "_id" ) ) {
      callback._id = guid();
    }
    
    if( !this._callbacks.hasOwnProperty( callback._id ) ) {
      this._callbacks[callback._id] = callback;
      ++ this.size;
    }
  }
  
  function unsubscribe( callback ) {
    if( callback.hasOwnProperty( "_id" ) ) {
      if( this._callbacks.hasOwnProperty( callback._id ) ) {
        delete this._callbacks[callback._id];
        -- this.size;
      }
    }
  }
  
  var Delegate = function() {
    var callbacks = {};
    
    function dispatcher( data ) {
      var i, l;
      var count = 0;
      var callbackIds = Object.keys( callbacks );
      for( i = 0, l = callbackIds.length; i < l; ++ i ) {
        var callbackId = callbackIds[i];
        var callback = callbacks[callbackId];
        callback( data );
        ++ count;
      }
      
      return count;
    }
    
    dispatcher._callbacks = callbacks;
    dispatcher.subscribe = subscribe;
    dispatcher.unsubscribe = unsubscribe;
    dispatcher.size = 0;

    return dispatcher;
  };
  
  return Delegate;
  
});