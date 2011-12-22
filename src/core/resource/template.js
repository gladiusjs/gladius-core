/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {
    
    var lang = require( 'lang' );
    
    return function( engine ) {
        
        var Template = engine.base.Resource({
            type: 'Template',
            cache: null       
        },
        function( source ) {
            
            var _source = source,
                that = this;
            
            // TD: If there's a cache for this template, fetch all nested templates and cache them as well
            
            var _create = function( source ) {
                
                console.log( source.name );
                
                var entity = new engine.core.Entity({
                    name: source.name || null
                });
                
                var i, l;
                
                var componentNames = source.components ? Object.keys( source.components ) : [];
                for( i = 0, l = componentNames.length; i < l; ++ i ) {
                    var componentName = componentNames[i];
                    var path = componentName.split( '.' );
                    var component = lang.getProperty( engine, path );
                    
                    entity.add( new component( source.components[componentName] ) );
                }
                
                var children = source.children || [];
                for( i = 0, l = children.length; i < l; ++ i ) {
                    var child = _create( children[i] );
                    child.parent = entity;
                }

                return entity;
                
            };
            
            // Create and return a new entity tree from this template
            this.create = function( options ) {
                
                options = options || {};
                
                return _create( source );
                
            };
            
        });
        
        return Template;

    };
});

