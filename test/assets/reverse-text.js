function reverseText( options ) {
  options = options || {};
  
  var text = options.value;

  return text.split().reverse().toString();
}
