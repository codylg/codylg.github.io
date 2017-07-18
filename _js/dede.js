var w = window.innerWidth;
var h = window.innerHeight;
var wrapper = document.getElementById("double-exposure-wrapper");

function calcWindowSize() {
  w = window.innerWidth;
  h = window.innerHeight;
}

window.onresize = calcWindowSize;

function addTransform(event) {
  var x = event.clientX;
  var y = event.clientY;

  var wrapperWidth = wrapper.offsetWidth;
  var wrapperHeight = wrapper.offsetWidth;
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
  var x = event.beta;  // In degree in the range [-180,180]
  var y = event.gamma; // In degree in the range [-90,90]

  // Because we don't want to have the device upside down
  // We constrain the x value to the range [-90,90]
  if (x >  90) { x =  90};
  if (x < -90) { x = -90};

  // To make computation easier we shift the range of
  // x and y to [0,180]
  x += 90;
  y += 90;
}

window.addEventListener('deviceorientation', handleOrientation);
