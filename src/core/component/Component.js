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
      this.type = options.type;
      this.subtype = options.subtype || [];
      this.requires = options.requires || [];
      this.parent = null;
  }
  Component.prototype.getType = function() {
      return this.type;
  };
  Component.prototype.getSubtype = function() {
      return this.subtype;
  };

  return Component;
});
