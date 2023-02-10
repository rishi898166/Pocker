const { Deck } = require("./card.js");
const logger = require("./logger.js");
const Player = require("./player.js");
const scorer = require("./standardRanker.js");

const activeNames = new Set();
const runningGames = new Map([]);
let queuedGame = undefined;

const activeNames2 = new Set();
const runningGames2 = new Map([]);
let queuedGame2 = undefined;
let playerNum = 0;

class GameHandler {
  constructor(socket, playerName, gameType) {
    this.gameID = Math.random().toString(36).substr(2, 9);
    this.gameType = gameType;

    this.player1 = new Player();
    this.player1.setName(playerName);
    this.player1.socket = socket;
    socket.on("disconnect", () =>
      this.tearDown("Game over. A player has disconected.")
    );
    this.idToPlayer = {};
    this.idToPlayer[socket.id] = this.player1;
    this.idToOpponent = {};

    this.status = "wait";
  }

  /**
   * Handles a message from one of the players.
   * @param {socket} socket - The socket on which the message was received.
   * @param {object} data - Message content.
   */
  handle(socket, data) {
    logger.info(
      `Handler for ${this.gameID} needs to handle ${JSON.stringify(data)}.`
    );

    if (data.msg === "join") {
      this.handleJoin(socket, data);
    } else if (data.msg === "set") {
      this.handleSet(socket, data);
    }
  }

  /**
   * Informs both clients that the game is starting.
   */
  gameStart() {
    logger.info(
      `Sending gameStarts to ${this.player1.socket.id} and ${this.player2.socket.id}`
    );

    this.player1.socket.emit("reply", {
      msg: "gameStart",
      payload: {
        yourChips: 100,
        opponentName: this.player2.name,
        opponentChips: 100,
        gameID: this.gameID,
      },
    });
    this.player1.setChips(100);

    this.player2.socket.emit("reply", {
      msg: "gameStart",
      payload: {
        yourChips: 100,
        opponentName: this.player1.name,
        opponentChips: 100,
        gameID: this.gameID,
      },
    });
    this.player2.setChips(100);

    this.startRound();
  }

  startRound() {
    // FIXME: select a button
    this.deck = new Deck();
    this.player1.reset();
    this.player2.reset();
    const button = [this.player1, this.player2][Math.round(Math.random())];
    this.status = { playerToAct: button, moves: 5, action: "buttonDeal" };
    this.deal(button, 5, 5);
  }

  /**
   * Handles attempts to join the game.
   * @param {socket} socket - The socket on which the message was received.
   * @param {object} data - Message content.
   */
  handleJoin(socket, data) {
    logger.info(`Handling join from ${socket.id}.`);
    // is game waiting for another player?
    if (this.status !== "wait") {
      logger.error(
        `${socket.id} attempted to join a game already in progress.`
      );
      this.terminate(
        socket,
        "You are attempting to join a game that is already in progress."
      );
      return;
    }

    // is player2's name different from player1?
    if (this.player1.name === data.playerName) {
      logger.warn(`Name ${data.playerName} is already taken.`);
      this.terminate(socket, "Name is already taken.");
      return;
    }

    this.player2 = new Player();
    this.player2.setName(data.playerName);
    this.player2.socket = socket;
    socket.on("disconnect", () => this.tearDown());
    this.idToPlayer[socket.id] = this.player2;

    this.idToOpponent[socket.id] = this.player1;
    this.idToOpponent[this.player1.socket.id] = this.player2;

    this.gameStart();
  }

  /**
   * Handles a card set message from a client.
   * @param {socket} socket - The socket on which the message was received.
   * @param {object} data - Message content.
   */
  handleSet(socket, data) {
    // check if waiting for card from player
    const player = this.idToPlayer[socket.id];
    const opponent = this.idToOpponent[socket.id];
    if (this.status.playerToAct !== player) {
      this.terminate(
        socket,
        "A player made a move when it was not their turn."
      );
      return;
    }

    const [idxFrom, rowTo, idxTo] = data.payload;
    if (player.set(idxFrom, rowTo, idxTo)) {
      const card = player[rowTo][idxTo];
      opponent.socket.emit("reply", {
        msg: "oppoSet",
        payload: [idxFrom, rowTo, idxTo, card],
      });
      this.status.moves -= 1;
      this.next();
    } else {
      this.terminate(
        socket,
        "A player tried to set a card they weren't dealt."
      );
    }
  }

