/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global gladius: false, document: false, window: false, module: false, start,
  test: false, expect: false, ok: false, notEqual: false, stop, QUnit: false */

(function() {

    var engine = null;

    module( 'Configurator', {
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
    
    
    // Configurator should be automatically created by the Engine
    test( 'Construction', function() {
        expect( 1 );
        
        ok(
            engine.configurator,
            'Configurator was created'
        );
    });
    
    /***
     * --snip
     * The configurator should accept a default configuration that is defined
     * somewhere internally that contains sane defaults for most configuration
     * parameters.
     * --/snip
     *
     * I assume that we like black box testing and the way I see it, this can't
     * be directly tested without letting the test suite peer into the insides
     * of gladius. --northWind
     */
    
    // Test Get/Set
    test( 'Get and set', function() {
        expect( 12 );
        
        var keyVals = [  
            ['/foo/bar/key1',   'val1', 'resetVal1'],
            ['/foo/bar/key2',   'val2', 'resetVal2'],
            ['/key3',           'val3', 'resetVal3'],
            ['/key4',           'val4', 'resetVal4']
        ];
        
        // All keys initially return the empty string
        for ( var i = 0; i < keyVals.length; ++ i ) {
            equal(
                engine.configurator.get(keyVals[i][0]),
                '',
                'Key ' + keyVals[i][0] + ' initially set to empty string'
            );
        }
        
        // Set all keys then test
        for ( var i = 0; i < keyVals.length; ++ i ) {
            engine.configurator.set( keyVals[i][0], keyVals[i][1] );
            
            equal(
                engine.configurator.get( keyVals[i][0] ),
                keyVals[i][1],
                'Key ' + keyVals[i][0] + ' correctly set to ' + keyVals[i][1]
            );
            
            // Reset values then test
            engine.configurator.set( keyVals[i][0], keyVals[i][2] );
            
            equal(
                engine.configurator.get( keyVals[i][0] ),
                keyVals[i][2],
                'Key ' + keyVals[i][0] + ' correctly reset to ' + keyVals[i][2]
            );
        }
    });
    
    test( 'getPath and separator apprehension', function() {
        
        var childConfigs = [];
        
        childConfigs.push( engine.configurator.getPath( '/foo' ) );
        childConfigs.push( engine.configurator.getPath( '/foo/bar' ) );
        
        expect( 10 );
        
        equal( engine.configurator.get( '/foo' ), '' )
        equal( engine.configurator.get( '/foo/bar' ), '' )
        equal( childConfigs[0].get( '/' ), '' )
        equal( childConfigs[1].get( '/' ), '' )
        
        // Set through engine configurator to first child
        var first_val = 'first_val';
        engine.configurator.set( '/foo', first_val );
        equal( first_val, childConfigs[0].get( '/' ), 'Read value from first child configurator set through engine configurator successfully' );
        
        // Set through engine configurator to second child
        var fifth_val = 'fifth_val';
        engine.configurator.set( '/foo/bar', fifth_val );
        equal( fifth_val, childConfigs[1].get( '/' ), 'Read value from second child configurator set through engine configurator successfully' );
        
        // Set through first child configurator
        var second_val = 'second_val';
        childConfigs[0].set( '/bar', second_val)
        equal( second_val, childConfigs[1].get( '/' ), 'Read value from second child configurator set through first child configurator successfully' );
        
        // Set through second child configurator
        var third_val = 'third_val';
        childConfigs[1].set( '/', third_val )
        equal( third_val, childConfigs[0].get( '/bar' ), 'Read value from first child configurator set through second child configurator successfully' );
        equal( third_val, engine.configurator.get( '/foo/bar' ), 'Read value from engine configurator set through second child configurator successfully' );
        
        // Set through first child configurator
        var fourth_val = 'fourth_val';
        childConfigs[0].set( '/', fourth_val );
        equal( fourth_val, engine.configurator.get( '/foo', fourth_val ), 'Read value from engine configurator set through first child configurator successfully' );
    });
    
    // Path separator test
    // Pre--
    //  Pathed configurator
    test('Path Separation -- "/"', function(){
        // First
    });
    
    // Default configuration test -- JSON
    // Pre--
    //  Set/Get
    test('')
    
    // Load configurations from URL
    // eg engine.configurator.load( URL );
    test('')

}());
