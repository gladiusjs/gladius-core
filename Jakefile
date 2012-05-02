var PATH = process.env["PATH"].split( ':' );
var MODULES_BIN = process.cwd() + "/node_modules/.bin";
PATH.unshift( MODULES_BIN );
PATH = PATH.join( ':' );

process.env["PATH"] = PATH;

var j = require( "jake" );

desc( "lint code" );
task( "lint", [], require( "./tools/jake-tasks/lint" ) );