  handleRoundEnd() {
    const table = scorer.scoreGame(this.player1, this.player2);
    logger.info(`Handling a round end for ${this.gameIdD}`);

    this.player1.socket.emit("reply", {
      msg: "roundEnd",
      payload: table,
    });

    this.player2.socket.emit("reply", {
      msg: "roundEnd",
      payload: table,
    });

    if (this.player1.chips > 0 && this.player2.chips > 0) {
      this.startRound();
    }
  }

  /**
   *
   * @param {Object} player - The player to whom the cards are to be dealt.
   * @param {number} numCardsToDraw - The number of cards to deal.
   * @param {number} numCardsToSet - The number of cards the player is allowed to set.
   * @param {boolean} pineapple - Should the card faces be hidden from the opponents?
   */
  deal(player, numCardsToDraw, numCardsToSet, pineapple = false) {
    let cards;
    if (numCardsToDraw === 1) {
      cards = this.deck.draw(1).map((c, i) => [2, c]);
    } else if (numCardsToDraw === 3) {
      cards = this.deck.draw(3).map((c, i) => [i + 1, c]);
    } else {
      cards = this.deck.draw(numCardsToDraw).map((c, i) => [i, c]);
    }
    const opponent = this.idToOpponent[player.socket.id];
    player.getDealt(cards);

    player.socket.emit("reply", {
      msg: "deal",
      payload: { cards, numCardsToSet },
    });

    let concealedCards;
    if (pineapple) {
      concealedCards = cards.map(([i, _]) => [i, "Xx"]);
    }

    opponent.socket.emit("reply", {
      msg: "oppoDeal",
      payload: pineapple
        ? { cards: concealedCards, numCardsToSet }
        : { cards, numCardsToSet },
    });
  }

  /**
   * Advance to the next game state.
   */
  next() {
    const { status } = this;
    const currentID = status.playerToAct.socket.id;

    // check if player has more cards to set
    if (status.moves > 0) {
      return;
    }

    // check if round is over
    if (this.player1.allRowsSet() && this.player2.allRowsSet()) {
      this.handleRoundEnd();
      return;
    }

    const player = this.idToPlayer[currentID];
    const opponent = this.idToOpponent[currentID];
    if (status.action === "buttonDeal") {
      this.status = {
        playerToAct: opponent,
        action: "deal",
        moves: 5,
      };
      this.deal(opponent, 5, 5);
    } else if (status.action === "deal" || status.action === "set") {
      this.status = {
        playerToAct: opponent,
        action: "set",
        moves: 1,
      };
      if (this.gameType === "pineapple") {
        player.clearDealt();
        this.deal(opponent, 3, 2, true);
        this.status.moves = 2;
      } else {
        this.deal(opponent, 1, 1);
      }
    }
  }

  terminate(socket, message) {
    socket.emit("reply", {
      msg: "terminate",
      payload: message,
    });
  }

  tearDown(msg = null) {
    logger.info(`Tearing down game ${this.gameID}.`);
    for (const player of [this.player1, this.player2]) {
      if (player) {
        activeNames.delete(player.name);
        if (player.socket) {
          if (msg) {
            this.terminate(player.socket, msg);
          }
          player.socket.disconnect(true);
        }
      }
    }

    if (queuedGame && queuedGame.gameID === this.gameID) {
      queuedGame = undefined;
    }

    delete runningGames[this.gameID];
  }
}

/**
 * Handles a join game attempt - creates a new GameHandler if one doesn't exist
 * waiting for a second player, otherwise forwards to handler.
 * @param {*} socket
 * @param {*} payload
 * @returns {GameHandler|null} - A GameHandler for the given gameID if one didn't already exist, otherwise null.
 */
