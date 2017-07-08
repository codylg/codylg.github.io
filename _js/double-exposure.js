var w = window.innerWidth;
var h = window.innerHeight;
var wrapper = document.getElementById("double-exposure-wrapper");

function addTransform(event) {
  var x = event.clientX;
  var y = event.clientY;
  // var w = window.innerWidth;
  // var h = window.innerHeight;
  // var px = Math.floor(((x / w * 100) - 50) * 2);
  // var py = Math.floor(((y / h * 100) - 50) * 2);

  var wrapperWidth = wrapper.offsetWidth;
  var wrapperHeight = wrapper.offsetWidth;
  var wrapperX = x - (w - wrapperWidth) / 2;
  // var wrapperPx = Math.floor(((wrapperX / wrapperWidth * 100) - 50) * 2);
  var wrapperPx = ((wrapperX / wrapperWidth * 100) - 50) * 2;
  var wrapperY = y - (h - wrapperHeight) / 2;
  // var wrapperPy = Math.floor(((wrapperY / wrapperHeight * 100) - 50) * 2);
  var wrapperPy = ((wrapperY / wrapperHeight * 100) - 50) * 2;

  // document.getElementById("coords").innerHTML = "x: " + x + ", px: " + px + ", y: " + y + ", py: " + py + "<br/> wrapperPx: " + wrapperPx + ", wrapperPy: " + wrapperPy;
  wrapper.style.transform = "rotateY(" + wrapperPx / 10 + "deg) rotateX(" + wrapperPy / -10 + "deg)";
  document.getElementById("exposure").style.transform = "translate(" + wrapperPx / -7 + "px, " + wrapperPy / -7 + "px)";
  document.getElementById("bokeh1").style.transform = "translate(" + wrapperPx / -1 + "px, " + wrapperPy / -2 + "px)";
  document.getElementById("bokeh2").style.transform = "translate(" + wrapperPx / -2 + "px, " + wrapperPy / -3 + "px)";
  document.getElementById("bokeh3").style.transform = "translate(" + wrapperPx / -3 + "px, " + wrapperPy / -4 + "px)";
  document.getElementById("bokeh4").style.transform = "translate(" + wrapperPx / -4 + "px, " + wrapperPy / -5 + "px)";
  // document.getElementById("gloss").style.transform = "translate(" + wrapperX + "px, " + wrapperY + "px)";
  // document.getElementById("shadow").style.transform = "translate(" + wrapperX * 1 + "px, " + wrapperY * 1 + "px)";
}

// function clearTransform() {
//   document.getElementById("double-exposure-wrapper").style.transform = "none";
//   document.getElementById("exposure").style.transform = "none";
//   document.getElementById("bokeh1").style.transform = "none";
//   document.getElementById("bokeh2").style.transform = "none";
//   document.getElementById("bokeh3").style.transform = "none";
//   document.getElementById("bokeh4").style.transform = "none";
// }
