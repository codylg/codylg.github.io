var touchScreen = false;

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
