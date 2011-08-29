/*jshint white: false, strict: false, */
/*global define: false */

define( function ( require ) {

  /***
   * Component (prototype interface)
   *
   * A component is a basic unit of game functionality. Components are narrow in scope and are composed
   * together by entities to form game objects.
   */
  function Component( options ) {
    var node = options.node ? options.node : null;
  }

  return Component;

});
