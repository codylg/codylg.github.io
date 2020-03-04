var d = new Date();
var h = d.getHours();
var nightModeSwitch = document.getElementById("night-mode-switch");

function nightModeOn() {
  document.body.className = 'night-mode';
}

function nightModeOff() {
  document.body.className = '';
}

// Turn on night mode if it has been set manually
if (location.pathname == "/") {

  if (localStorage.getItem('nightModePref')) {
    // The user has set a night mode preference

    if (localStorage.getItem('nightModePref') == 'on') {
      nightModeOn();
      nightModeSwitch.checked = true;
    } else if (localStorage.getItem('nightModePref') == 'off') {
      nightModeOff();
    }
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

function toggleNightModeKeyboard(e) {

  if (e.keyCode == 13 || e.which == 13) {
    if (nightModeSwitch.checked) {
      nightModeOff();
      nightModeSwitch.checked = false;
      localStorage.setItem('nightModePref', 'off'); // User has manually set night mode off
    } else {
      nightModeOn();
      nightModeSwitch.checked = true;
      localStorage.setItem('nightModePref', 'on'); // User has manually set night mode on
    }
  }
}
