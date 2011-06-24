(function (window, document, Paladin) {

  var subsystems = {};

  var Subsystem = Paladin.Subsystem = Paladin.prototype.Subsystem = new (function () {

    this.create = function ( name, subsystem ) {
      subsystems[name] = subsystem;
    };

    this.destroy = function ( name ) {
      delete subsystems[name];
    };

    this.get = function ( name ) {
      return subsystems[name];
    };

  })();

})(window, document, Paladin);
