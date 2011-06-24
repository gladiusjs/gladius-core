(function (window, document, undefined, Paladin) {

  var subsystems = {};

  var Subsystem = Paladin.Subsystem = Paladin.prototype.Subsystem = new (function () {

    var that = this;

    this.register = function ( name, subsystem ) {
      subsystems[name] = subsystem;
    };

    this.unregister = function ( name ) {
      delete subsystems[name];
    };

    this.get = function ( name ) {
      return subsystems[name];
    };

    this.start = function ( name ) {
      var ss = that.get(name);
      if (ss) {
        return ss.start();
      } //if
      return undefined;
    };

    this.stop = function ( name ) {
      var ss = that.get(name);
      if (ss) {
        return ss.stop();
      } //if
      return undefined;
    };

  })();

})(window, document, undefined, Paladin);
