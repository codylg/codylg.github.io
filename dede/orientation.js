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
