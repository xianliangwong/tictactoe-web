export default class View {
  //short hand name for class property
  $ = {};
  $$ = {};

  constructor() {
    this.$.menu = this.#qs('[data-id="menu"');
    this.$.menuItems = this.#qs('[data-id="menu-items"]');
    this.$.menuButtons = this.#qs('[data-id="menu-button"]');
    this.$.resetBtn = this.#qs('[data-id="reset-button"]');
    this.$.newRoundBtn = this.#qs('[data-id="new-round-btn"]');
    this.$.winningScreen = this.#qs('[data-id="winning-screen"]');
    this.$.winningScreenText = this.#qs('[data-id="win-screen-text"]');
    this.$.winningScreenButton = this.#qs('[data-id="win-screen-btn"]');
    this.$.turn = this.#qs('[data-id="turn"]');
    this.$.p1Wins = this.#qs('[data-id="p1-wins"]');
    this.$.p2Wins = this.#qs('[data-id="p2-wins"]');
    this.$.totalTies = this.#qs('[data-id="total-ties"]');

    this.$$.squares = this.#qsAll('[data-id="square"]');

    //UI only event listeners that doesn't need to keep track of states
    this.$.menuButtons.addEventListener("click", (events) => {
      this.#toggleMenu();
    });
  }

  //register event listeners
  bindGameResetEvent(handler) {
    this.$.winningScreenButton.addEventListener("click", handler);
    this.$.resetBtn.addEventListener("click", handler);
  }

  bindNewRoundEvent(handler) {
    this.$.newRoundBtn.addEventListener("click", handler);
  }

  bindPlayerMoveEvent(handler) {
    this.$$.squares.forEach((square) => {
      square.addEventListener("click", () => {
        handler(square);
      });
    });
  }

  //DOM helper methods

  updateScoreBoard(p1WinsCount, p2WinsCount, tiesCount) {
    this.$.p1Wins.innerText = `${p1WinsCount} wins`;
    this.$.p2Wins.innerText = `${p2WinsCount} wins`;
    this.$.totalTies.innerText = `${tiesCount}`;
  }

  openHiddenScreen(message) {
    this.$.winningScreen.classList.remove("hidden");
    this.$.winningScreenText.innerText = message;
  }

  hideHiddenScreen() {
    this.#closeMenu();
    this.$.winningScreen.classList.add("hidden");
  }

  resetMoves() {
    this.$$.squares.forEach((square) => square.replaceChildren());
  }

  //init the moves player had made even after page is refresh
  initMoves(moves) {
    this.$$.squares.forEach((square) => {
      const existingMoves = moves.find((move) => move.squareId === +square.id);

      if (existingMoves) {
        this.handlePlayerMoves(square, existingMoves.player);
      }
    });
  }

  #closeMenu() {
    this.$.menuItems.classList.add("hidden");
    this.$.menuButtons.classList.remove("border");
    const textMenuButton = this.$.menuButtons.querySelector("span");
    textMenuButton.textContent = "arrow_drop_down";
  }

  #toggleMenu() {
    this.$.menuItems.classList.toggle("hidden");
    this.$.menuButtons.classList.toggle("border");
    if (this.$.menuButtons.classList.contains("border") === false) {
      const textMenuButton = this.$.menuButtons.querySelector("span");
      textMenuButton.textContent = "arrow_drop_down";
      // const menuButtonText = document.createElement("p");
      // menuButtonText.textContent = "Actions";
      // const arrowUpIcon = document.createElement("span");
      // arrowUpIcon.classList.add("material-symbols-outlined");
      // arrowUpIcon.textContent = "arrow_drop_up";

      // this.$.menuButtons.replaceChildren(menuButtonText, arrowUpIcon);
    } else {
      const textMenuButton = this.$.menuButtons.querySelector("span");
      textMenuButton.textContent = "arrow_drop_up";
      // const arrowDownIcon = document.createElement("span");
      // const menuButtonText = document.createElement("p");
      // menuButtonText.textContent = "Actions";
      // arrowDownIcon.classList.add("material-symbols-outlined");
      // arrowDownIcon.textContent = "arrow_drop_down";
      // this.$.menuButtons.replaceChildren(menuButtonText, arrowDownIcon);
    }
  }

  setTurnIndicator(player) {
    const turnIcon = document.createElement("span");
    const turnText = document.createElement("p");

    // this.$.turn.classList.add(player === 1 ? "yellow" : "turquoise");
    // this.$.turn.classList.remove(player === 1 ? "turquoise" : "yellow");

    //refactor ver
    turnIcon.classList.add(player.iconClass, player.colorClass);
    turnText.classList.add(player.colorClass);

    turnIcon.textContent = player.playerText;
    turnText.innerText = `Player ${player.id}, you're up!`;

    // turnIcon.textContent = player === 1 ? "close" : "circle";
    // turnText.innerText =
    //   player === 1 ? "Player 1, you're up!" : "Player 2, you're up!";
    // turnIcon.classList.add("material-symbols-outlined");

    this.$.turn.replaceChildren(turnIcon, turnText);
  }

  handlePlayerMoves(squareEl, player) {
    const movesIcon = document.createElement("span");

    movesIcon.classList.add(player.iconClass, player.colorClass);
    movesIcon.textContent = player.playerText;

    squareEl.replaceChildren(movesIcon);
  }

  #qs(selector, parent) {
    const el = parent
      ? parent.querySelector(selector)
      : document.querySelector(selector);

    if (!el) {
      throw new Error("couldn't find elements");
    }

    return el;
  }

  #qsAll(selector) {
    const elList = document.querySelectorAll(selector);
    if (!elList) {
      throw new Error("couldn't find elements");
    }

    return elList;
  }
}