function handleJoinGame(socket, payload) {
  let { playerName } = payload;
  const { gameType } = payload;
  logger.info(`got a create game from ${socket.id}: ${playerName}`);

  // trim name
  playerName = playerName.trim().substring(0, 20);

  // check if name is available
  if (!playerName || activeNames.has(playerName)) {
    socket.emit("reply", {
      msg: "terminate",
      payload: `Name ${playerName} is invalid or already taken. Please choose a different name.`,
    });
    return null;
  }

  // if game waiting for a player exists, let handler handle it
  if (queuedGame !== undefined) {
    queuedGame.handleJoin(socket, payload);
    const handler = queuedGame;
    queuedGame = undefined;
    return handler;
  }

  // else, we need to create a GameHandler
  queuedGame = new GameHandler(socket, playerName, "pineapple");
  runningGames[queuedGame.gameID] = queuedGame;
  logger.info(`registering new handler for ${queuedGame.gameID}`);
  return queuedGame;
}

class GameHandler2 {
  constructor(socket, playerName, gameType) {
    this.gameID = Math.random().toString(36).substr(2, 9);
    this.gameType = gameType;

    this.player1 = new Player();
    this.player1.setName(playerName);
    this.player1.socket = socket;
    socket.on("disconnect", () =>
      this.tearDown("Game over. A player has disconected.")
    );
    this.idToPlayer = {};
    this.idToPlayer[socket.id] = this.player1;
    this.idToOpponent = {};
    this.idToOpponent2 = {};
    this.player2 = null;
    this.player3 = null;

    this.status = "wait";
  }

  /**
   * Handles a message from one of the players.
   * @param {socket} socket - The socket on which the message was received.
   * @param {object} data - Message content.
   */
  handle(socket, data) {
    logger.info(
      `Handler for ${this.gameID} needs to handle ${JSON.stringify(data)}.`
    );

    if (data.msg === "join") {
      this.handleJoin(socket, data);
    } else if (data.msg === "set") {
      this.handleSet(socket, data);
    }
  }

  /**
   * Informs both clients that the game is starting.
   */
  gameStart() {
    logger.info(
      `Sending gameStarts to ${this.player1.socket.id} , ${this.player2.socket.id} and ${this.player3.socket.id}`
    );

    this.player1.socket.emit("reply", {
      msg: "gameStart",
      payload: {
        yourChips: 100,
        opponentName: this.player2.name,
        opponent2Name: this.player3.name,
        opponentChips: 100,
        opponent2Chips: 100,
        gameID: this.gameID,
      },
    });
    this.player1.setChips(100);

    this.player2.socket.emit("reply", {
      msg: "gameStart",
      payload: {
        yourChips: 100,
        opponentName: this.player3.name,
        opponentChips: 100,
        opponent2Name: this.player1.name,
        opponent2Chips: 100,
        gameID: this.gameID,
      },
    });
    this.player2.setChips(100);

    this.player3.socket.emit("reply", {
      msg: "gameStart",
      payload: {
        yourChips: 100,
        opponentName: this.player1.name,
        opponentChips: 100,
        opponent2Name: this.player2.name,
        opponent2Chips: 100,
        gameID: this.gameID,
      },
    });
    this.player3.setChips(100);

    this.startRound();
  }

  startRound() {
    // FIXME: select a button
    this.deck = new Deck();
    this.player1.reset();
    this.player2.reset();
    this.player3.reset();
    const button = [this.player1, this.player2, this.player3][
      Math.round(Math.random())
    ];
    this.status = { playerToAct: button, moves: 5, action: "buttonDeal" };
    this.deal(button, 5, 5);
  }

  /**
   * Handles attempts to join the game.
   * @param {socket} socket - The socket on which the message was received.
   * @param {object} data - Message content.
   */
  handleJoin(socket, data) {
    logger.info(`Handling join from ${socket.id}.`);
    // is game waiting for another player?
    if (this.status !== "wait") {
      logger.error(
        `${socket.id} attempted to join a game already in progress.`
      );
      this.terminate(
        socket,
        "You are attempting to join a game that is already in progress."
      );
      return;
    }

    // is player2's name different from player1?
    if (this.player1.name === data.playerName) {
      logger.warn(`Name ${data.playerName} is already taken.`);
      this.terminate(socket, "Name is already taken.");
      return;
    }

    if (this.player2 === null) {
      this.player2 = new Player();
      this.player2.setName(data.playerName);
      this.player2.socket = socket;
      socket.on("disconnect", () => this.tearDown());
      this.idToPlayer[socket.id] = this.player2;
    } else {
      this.player3 = new Player();
      this.player3.setName(data.playerName);
      this.player3.socket = socket;
      socket.on("disconnect", () => this.tearDown());
      this.idToPlayer[socket.id] = this.player3;

      this.idToOpponent[socket.id] = this.player1;
      this.idToOpponent2[socket.id] = this.player2;

      this.idToOpponent[this.player1.socket.id] = this.player2;
      this.idToOpponent2[this.player1.socket.id] = this.player3;

      this.idToOpponent[this.player2.socket.id] = this.player3;
      this.idToOpponent2[this.player2.socket.id] = this.player1;

      console.log(this.idToPlayer, this.idToOpponent, this.idToOpponent2);
      this.gameStart();
    }
  }

