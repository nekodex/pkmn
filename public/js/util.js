function pad (str, max) {
  var str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}
