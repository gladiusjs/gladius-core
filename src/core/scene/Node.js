/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function( require ) {

    function Node( engine, options ) {

        options = options || {};
        var _spatial = options.spatial ? options.spatial : new engine.scene.Spatial();    // Spatial data for this node.
        var _component = options.component ? options.component : null;       // Component associated with this node. Can be null.
        var _parent = null;         // Parent node.
        var _children = [];         // Child nodes.
        var _name = undefined;      // Name for this node.
        var _tags = [];             // Tags for this node. Can be added and removed.
        
        Object.defineProperty( this, 'parent', {
           get: function() {
               return _parent;
           },
           set: function( value ) {
               if( null != _parent )
                   _parent.removeChild({ node: this });
               _parent = value || null;
               if( null != _parent )
                   _parent.addChild({ node:this });
           }
        } );
        
        Object.defineProperty( this, 'spatial', {
            get: function() {
                return _spatial;
            },
            set: function( value ) {
                _spatial = value;
            }
        } );
        
        Object.defineProperty( this, 'children', {
            get: function() {
                return _children.slice();   // Return a copy of the children.
            }
        } );

        this.addChild = function( options ) {
            if( options && options.node && -1 === _children.indexOf( options.node ) )
                _children.push( options.node );
        };

        this.removeChild = function( options ) {
            if( options && options.node ) {
                var i = _children.indexOf( options.node );
                if( i >= 0 )
                    _children.remove( i );
            }
        };

        Object.defineProperty( this, 'component', {
            get: function() {
                return _component;
            },
            set: function( value ) {
                _component = value;                
            }
        } );
        
        Object.defineProperty( this, 'name', {
            get: function() {
                return _name;
            },
            set: function( value ) {
                _name = name;
            }
        } );
        
        Object.defineProperty( this, 'tags', {
            get: function() {
                return _tags.slice();   // Return a copy of the tags.
            }        
        } );
        
        this.addTag = function( options ) {
            if( options && options.tag && -1 != _tags.indexOf( options.tag ) )
                _tags.push( options.tag );                
        };
        
        this.removeTag = function( options ) {
            if( options && options.tag )
                _tags.remove( options.tag );
        };
        
    }

    return Node;

});
