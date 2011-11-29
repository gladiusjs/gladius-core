/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */

define( function ( require ) {

    /* Configuration Node
     * 
     * Structure for storing configuration settings
     */
    var ConfNode = function( name, parent ) {

       var that = this;

       this.name = name;
       this.parent = parent;
       this.children = {};
       this.listeners = {};

       // Node's configuration value
       var _value = '';
       Object.defineProperty( this, 'value', {
           get: function() {
               return _value;
           },

           set: function( value ) {
               if ( _value !==  value ) {  // Additionally check if incoming value is string?

                   var oldVal = _value;

                   // Set to new value before notifying
                   _value = value;
                   this.notify( '/', value, oldVal );
               }
           }
       });

       // Notifies us that a value stored somewhere in the subtree rooted by
       // this node has changed.
       this.notify = function ( path, newVal, oldVal ) {

           // Tell our listeners
           for ( var key in this.listeners ) {
               if ( this.listeners.hasOwnProperty( key ) ) {
                   this.listeners[key]( path, newVal, oldVal );
               }
           }

           // Pass up the notification
           if ( this.parent ) {

               // Build up the path
               if ( path.length === 1 && path === '/' ) {
                   path = path + this.name;
               } else {
                   path = '/' + this.name + path;
               }

               this.parent.notify( path, newVal, oldVal );
           }
       };

       // Traverse the node tree given a path
       this.traverse = function( path, doCreatePath ) {

           var targetNode;

           if ( path.length === 1 && path.charAt( 0 ) === '/' ) {
               targetNode = this;
           } else {

               // Parse path and traverse the node tree
               var pathElems = path.split('/'),
                   curNode = this,
                   successful = true;

               for ( var i = 0, iMax = pathElems.length; successful && i < iMax; ++ i ) {
                   var curElem = pathElems[i];

                   if ( curElem !== '' ) {

                       // Look for name in children of current node
                       var nextNode = curNode.children[curElem];
                       if ( nextNode !== undefined ) {
                           curNode = nextNode;
                       } else if ( doCreatePath ) {
                           nextNode = new ConfNode( curElem, curNode );
                           curNode.children[curElem] = nextNode;
                           curNode = nextNode;
                       } else {
                           // Path leads nowhere, leave
                           successful = false;
                           break;
                       }
                   }
               }

               if ( successful ) {
                   targetNode = curNode;
               }
           }

           return targetNode;
       };

       // Serializes this node and all of its children as JSON
       this.getJSON = function() {
           var resultJSON = {},
               children = this.children;

           if ( _value !== '' ) {
               resultJSON['/'] = _value;
           }

           for ( var childKey in children ) {
               if ( children.hasOwnProperty( childKey ) ) {
                   var child = children[childKey],
                       childJSON = child.getJSON(),
                       childJSONKeys = Object.keys( childJSON );

                   for ( var k = 0, kmaxlen = childJSONKeys.length; k < kmaxlen; ++k ) {
                       resultJSON['/' + child.name + childJSONKeys[k]] =
                           childJSON[childJSONKeys[k]];
                   }
               }
           }

           return resultJSON;
       };

       // Clears this node and all child nodes
       this.clear = function() {
           var children = this.children;

           this.value = '';

           for ( var childKey in children ) {
               if ( children.hasOwnProperty( childKey ) ) {
                   children[childKey].clear();
               }
           }
       };

       // Builds a parent path for this node
       this.getParentPath = function() {
           resultPath = '';

           var node = this;
           while ( node && node.parent ) {
               resultPath = '/' + node.name + resultPath;
               node = node.parent;
           }

           return resultPath;
       };
    };

    return ConfNode;
});