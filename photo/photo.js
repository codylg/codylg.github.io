var touchScreen = false;

// window.onLoad = function() {
//   console.log("loaded");
//   document.querySelector(".photo-gallery").classList.add("loading");
// }

window.addEventListener('touchstart', function() {
  touchScreen == true;
  scrollContainer.classList.remove("hijacked");
});

const scrollContainer = document.querySelector(".photo-gallery");

scrollContainer.addEventListener("wheel", (evt) => {

  if (window.innerHeight < window.innerWidth) {
    if (!touchScreen) {
      scrollContainer.classList.add("hijacked");

      evt.preventDefault();
      scrollContainer.scrollLeft += evt.deltaX;
      scrollContainer.scrollLeft += evt.deltaY;
    }
  }
});
