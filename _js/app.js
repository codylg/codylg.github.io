var d = new Date();
var h = d.getHours();
var nightModeSwitch = document.getElementById("night-mode-switch");

if ((h > 23 || h < 4) && location.pathname == "/") {
  document.body.className = 'night-mode';
  nightModeSwitch.checked = true;
}

function toggleNightMode() {

  if (nightModeSwitch.checked) {
    document.body.className = '';
  } else {
    document.body.className = 'night-mode';
  }
}
