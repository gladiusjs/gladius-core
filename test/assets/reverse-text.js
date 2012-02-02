function reverseText( options ) {
  options = options || {};
  
  var text = options.value || '';
  var charArray = text.split("");
  charArray.reverse();
  
  return charArray.join("");
}
