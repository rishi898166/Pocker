import io from "socket.io-client";

import {
  playerState2,
  opponentState2,
  opponent2State2,
  sstate2,
} from "./containers";

class Handler {
  constructor() {
    this.player = playerState2;
    this.opponent = opponentState2;
    this.opponent2 = opponent2State2;
    this.socket = null;
    this.gameID = null;
  }

  handle(data) {
    if (data.msg === "gameStart") {
      this.handleGameStart(data.payload);
    } else if (data.msg === "deal") {
      const xs = data.payload;
      this.player.handleDeal(xs);
    } else if (data.msg === "oppoDeal") {
      const xs = data.payload;
      this.opponent.handleDeal(xs);
    } else if (data.msg === "oppoSet") {
      this.opponent.move(...data.payload);
    } else if (data.msg === "oppo2Deal") {
      const xs = data.payload;
      this.opponent2.handleDeal(xs);
    } else if (data.msg === "oppo2Set") {
      this.opponent2.move(...data.payload);
    } else if (data.msg === "newGame") {
      this.handleNewGame();
    } else if (data.msg === "terminate") {
      const reason = data.payload;
      alert(reason);
    } else if (data.msg === "roundEnd") {
      this.handleNewGame();
      const table = data.payload;
      this.player.changeChips(table[this.player.state.name]);
      this.opponent.changeChips(table[this.opponent.state.name]);
      this.opponent2.changeChips(table[this.opponent2.state.name]);
      sstate2.setTable(data.payload);
      sstate2.showEndOfRound();
    } else {
      alert(`Unrecognized message:\n\n ${data}`);
    }
  }

  handleGameStart({
    yourChips,
    opponentName,
    opponentChips,
    opponent2Name,
    opponent2Chips,
    gameID,
  }) {
    this.gameID = gameID;
    this.player.setChips(yourChips);
    this.opponent.setName(opponentName);
    this.opponent.setChips(opponentChips);
    this.opponent2.setName(opponent2Name);
    this.opponent2.setChips(opponent2Chips);
    this.handleNewGame();
  }

  handleNewGame() {
    this.player.resetCards();
    this.opponent.resetCards();
    this.opponent2.resetCards();
    sstate2.showGameScreen();
  }

  set(fromIdx, toRow, toIdx) {
    this.socket.emit(this.gameID, {
      msg: "set",
      payload: [fromIdx, toRow, toIdx],
    });
  }

  joinGame(playerName) {
    this.connect();
    this.socket.emit("joinGame2", { playerName });
    if (this.player.state.name === null) {
      this.player.setName(playerName);
      this.opponent.setName("Waiting for opponent...");
      this.opponent2.setName("Waiting for opponent...");
    } else {
      this.opponent.setName(playerName);
      this.opponent2.setName("Waiting for opponent...");
    }
  }

  connect() {
    this.socket = io.connect();
    this.socket.on("reply", (data) => this.handle(data));
    this.socket.on("disconnect", () => {
      alert("Game over.");
      sstate2.showMainMenu();
      playerState2.resetCards();
      opponentState2.resetCards();
      opponent2State2.resetCards();
    });
  }
}

const handler = new Handler();

export default handler;
