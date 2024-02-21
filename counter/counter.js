// Check how many characters in an input, used to set width
function characterLength(value) {
  var characterCount = value.toString().length;
  return characterCount + "ch";
}

let holdTimer;

// Function to be executed when button is held for a set timeout
function onButtonHold(inputElement, parentCard) {
  clearTimeout(holdTimer);
  inputElement.value = 999;
  inputElement.style.width = characterLength(999);

  if (parentCard.classList.contains("golem-foundry")) {
    parentCard.classList.add("can-golem");
  }
}

// Function to be clear the hold timer when a button is released
function buttonRelease() {
  clearTimeout(holdTimer);
}

// Function to increase a counter by an amount
function increaseNumber(inputNumber, amount = 1) {
  var inputElement = document.getElementById("number" + inputNumber);
  var parentCard = inputElement.closest("div");
  var currentValue = parseInt(inputElement.value);
  if (!currentValue) { currentValue = 0; }
  var newValue = currentValue + amount;

  // Restart the hold timer
  clearTimeout(holdTimer);
  holdTimer = setTimeout(function() {
    onButtonHold(inputElement, parentCard);
  }, 2400);

  inputElement.value = newValue;
  inputElement.style.width = characterLength(newValue);

  if (newValue > 0) {
    inputElement.classList.remove("empty");

    if (parentCard.classList.contains("mana-count")) {
      parentCard.classList.add("active");
    }
  }

  if (parentCard.classList.contains("golem-foundry") && newValue >= 3) {
    parentCard.classList.add("can-golem");
  }
}

// Function to decrease a counter by an amount
function decreaseNumber(inputNumber, amount = 1) {
  var inputElement = document.getElementById("number" + inputNumber);
  var parentCard = inputElement.closest("div");
  var currentValue = parseInt(inputElement.value);
  if (!currentValue) { currentValue = 0; }
  var newValue = currentValue - amount;
  if (newValue < 0) { newValue = 0; }

  inputElement.value = newValue;
  inputElement.style.width = characterLength(newValue);

  if (newValue == 0) {
    inputElement.classList.add("empty");
    parentCard.classList.remove("active");
  }

  if (parentCard.classList.contains("golem-foundry") && newValue < 3) {
    parentCard.classList.remove("can-golem");
  }
}

function resetNumber(inputNumber) {
  var inputElement = document.getElementById("number" + inputNumber);

  inputElement.value = 0;
  inputElement.style.width = "1ch";
  inputElement.classList.add("empty");
}

// Function to execute when text is typed into the inputs
function handleInput(event) {
  const inputValue = event.target.value;
  var parentCard = event.target.closest("div");
  event.target.style.width = characterLength(inputValue);

  // Add or remove the empty class if the value is 0 or not
  if (inputValue == "0") {
    event.target.classList.add("empty");
    parentCard.classList.remove("active");
  } else {
    event.target.classList.remove("empty");
    parentCard.classList.add("active");
  }

  if (parentCard.classList.contains("golem-foundry") && inputValue >= 3) {
    parentCard.classList.add("can-golem");
  } else {
    parentCard.classList.remove("can-golem");
  }
}

// Function to highlight text in the input when clicked
function highlightInputText(event) {
  const inputElement = event.target;
  inputElement.select();
}

// Get all text input elements
const inputs = document.querySelectorAll('input[type="number"]');

// Attach an event listener to each input
inputs.forEach((input) => {
  input.addEventListener("input", handleInput);
  input.addEventListener('click', highlightInputText);
});

// Function to empty mana pool by resetting all mana values to 0
const manaInputs = document.querySelectorAll("#mana-pool input");

function emptyManaPool() {
  manaInputs.forEach((manaInput) => {
    manaInput.value = 0;
    manaInput.style.width = "1ch";
    manaInput.classList.add("empty");
    manaInput.closest("div").classList.remove("active");
  });
}

// Function to reset the game
function newGame() {

  // Require double tap to confirm reset
  const newGameButton = document.getElementById("new-game");

  if (newGameButton.textContent == "New Game") {
    newGameButton.textContent = "Are You Sure?";

    // Reset back if no confirmation
    setTimeout(function() {
      newGameButton.textContent = "New Game";
    }, 3000);
  } else {
    newGameButton.textContent = "New Game";
    inputs.forEach((input) => {
      if (input.classList.contains("life")) {
        input.value = 20;
        input.style.width = "2ch";
        input.classList.remove("empty");
      } else {
        input.value = 0;
        input.style.width = "1ch";
        input.classList.add("empty");
        input.closest("div").classList.remove("active");
        input.closest("div").classList.remove("can-golem");
      }
    });
    swiftspearCounter.value = "+0/+0";
    swiftspearCounter.classList.add("empty");
    crasherCounter.value = "+0/+0";
    crasherCounter.classList.add("empty");
    kilnCounter.value = "+0/+0";
    kilnCounter.classList.add("empty");
  }
}

// Kiln fiend specific
const prowessCounter = document.getElementById("prowess-counter");
const swiftspearCounter = document.getElementById("swiftspear-counter");
const crasherCounter = document.getElementById("crasher-counter");
const kilnCounter = document.getElementById("kiln-counter");

// Function to increase the prowess count and update creature counters
function increaseProwess() {
  var currentValue = parseInt(prowessCounter.value);
  var newValue = currentValue + 1;

  prowessCounter.value = newValue;
  prowessCounter.style.width = characterLength(newValue);

  swiftspearCounter.value = `+${newValue}/+${newValue}`;
  crasherCounter.value = `+${(newValue * 2)}/+0`;
  kilnCounter.value = `+${(newValue * 3)}/+0`;

  if (currentValue == "0") {
    prowessCounter.classList.remove("empty");
    swiftspearCounter.classList.remove("empty");
    crasherCounter.classList.remove("empty");
    kilnCounter.classList.remove("empty");
  }
}

function resetProwess() {
  prowessCounter.value = 0;
  prowessCounter.style.width = "1ch";
  prowessCounter.classList.add("empty");
  swiftspearCounter.value = "+0/+0";
  swiftspearCounter.classList.add("empty");
  crasherCounter.value = "+0/+0";
  crasherCounter.classList.add("empty");
  kilnCounter.value = "+0/+0";
  kilnCounter.classList.add("empty");
}
