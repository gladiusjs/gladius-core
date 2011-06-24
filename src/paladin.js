(function (window, document) {

  var Paladin = window.Paladin = function () {

    if (this === window) {
      throw new Error('Must instantiate Paladin with "new".');
    } //if

  };

  var Entity = function( name ) {
      this.name = name;
  };
  Entity.prototype.listen = function( event, callback ) {    
  };
  Entity.prototype.listenOnce = function( event, callback ) {    
  };
  Entity.prototype.ignore = function( event ) {    
  };
  Entity.prototype.ignoreAll = function() {   
  };
  Entity.prototype.addComponent = function( component, name ) {      
  };
  Entity.prototype.removeComponent = function( component ) {      
  };

  var extend = {
      Entity: Entity
  };  

})(window, document);

