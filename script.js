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
    // IMPORTANT: remove "active" before adding "hidden".
    // Previously "active" was never removed, so the element ended up with
    // classes "black-transition active hidden" at the same time. Because
    // ".black-transition.active { display: block; }" (specificity 0,2,0)
    // beats ".hidden { display: none; }" (specificity 0,1,0), the overlay
    // stayed display:block, position:fixed, inset:0, z-index:10 forever —
    // an invisible full-page layer sitting on top of the join form and
    // silently swallowing every click.
    blackTransition.classList.remove("active");
    blackTransition.classList.add("hidden");
    letterScreen.classList.remove("hidden");
    letterScreen.classList.add("fade-in");
    window.scrollTo(0, 0);
  }, 2600);
});