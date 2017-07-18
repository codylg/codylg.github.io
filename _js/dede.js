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

// document.getElementById("demo-quaternion").innerHTML = "quaternion";
// document.getElementById("demo-matrix").innerHTML = "matrix";
// document.getElementById("demo-euler").innerHTML = "euler";




// Create a new FULLTILT Promise for e.g. *compass*-based deviceorientation data
var promise = new FULLTILT.getDeviceOrientation({ 'type': 'world' });

// FULLTILT.DeviceOrientation instance placeholder
var deviceOrientation;

promise
  .then(function(controller) {
    // Store the returned FULLTILT.DeviceOrientation object
    deviceOrientation = controller;
  })
  .catch(function(message) {
    console.error(message);

    // Optionally set up fallback controls...
    // initManualControls();
  });

(function draw() {

  // If we have a valid FULLTILT.DeviceOrientation object then use it
  if (deviceOrientation) {

    // Obtain the *screen-adjusted* normalized device rotation
    // as Quaternion, Rotation Matrix and Euler Angles objects
    // from our FULLTILT.DeviceOrientation object
    var quaternion = deviceOrientation.getScreenAdjustedQuaternion();
    var matrix = deviceOrientation.getScreenAdjustedMatrix();
    var euler = deviceOrientation.getScreenAdjustedEuler();

    // Do something with our quaternion, matrix, euler objects...
    console.debug(quaternion);
    console.debug(matrix);
    console.debug(euler);

    document.getElementById("demo-quaternion").innerHTML = quaternion;
    document.getElementById("demo-matrix").innerHTML = matrix;
    document.getElementById("demo-euler").innerHTML = euler;
  }

  // Execute function on each browser animation frame
  requestAnimationFrame(draw);

})();
