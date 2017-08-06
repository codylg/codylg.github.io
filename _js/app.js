var d = new Date();
var h = d.getHours();
var nightModeSwitch = document.getElementById("night-mode-switch");

if ((h > 21 || h < 5) && location.pathname == "/") {
  document.body.className = 'night-mode';
  nightModeSwitch.checked = true;
}

function toggleNightMode() {
  console.log('Clicky');

  if (nightModeSwitch.checked) {
    document.body.className = '';
    console.log('Night mode off');
  } else {
    document.body.className = 'night-mode';
    console.log('Night mode on');
  }
}
