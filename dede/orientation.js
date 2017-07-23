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
  // x += 90;
  // y += 90;

  // Move to range of -100 to 100
  x = x / 0.9;
  y = y / 0.9;

  output.innerHTML  = "x : " + x + "\n";
  output.innerHTML += "y : " + y + "\n";

  // document.getElementById("double-exposure-wrapper").style.transform = "rotateY(" + y + "deg) rotateX(" + x * -1 + "deg)";
  document.getElementById("exposure").style.transform = "translate(" + y / (-7/2) + "px, " + x / (-7/2) + "px)";
  document.getElementById("depth-1").style.transform = "translate(" + y / (-5/2) + "px, " + x / (-6/2) + "px)";
  document.getElementById("depth-2").style.transform = "translate(" + y / (-4/2) + "px, " + x / (-5/2) + "px)";
  document.getElementById("depth-3").style.transform = "translate(" + y / (-3/2) + "px, " + x / (-4/2) + "px)";
  document.getElementById("depth-4").style.transform = "translate(" + y / (-2/2) + "px, " + x / (-3/2) + "px)";
  // document.getElementById("gloss").style.opacity = x / -10;
}

window.addEventListener('deviceorientation', handleOrientation);
