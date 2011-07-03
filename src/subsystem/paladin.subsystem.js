(function (window, document, undefined, Paladin) {

  var subsystems = {};

  Paladin.subsystem = Paladin.prototype.subsystem = {

    register: function ( name, subsystem ) {
      subsystems[name] = subsystem;
      Paladin[name] = Paladin.prototype[name] = subsystem;
    },

    init: function () {
      for ( var name in subsystems ) {
        if ( subsystems.hasOwnProperty(name) ) {
          subsystems[name].start && subsystems[name].start();
        } //if
      } //for
    },

    get: function ( name ) {
      return subsystems[name];
    },

  };

})(window, document, undefined, Paladin);
