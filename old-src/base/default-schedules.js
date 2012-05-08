/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
    
    var phases = require( 'core/scheduler-phases' );

    return {
        Graphics: {
            render: {
                phase: phases.RENDER
            }
        },
        Input: {
            update: {
                phase: phases.INPUT
            }
        },
        Network: {
            receive: {
                phase: phases.INPUT
            },
            send: {
                phase: phases.RENDER
            }
        },
        Physics: {
            update: {
                phase: phases.UPDATE
            }
        },
        Animation: {
            update: {
                phase: phases.UPDATE,
                depends: ['Logic','Physics']
            }
        },
        Logic: {
            update: {
                phase: phases.UPDATE,
                depends: ['Physics']
            }
        },
        Sound: {
            update: {
                phase: phases.RENDER
            }
        },
        Monitor: {
            update: {
                phase: phases.RENDER,
                interval: 300
            }
        }
    };

});