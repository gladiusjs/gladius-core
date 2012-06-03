define( function( require ) {

  var get = require( "core/get" );
  var Script = require( "core/resources/script" );

  var EventMap = function( data ) {
    data = data || {};
    var map = {};

    var getRequests = [];
    var eventNames = Object.keys( data );

    for( var eventName in eventNames ) {
      if( "string" === typeof data[eventName] ) {
        getRequests.push({
          type: Script,
          url: data[eventName],
          onsuccess: function( script ) {
            map[eventName] = script;
          },
          onfailure: function( error ) {
            console.log( "error loading script: " + data[eventName] );
            throw error;
          }
        });
      } else if( "function" === typeof data[eventName] ) {
        map[eventName] = data[eventName];
      }
    }
    get( getRequests );

    return map;
  };

  return EventMap;

});
