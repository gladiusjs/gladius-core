/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
    
    return function( engine ) {

        var Logic = engine.base.Service({
            type: 'Logic',
            schedule: {
                update: {
                    phase: engine.scheduler.phases.UPDATE
                }
            },
            time: engine.scheduler.simulationTime
        },
        function( options ) {

            var that = this;

            this.update = function() {
                var updateEvent = new engine.core.Event({
                    type: 'Update',
                    queue: false
                });
                for( var componentType in that.components ) {
                    for( var entityId in that.components[componentType] ) {
                        var component = that.components[componentType][entityId];
                        while( component.handleQueuedEvent() ) {}                        
                        updateEvent.dispatch( [component] );
                    }
                };
            };

        });

        return Logic;

    };

});
