(function (window, document, undefined, Paladin) {

  var subsystems = {};

  Paladin.subsystem = {

    register: function ( name, subsystem ) {
      subsystems[name] = subsystem;
      Paladin[name] = subsystem;
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
