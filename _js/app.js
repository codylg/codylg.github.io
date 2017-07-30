var d = new Date();
var h = d.getHours();

if ((h > 21 || h < 5) && location.pathname == "/") {
  document.body.className = 'night-mode';
}
