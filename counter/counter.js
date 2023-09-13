// Check how many characters in an input, used to set width
function characterLength(value) {
  var characterCount = value.toString().length;
  return characterCount + "ch";
}

function increaseNumber(inputNumber, amount = 1) {
  var inputElement = document.getElementById("number" + inputNumber);
  var currentValue = parseInt(inputElement.value);
  if (!currentValue) { currentValue = 0; }
  var newValue = currentValue + amount;

  inputElement.value = newValue;
  inputElement.style.width = characterLength(newValue);

  if (currentValue == (amount * -1)) {
    inputElement.classList.add("empty");
  } else {
    inputElement.classList.remove("empty");
  }
}

function decreaseNumber(inputNumber, amount = 1) {
  var inputElement = document.getElementById("number" + inputNumber);
  var currentValue = parseInt(inputElement.value);
  if (!currentValue) { currentValue = 0; }
  var newValue = currentValue - amount;

  inputElement.value = newValue;
  inputElement.style.width = characterLength(newValue);

  if (currentValue == amount) {
    inputElement.classList.add("empty");
  } else {
    inputElement.classList.remove("empty");
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
  event.target.style.width = characterLength(inputValue);

  // Add or remove the empty class if the value is 0 or not
  if (inputValue == "0") {
    event.target.classList.add("empty");
  } else {
    event.target.classList.remove("empty");
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