  /**
   * Handles a card set message from a client.
   * @param {socket} socket - The socket on which the message was received.
   * @param {object} data - Message content.
   */
  handleSet(socket, data) {
    // check if waiting for card from player
    const player = this.idToPlayer[socket.id];
    const opponent = this.idToOpponent[socket.id];
    const opponent2 = this.idToOpponent2[socket.id];
    if (this.status.playerToAct !== player) {
      this.terminate(
        socket,
        "A player made a move when it was not their turn."
      );
      return;
    }

    const [idxFrom, rowTo, idxTo] = data.payload;
    if (player.set(idxFrom, rowTo, idxTo)) {
      const card = player[rowTo][idxTo];
      opponent.socket.emit("reply", {
        msg: "oppo2Set",
        payload: [idxFrom, rowTo, idxTo, card],
      });
      opponent2.socket.emit("reply", {
        msg: "oppoSet",
        payload: [idxFrom, rowTo, idxTo, card],
      });
      this.status.moves -= 1;
      this.next();
    } else {
      this.terminate(
        socket,
        "A player tried to set a card they weren't dealt."
      );
    }
  }

  handleRoundEnd() {
    const table = scorer.scoreGame2(this.player1, this.player2, this.player3);
    logger.info(`Handling a round end for ${this.gameIdD}`);

    this.player1.socket.emit("reply", {
      msg: "roundEnd",
      payload: table,
    });

    this.player2.socket.emit("reply", {
      msg: "roundEnd",
      payload: table,
    });

    this.player3.socket.emit("reply", {
      msg: "roundEnd",
      payload: table,
    });

    if (
      this.player1.chips > 0 &&
      this.player2.chips > 0 &&
      this.player3.chips > 0
    ) {
      this.startRound();
    }
  }

  /**
   *
   * @param {Object} player - The player to whom the cards are to be dealt.
   * @param {number} numCardsToDraw - The number of cards to deal.
   * @param {number} numCardsToSet - The number of cards the player is allowed to set.
   * @param {boolean} pineapple - Should the card faces be hidden from the opponents?
   */
  deal(player, numCardsToDraw, numCardsToSet, pineapple = false) {
    let cards;
    if (numCardsToDraw === 1) {
      cards = this.deck.draw(1).map((c, i) => [2, c]);
    } else if (numCardsToDraw === 3) {
      cards = this.deck.draw(3).map((c, i) => [i + 1, c]);
    } else {
      cards = this.deck.draw(numCardsToDraw).map((c, i) => [i, c]);
    }
    const opponent = this.idToOpponent[player.socket.id];
    const opponent2 = this.idToOpponent2[player.socket.id];
    player.getDealt(cards);

    player.socket.emit("reply", {
      msg: "deal",
      payload: { cards, numCardsToSet },
    });

    console.log("PLayer Deal");

    let concealedCards;
    if (pineapple) {
      concealedCards = cards.map(([i, _]) => [i, "Xx"]);
    }

    opponent.socket.emit("reply", {
      msg: "oppo2Deal",
      payload: pineapple
        ? { cards: concealedCards, numCardsToSet }
        : { cards, numCardsToSet },
    });

    console.log("OppoDeal Deal");

    opponent2.socket.emit("reply", {
      msg: "oppoDeal",
      payload: pineapple
        ? { cards: concealedCards, numCardsToSet }
        : { cards, numCardsToSet },
    });

    console.log("Oppo2 Deal");
  }

