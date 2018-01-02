var w = window.innerWidth;
var h = window.innerHeight;
var wrapper = document.getElementById("double-exposure-wrapper");

function calcWindowSize() {
  w = window.innerWidth;
  h = window.innerHeight;
}

window.onresize = calcWindowSize;
window.onload = calcWindowSize;

function addTransform(event) {
  var x = event.clientX;
  var y = event.clientY;

  var wrapperWidth = wrapper.offsetWidth;
  var wrapperHeight = wrapper.offsetHeight;
  var wrapperX = x - (w - wrapperWidth) / 2;
  var wrapperPx = ((wrapperX / wrapperWidth * 100) - 50) * 2;
  var wrapperY = y - (h - wrapperHeight) / 2;
  var wrapperPy = ((wrapperY / wrapperHeight * 100) - 50) * 2;

  wrapper.style.transform = "rotateY(" + wrapperPx / 10 + "deg) rotateX(" + wrapperPy / -10 + "deg)";
  document.getElementById("exposure").style.transform = "translate(" + wrapperPx / -7 + "px, " + wrapperPy / -7 + "px)";
  document.getElementById("depth-1").style.transform = "translate(" + wrapperPx / -5 + "px, " + wrapperPy / -6 + "px)";
  document.getElementById("depth-2").style.transform = "translate(" + wrapperPx / -4 + "px, " + wrapperPy / -5 + "px)";
  document.getElementById("depth-3").style.transform = "translate(" + wrapperPx / -3 + "px, " + wrapperPy / -4 + "px)";
  document.getElementById("depth-4").style.transform = "translate(" + wrapperPx / -2 + "px, " + wrapperPy / -3 + "px)";
  document.getElementById("gloss").style.opacity = wrapperPy / -100;
}

function clearTransform() {
  document.getElementById("double-exposure-wrapper").style.transform = "none";
  document.getElementById("exposure").style.transform = "none";
  document.getElementById("depth-1").style.transform = "none";
  document.getElementById("depth-2").style.transform = "none";
  document.getElementById("depth-3").style.transform = "none";
  document.getElementById("depth-4").style.transform = "none";
  document.getElementById("gloss").style.opacity = 0;
}

var output = document.querySelector('.output');

function handleOrientation(event) {
  var x = event.beta;  // Range of -180 to 180
  var y = event.gamma; // Range of -90 to 90

  // Adjust ranges to nearest 100
  x = x / 0.9;
  y = y / 0.9;

  // Adjust range limits of x
  if (x >  100) { x =  100};
  if (x < -50) { x = -50};

  document.getElementById("exposure").style.transform = "translate(" + y / (-7/2) + "px, " + x / (-7/2) + "px)";
  document.getElementById("depth-1").style.transform = "translate(" + y / (-5/2) + "px, " + x / (-6/2) + "px)";
  document.getElementById("depth-2").style.transform = "translate(" + y / (-4/2) + "px, " + x / (-5/2) + "px)";
  document.getElementById("depth-3").style.transform = "translate(" + y / (-3/2) + "px, " + x / (-4/2) + "px)";
  document.getElementById("depth-4").style.transform = "translate(" + y / (-2/2) + "px, " + x / (-3/2) + "px)";
}

window.addEventListener('deviceorientation', handleOrientation);
