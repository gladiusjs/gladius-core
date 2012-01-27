/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global module: false, gladius: false, stop: false, start: false,
  expect: false, asyncTest: false, ok: false, deepEqual: false, equal: false */

(function() {
  var engine = null;
  

  module('core/Cache', {

    setup : function() {
      stop();

      gladius.create({
        debug : true
      }, function(instance) {
        engine = instance;
        start();
      });
    },
    teardown : function() {
      engine = null;
    }
  });
  
  test( 'Cache construction', function() {
      expect( 0 );
      
      var cache_NoLimit = new engine.base.Cache();
      ok( cache_NoLimit, 'can construct a cache without a size limit' );
      
      var cache_Limit = new engine.base.Cache({ limit: 100 });
      ok( cache_Limit, 'can construct a cache with a 100 byte limit, no eviction policy' );
      
      var cache_LimitWithPolicy = new engine.base.Cache({ limit: 100, policy: function() {} });
  });
  
}());