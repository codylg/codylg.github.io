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

  // Move to range of 0 - 100
  x = x * (100 / 180);
  y = y * (100 / 180);

  output.innerHTML  = "x : " + x + "\n";
  output.innerHTML += "y: " + y + "\n";

  document.getElementById("double-exposure-wrapper").style.transform = "rotateY(" + x / 10 + "deg) rotateX(" + y / -10 + "deg)";
}

window.addEventListener('deviceorientation', handleOrientation);
