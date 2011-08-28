/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function( require ) {

    var Spatial = require( './Spatial' );

    /***
     * Node
     *
     * A node is a single scene element. It contains tree (parent/children) data and
     * spatial (position/rotation) data.
     * 
     * Options:
     *   parent : a parent node
     *   children : a list of child nodes
     *   spatial : spatial parameters for this node
     *   component : a component object
     *   name : a string identifier for this node
     */ 
    function Node( paladin, options ) {
        var options = options ? options : {};
        var spatial = options.spatial ? options.spatial : new Spatial();
        var component = options.component ? options.component : null;
        this.parent = null;
        this.children = [];
        var that = this;

        this.setParent = function( options ) {
            var lastParent = parent || null;
            if( null != lastParent )
                lastParent.removeChild( this );
            parent = options && options.node ? options.node : null;
            if( null != parent )
                parent.addChild( this );
            return lastParent;
        };

        this.getParent = function() {
            return parent;
        };

        this.addChild = function( options ) {
            if( optons && options.node )
                options.node.setParent( this );
        };

        this.getChildren = function() {
            return children;
        };

        this.setComponent = function( options ) {
            lastComponent = component || null;
            component = options.component;
            return lastComponent;
        };

    }

    return Node;

});
