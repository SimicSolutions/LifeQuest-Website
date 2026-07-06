const startButton = document.getElementById("startButton");
const startScreen = document.getElementById("startScreen");
const blackTransition = document.getElementById("blackTransition");
const letterScreen = document.getElementById("letterScreen");

startButton.addEventListener("click", () => {
  startScreen.classList.add("fade-out");

  setTimeout(() => {
    startScreen.classList.add("hidden");
    blackTransition.classList.remove("hidden");
    blackTransition.classList.add("active");
  }, 1050);

  setTimeout(() => {
    blackTransition.classList.add("hidden");
    letterScreen.classList.remove("hidden");
    letterScreen.classList.add("fade-in");
    window.scrollTo(0, 0);
  }, 2600);
});