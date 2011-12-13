/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
    
    var phases = require( 'core/scheduler-phases' );

    return {
        graphics: {
            render: {
                phase: phases.RENDER
            }
        },
        input: {
            update: {
                phase: phases.INPUT
            }
        },
        network: {
            receive: {
                phase: phases.INPUT
            },
            send: {
                phase: phases.RENDER
            }
        },
        physics: {
            update: {
                phase: phases.UPDATE,
                before: ['logic','animation']
            }
        },
        animation: {
            update: {
                phase: phases.UPDATE,
            }
        },
        logic: {
            update: {
                phase: phases.UPDATE,
                before: ['animation'],
                after: ['physics']
            }
        },
        sound: {
            update: {
                phase: phases.RENDER
            }
        },
        monitor: {
            update: {
                phase: phases.RENDER,
                interval: 300
            }
        }
    };

});