/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'core/Event', {
        setup: function () {
            stop();

            gladius.create( { debug: true }, function( instance ) {       
                engine = instance;
                start();
            });
        },

        teardown: function () {
            engine = null;
        }
    });

    test( 'Construct a new event', function () {
        expect( 2 );
        
        var event = new engine.core.Event({
            type: 'Test',
            data: 'Test data'
        });
        
        equal( event.type, 'Test', 'Event type is correct' );
        equal( event.data, 'Test data', 'Event data is correct' );
    });
    
    test( 'Entity handles non-queued events', function() {
        expect( 1 );
        
        var TestComponent = engine.base.Component({
            type: 'Test'
        },
        function( options ) {

            options = options || {};
            var that = this;
            
            this.onTest = function( event ) {
                ok( true, 'Test handler invoked' );
            };
            
        });
        
        var event = new engine.core.Event({
            type: 'Test',
            queue: false,
            data: 'Test data'
        });
        
        var entity = new engine.core.Entity({
            name: 'TestEntity',
            components: [new TestComponent()]
        });
        
        event.dispatch( [entity] );
    });
    
    test( 'Entity handles queued events', function() {
        expect( 1 );
        
        var TestComponent = engine.base.Component({
            type: 'Test'
        },
        function( options ) {

            options = options || {};
            var that = this;
            
            this.onTest = function( event ) {
                ok( true, 'Test handler invoked' );
            };
            
        });
        
        var event = new engine.core.Event({
            type: 'Test',
            queue: false,
            data: 'Test data'
        });
        
        var component = new TestComponent();
        
        var entity = new engine.core.Entity({
            name: 'TestEntity',
            components: [new TestComponent()]
        });
        
        event.dispatch( [entity] );
        component.handleQueuedEvent();
    });

}());
