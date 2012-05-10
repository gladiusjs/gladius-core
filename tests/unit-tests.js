if ( typeof define !== "function" ) {
  var define = require( "amdefine" )( module );
}

define( function( require ) {

  return [

          // Common
          "common/guid.test",
          "common/extend.test",
          "common/assert.test",
          "common/graph.test",
          "common/multicast-delegate.test",  

          // Core        
          "core/loop.test",
          "core/request-animation-frame-loop.test",
          "core/set-timeout-loop.test",
          "core/clock.test",
          "core/function-task.test",
          "core/dependency-scheduler.test",
          "core/timer.test",
          "core/event.test",
          "core/entity.test",
          "core/space.test",
          "core/get.test",
          "core/resources/script.test",
          "core/components/transform.test",

          // Base         
          "base/component.test",
          "base/service.test",
          "base/extension.test",

          // Engine
          "core/engine.test",

          "tests/core/engine-extension"

          ];

});