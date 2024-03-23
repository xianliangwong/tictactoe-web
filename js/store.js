const initialValue = {
  moves: [],
  history: {
    currentRoundGames: [],
    allGames: [],
  },
};

export default class Store {
  constructor(key, player) {
    this.storageKey = key;
    this.player = player;
  }

  get stats() {
    const state = this.#getState();

    return {
      playerWithStats: this.player.map((player) => {
        const wins = state.history.currentRoundGames.filter(
          (game) => game.status.winner?.id === player.id
        ).length;

        return {
          ...this.player,
          wins,
        };
      }),
      ties: state.history.currentRoundGames.filter(
        (game) => game.status.winner === null
      ).length,
    };
  }

  get game() {
    const state = this.#getState();
    // currentPlayer can only either be 0 or 1 , 8
    const currentPlayer = this.player[state.moves.length % 2];

    //check if winning condition is meet or it's a tie
    const winningPatterns = [
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

    for (const players of this.player) {
      const selectedSquareId = state.moves
        .filter((move) => move.player.id === players.id)
        .map((move) => move.squareId);

      for (const patterns of winningPatterns) {
        if (patterns.every((v) => selectedSquareId.includes(v))) {
          winner = players;
        }
      }
    }

    return {
      mov: state.moves,
      currentPlayer,
      status: {
        isComplete: winner != null || state.moves.length === 9,
        winner,
      },
    };
  }

  playerMoves(squareId) {
    const state = this.#getState();
    const stateClone = structuredClone(state);

    stateClone.moves.push({
      squareId,
      player: this.game.currentPlayer,
    });

    this.#saveState(stateClone);
  }

  resetState() {
    // const state = this.#getState();
    // const stateClone = structuredClone(state);

    // stateClone.moves = [];
    const stateClone = structuredClone(this.#getState());

    const { mov, status } = this.game;

    if (status.isComplete) {
      stateClone.history.currentRoundGames.push({
        mov,
        status,
      });
    }

    stateClone.moves = [];

    this.#saveState(stateClone);
  }

  newRound() {
    this.resetState();

    const stateClone = structuredClone(this.#getState());

    stateClone.history.allGames.push(...stateClone.history.currentRoundGames);
    stateClone.history.currentRoundGames = [];

    this.#saveState(stateClone);
  }

  #getState() {
    const item = window.localStorage.getItem(this.storageKey);
    return item ? JSON.parse(item) : initialValue;
  }

  #saveState(stateOrFn) {
    const prevState = this.#getState();

    let newState;

    switch (typeof stateOrFn) {
      case "function":
        newState = stateOrFn(prevState);
        break;
      case "object":
        newState = stateOrFn;
        break;
      default:
        throw new Error("Invalid arguement passed to saveState");
    }
    window.localStorage.setItem(this.storageKey, JSON.stringify(newState));
  }
}
