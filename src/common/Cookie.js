/*jshint white: false, strict: false, plusplus: false, onevar: false,
  nomen: false */
/*global define: false, console: false, window: false, setTimeout: false */


/* Cookie
 *
 * Common cookie manipulation functions.
 * Originally found on Peter-Paul Koch's site, quirksmode; unaltered.
 * http://www.quirksmode.org/js/cookies.html
 */
var _Cookie = function( options ) {
    options = options || {};

    this.createCookie = function(name,value,days) {
            var expires = null;
            if (days) {
                var date = new Date();
                date.setTime(date.getTime()+(days*24*60*60*1000));
                expires = "; expires="+date.toGMTString();
            }
            else expires = "";
            document.cookie = name+"="+value+expires+"; path=/";
    };

    this.readCookie = function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)===' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    };

    this.eraseCookie = function(name) {
        createCookie(name,"",-1);
    };
};

window.gladiusCookie = new _Cookie();
