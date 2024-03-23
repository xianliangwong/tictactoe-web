import View from "./view.js";
import Store from "./store.js";

const App = {
  $: {
    menu: document.querySelector('[data-id="menu"'),
    menuItems: document.querySelector('[data-id="menu-items"]'),
    resetBtn: document.querySelector('[data-id="reset-button"]'),
    newRoundBtn: document.querySelector('[data-id="new-round-btn"]'),
    squares: document.querySelectorAll('[data-id="square"]'),
    winningScreen: document.querySelector('[data-id="winning-screen"]'),
    winningScreenText: document.querySelector('[data-id="win-screen-text"]'),
    winningScreenButton: document.querySelector('[data-id="win-screen-btn"]'),
    turn: document.querySelector('[data-id="turn"]'),
  },

  init() {
    App.registerAllEvents();
  },

  state: {
    moves: [],
  },

  getOppositePlayer(playerId) {
    if (playerId === 1) {
      return 2;
    } else {
      return 1;
    }
  },

  getGameStatus(moves) {
    const p1Moves = App.state.moves
      .filter((move) => move.playerId === 1)
      .map((move) => +move.squareId);

    const p2Moves = App.state.moves
      .filter((move) => move.playerId === 2)
      .map((move) => move.squareId);

    console.log(`p2 moves = ${p2Moves}`);

    //check if winning condition is meet or it's a tie
    const winningConditions = [
      [1, 2, 3],
      [1, 5, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 5, 7],
      [3, 6, 9],
      [4, 5, 6],
      [7, 8, 9],
    ];

    let winner = null;

    winningConditions.forEach((pattern) => {
      const p1Wins = pattern.every((v) => p1Moves.includes(v));
      const p2Wins = pattern.every((v) => p2Moves.includes(v));

      if (p1Wins) winner = 1;
      if (p2Wins) winner = 2;
    });

    return {
      status: moves.length === 9 || winner != null ? "complete" : "in-progress", //in-progress or comple
      winner, //1 or 2 or null , null = tie
    };
  },

  registerAllEvents() {
    //menu button
    App.$.menu.addEventListener("click", (event) => {
      App.$.menuItems.classList.toggle("hidden");
    });

    //reset button
    App.$.resetBtn.addEventListener("click", (event) => {
      console.log("reset");
    });

    //new round button
    App.$.newRoundBtn.addEventListener("click", (event) => {
      console.log("new round");
    });

    //win screen button
    App.$.winningScreenButton.addEventListener("click", (event) => {
      //reset the moves data
      App.state.moves = [];
      App.$.squares.forEach((square) => square.replaceChildren());
      App.$.winningScreen.classList.add("hidden");
    });

    //playing area
    App.$.squares.forEach((square) => {
      square.addEventListener("click", (event) => {
        /*  //implementation 1
        if (square.hasChildNodes()) {
          return;
        } */

        //implementation 2
        const hasMoves = (squareId) => {
          const existingMove = App.state.moves.find(
            (move) => move.squareId === squareId
          );
          return existingMove !== undefined;
        };

        if (hasMoves(+square.id)) {
          return;
        }

        //Determine last moves
        const lastMoves = App.state.moves.at(-1);
        const currentPlayer =
          App.state.moves.length === 0
            ? 1
            : App.getOppositePlayer(lastMoves.playerId);

        const nextPlayer = App.getOppositePlayer(currentPlayer);
        const turnSpan = document.createElement("span");
        const turnText = document.createElement("p");

        turnText.innerText = `Player ${nextPlayer}, you're up!`;

        const span = document.createElement("span");

        if (currentPlayer === 1) {
          span.classList.add("material-symbols-outlined", "yellow");
          span.textContent = "close";
          turnSpan.classList.add("material-symbols-outlined", "turquoise");
          turnSpan.textContent = "circle";
          App.$.turn.classList.remove("yellow");
          App.$.turn.classList.add("turquoise");
        } else {
          span.classList.add("material-symbols-outlined", "turquoise");
          span.textContent = "circle";
          turnSpan.classList.add("material-symbols-outlined", "yellow");
          turnSpan.textContent = "close";
          App.$.turn.classList.remove("turquoise");
          App.$.turn.classList.add("yellow");
        }

        App.state.moves.push({
          squareId: +square.id,
          playerId: currentPlayer,
        });

        console.log(App.state.moves);

        square.replaceChildren(span);
        App.$.turn.replaceChildren(turnSpan, turnText);

        const gameStatus = App.getGameStatus(App.state.moves);

        if (gameStatus.status === "complete") {
          App.$.winningScreen.classList.remove("hidden");

          let message = ``;
          if (gameStatus.winner) {
            message = `Player ${gameStatus.winner} wins !`;
          } else {
            message = "tie game";
          }
          App.$.winningScreenText.textContent = message;
        }
      });
    });
  },
};

//playersAttribute[0] = player 1, playersAttribute[1] = player 2,

const playersAttribute = [
  {
    id: 1,
    colorClass: "yellow",
    iconClass: "material-symbols-outlined",
    playerText: "close",
  },
  {
    id: 2,
    colorClass: "turquoise",
    iconClass: "material-symbols-outlined",
    playerText: "circle",
  },
];
// window.addEventListener("load", App.init);

function init() {
  const view = new View();
  const store = new Store("live-t3-storage-key", playersAttribute);

  function initView() {
    view.resetMoves();
    view.hideHiddenScreen();
    view.setTurnIndicator(store.game.currentPlayer);
    view.updateScoreBoard(
      store.stats.playerWithStats[0].wins,
      store.stats.playerWithStats[1].wins,
      store.stats.ties
    );
    view.initMoves(store.game.mov);
  }

  window.addEventListener("storage", () => {
    console.log("State changed from another tab");
    initView();
  });

  initView();

  view.bindGameResetEvent((event) => {
    store.resetState();
    initView();
  });

  view.bindNewRoundEvent((event) => {
    store.newRound();
    initView();
  });

  view.bindPlayerMoveEvent((square) => {
    const existingMove = store.game.mov.find(
      (move) => move.squareId === +square.id
    );

    if (existingMove) {
      return;
    }

    //adding icons when player click the playable area
    view.handlePlayerMoves(square, store.game.currentPlayer);

    //saving the moves/state and updating currentPlayer/nextPlayer
    store.playerMoves(+square.id);

    if (store.game.status.isComplete) {
      view.openHiddenScreen(
        store.game.status.winner
          ? `Player ${store.game.status.winner.id} wins !`
          : "Game Tied"
      );

      return;
    }

    //display next player indicator
    view.setTurnIndicator(store.game.currentPlayer);
  });
}

window.addEventListener("load", init());