  /**
   * Advance to the next game state.
   */
  next() {
    const { status } = this;
    const currentID = status.playerToAct.socket.id;

    // check if player has more cards to set
    if (status.moves > 0) {
      return;
    }

    // check if round is over
    if (
      this.player1.allRowsSet() &&
      this.player2.allRowsSet() &&
      this.player3.allRowsSet()
    ) {
      this.handleRoundEnd();
      return;
    }

    const player = this.idToPlayer[currentID];
    const opponent = this.idToOpponent[currentID];
    const opponent2 = this.idToOpponent2[currentID];
    if (status.action === "buttonDeal") {
      this.status = {
        playerToAct: opponent,
        action: "buttonDeal2",
        moves: 5,
      };
      this.deal(opponent, 5, 5);
    }
    if (status.action === "buttonDeal2") {
      this.status = {
        playerToAct: opponent,
        action: "deal",
        moves: 5,
      };
      this.deal(opponent, 5, 5);
    } else if (status.action === "deal" || status.action === "set") {
      this.status = {
        playerToAct: opponent,
        action: "set",
        moves: 1,
      };
      if (this.gameType === "pineapple") {
        player.clearDealt();
        this.deal(opponent, 3, 2, true);
        this.status.moves = 2;
      } else {
        this.deal(opponent, 1, 1);
      }
    }
  }

  terminate(socket, message) {
    socket.emit("reply", {
      msg: "terminate",
      payload: message,
    });
  }

  tearDown(msg = null) {
    logger.info(`Tearing down game ${this.gameID}.`);
    for (const player of [this.player1, this.player2]) {
      if (player) {
        activeNames.delete(player.name);
        if (player.socket) {
          if (msg) {
            this.terminate(player.socket, msg);
          }
          player.socket.disconnect(true);
        }
      }
    }

    if (queuedGame && queuedGame.gameID === this.gameID) {
      queuedGame = undefined;
    }

    delete runningGames[this.gameID];
  }
}

/**
 * Handles a join game attempt - creates a new GameHandler if one doesn't exist
 * waiting for a second player, otherwise forwards to handler.
 * @param {*} socket
 * @param {*} payload
 * @returns {GameHandler|null} - A GameHandler for the given gameID if one didn't already exist, otherwise null.
 */
function handleJoinGame2(socket, payload) {
  let { playerName } = payload;
  const { gameType } = payload;
  logger.info(`got a create game from ${socket.id}: ${playerName}`);
  console.log(`got a create game from ${socket.id}: ${playerName}`);

  // trim name
  playerName = playerName.trim().substring(0, 20);

  // check if name is available
  if (!playerName || activeNames2.has(playerName)) {
    socket.emit("reply", {
      msg: "terminate",
      payload: `Name ${playerName} is invalid or already taken. Please choose a different name.`,
    });
    return null;
  }

  // if game waiting for a player exists, let handler handle it
  console.log(queuedGame2 !== undefined, playerNum !== 3);
  if (queuedGame2 !== undefined && playerNum !== 3) {
    queuedGame2.handleJoin(socket, payload);
    const handler = queuedGame2;
    if (playerNum === 3) {
      queuedGame = undefined;
      console.log("Cleared Queue");
    } else {
      playerNum += 1;
    }
    return handler;
  }

  // else, we need to create a GameHandler
  console.log("Creating New Game");
  queuedGame2 = new GameHandler2(socket, playerName, "pineapple");
  playerNum = 1;
  runningGames2[queuedGame2.gameID] = queuedGame2;
  logger.info(`registering new handler for ${queuedGame2.gameID}`);
  return queuedGame2;
}

var express = require("express");
var app = express();
var server = require("http").Server(app);

server.listen(process.env.PORT || 3001);

var io = require("socket.io")(server);
app.use(express.static("client/build"));
// if (false) {
//   // Exprees will serve up production assets
//   app.use(express.static("client/build"));

//   // Express serve up index.html file if it doesn't recognize route
//   const path = require("path");
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
//   });
// }

io.on("connection", (socket) => {
  logger.info("Received a new connection.");

  socket.on("joinGame", (payload) => {
    const handler = handleJoinGame(socket, payload);
    if (handler) {
      socket.on(handler.gameID, (data) => handler.handle(socket, data));
    }
  });

  socket.on("joinGame2", (payload) => {
    const handler = handleJoinGame2(socket, payload);
    if (handler) {
      socket.on(handler.gameID, (data) => handler.handle(socket, data));
    }
  });
});
