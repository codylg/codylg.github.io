var touchScreen = false;

window.addEventListener('touchstart', function() {
  touchScreen == true;
  scrollContainer.classList.remove("hijacked");
  console.log("touched!")
});




const scrollContainer = document.querySelector(".photo-gallery");

scrollContainer.addEventListener("wheel", (evt) => {

  console.log("scrolling!")

  if (window.innerHeight < window.innerWidth) {
    if (!touchScreen) {
      scrollContainer.classList.add("hijacked");

      evt.preventDefault();
      scrollContainer.scrollLeft += evt.deltaX;
      scrollContainer.scrollLeft += evt.deltaY;

      console.log("scrolling sideways!")
    }
  }
});
