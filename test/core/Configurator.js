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
    
    // Helper for getPath tests
    var getPathTestHelper = function() {
        var keyVals = [
                ['/foo', 'val1'],
                ['/bar', 'val2']
            ],
            
            childConfigs = [];
            
        for ( var i = 0; i < keyVals.length; ++ i ) {
            childConfigs.push( engine.configurator.getPath( keyVals[i][0] ) );
        };
        
        var ret = [keyVals, childConfigs];
        
        return ret;
    }
    
    // Pathed
    test( 'getPath and separator apprehension, set through parent', function() {
        
        // Set through parent configurator, retrieve through child configurators
        var temp = getPathTestHelper(),
        
            keyVals = temp[0],            
            childConfigs = temp[1];
        
        expect( keyVals.length );
        
        for ( var i = 0; i < keyVals.length; ++ i ) {
            engine.configurator.set( keyVals[i][0], keyVals[i][1] );
            
            equal(
                childConfigs[i].get( '/' ),
                keyVals[i][1],
                'Key ' + keyVals[i][0] + ' set to ' + keyVals[i][1] + ' through parent configurator and retrieved through child configurator successfully'
            );
        }
    });
    
    test( 'getPath and separator apprehension, set through child', function() {
        
        // Set through child configurators, retrieve through parent configurator
        var temp = getPathTestHelper(),
        
            keyVals = temp[0],            
            childConfigs = temp[1];
        
        expect( keyVals.length );
        
        for ( var i = 0; i < keyVals.length; ++ i ) {
            childConfigs[i].set( '/', keyVals[i][1] )
            
            equal(
                engine.configurator.get( keyVals[i][0] ),
                keyVals[i][1],
                'Key ' + keyVals[i][0] + ' set to ' + keyVals[i][1] + ' through child configurator and retrieved through parent configurator successfully'
            );
        }
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
