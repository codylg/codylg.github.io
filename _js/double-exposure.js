// function showCoords(event) {
//   var x = event.clientX;
//   var y = event.clientY;
//   var coords = "X coords: " + x + ", Y coords: " + y;
//   document.getElementById("demo").innerHTML = coords;
// }

function showCoords(event) {
  var x = event.clientX;
  var y = event.clientY;
  var w = window.innerWidth;
  var h = window.innerHeight;
  var px = x / w * 100
  var py = y / h * 100
  var coords = "X coords: " + x + "(" + px + ")" + ", Y coords: " + y + "(" + py + ")";
  document.getElementById("demo").innerHTML = coords;
  document.getElementById("exposure").style.transform = "translate(" + px / 7 + "px, " + py / 7 + "px)";
  document.getElementById("bokeh1").style.transform = "translate(" + px + "px, " + py / 2 + "px)";
  document.getElementById("bokeh2").style.transform = "translate(" + px / 2 + "px, " + py / 3 + "px)";
  document.getElementById("bokeh3").style.transform = "translate(" + px / 3 + "px, " + py / 4 + "px)";
  document.getElementById("bokeh4").style.transform = "translate(" + px / 4 + "px, " + py / 5 + "px)";
  // document.getElementById("bokeh").style.transform = "translate(" + px + "px, " + py / 3 + "px)";
  // document.getElementById("bokeh").style.transform = "translate(" + px + "px, " + py / 3 + "px) scale(" + (py / 1000 + 1) + ")";
}
