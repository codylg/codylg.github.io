var d = new Date();
var h = d.getHours();
var nightModeSwitch = document.getElementById("night-mode-switch");

function nightModeOn() {
  document.body.className = 'night-mode';
}

function nightModeOff() {
  document.body.className = '';
}

// Turn on night mode at night automatically, unless it has been set manually
if (location.pathname == "/") {

  if (localStorage.getItem('nightModePref')) {
    // The user has set a night mode preference

    if (localStorage.getItem('nightModePref') == 'on') {
      nightModeOn();
      nightModeSwitch.checked = true;
    } else if (localStorage.getItem('nightModePref') == 'off') {
      nightModeOff();
    }

  } else if ((h > 23 || h < 4)) {
    nightModeOn();
    nightModeSwitch.checked = true;
  }
}

function toggleNightMode() {

  if (nightModeSwitch.checked) {
    nightModeOff();
    localStorage.setItem('nightModePref', 'off'); // User has manually set night mode off
  } else {
    nightModeOn();
    localStorage.setItem('nightModePref', 'on'); // User has manually set night mode on
  }
}
