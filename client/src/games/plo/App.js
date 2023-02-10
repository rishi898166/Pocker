import "core-js/es6";

import React, { Component } from "react";
import "./App.css";
import "./Poker.css";

import Spinner from "./Spinner";
import WinScreen from "./WinScreen";

import Player from "./components/players/Player";
import ShowdownPlayer from "./components/players/ShowdownPlayer";
import Card from "./components/cards/Card";

import {
  generateDeckOfCards,
  shuffle,
  dealPrivateCards,
} from "./utils/cards.js";

import { generateTable, beginNextRound, checkWin } from "./utils/players.js";

import {
  determineBlindIndices,
  anteUpBlinds,
  determineMinBet,
  handleBet,
  handleFold,
} from "./utils/bet.js";

import { handleAI as handleAIUtil } from "./utils/ai.js";

import {
  renderShowdownMessages,
  renderActionButtonText,
  renderNetPlayerEarnings,
  renderActionMenu,
  renderPhaseStatement
} from "./utils/ui.js";

import { cloneDeep } from "lodash";
import { useAuth } from "../../contexts/AuthContext";
import { useParams } from "react-router-dom";
import {
  getState,
  updateGameTable,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  getLobby,
  addCareer,
} from "../../firebase";
import { useState, useEffect } from "react";

export default function PLOApp() {
  const { currentUser } = useAuth();
  const { id } = useParams();
  const [lobby, setlobby] = useState();
  const [loading, setloading] = useState(true);

  const getData = async () => {
    const data = await getLobby(id);
    setlobby(data);
    setloading(false);
  };
  useEffect(() => {
    getData();
  }, []);

  return (
    <>{!loading && <PLOGame id={id} userinfo={currentUser} lobby={lobby} />}</>
  );
}

class PLOGame extends Component {
  state = {
    isPublic: this.props.lobby.isPublic,
    loading: true,
    winnerFound: null,
    players: null,
    numPlayersActive: null,
    numPlayersFolded: null,
    numPlayersAllIn: null,
    activePlayerIndex: null,
    dealerIndex: null,
    blindIndex: null,
    deck: null,
    communityCards: [],
    pot: null,
    highBet: null,
    betInputValue: null,
    sidePots: [],
    minBet: 20,
    lastBet: 20,
    phase: "loading",
    playerHierarchy: [],
    showDownMessages: [],
    playActionMessages: [],
    playerAnimationSwitchboard: {
      0: { isAnimating: false, content: null },
      1: { isAnimating: false, content: null },
      2: { isAnimating: false, content: null },
      3: { isAnimating: false, content: null },
      4: { isAnimating: false, content: null },
      5: { isAnimating: false, content: null },
    },
  };

  cardAnimationDelay = 0;

  loadTable = () => {};

  async componentDidMount() {
    if (this.props.lobby.state === null) {
      const players = await generateTable(this.props.id); //gets all the users for the table
      const dealerIndex = Math.floor(
        Math.random() * Math.floor(players.length)
      ); // Random Dealer
      const blindIndicies = determineBlindIndices(dealerIndex, players.length); // Determine Small Blind and Big Blind
      const playersBoughtIn = anteUpBlinds(
        players,
        blindIndicies,
        this.state.minBet
      );

      this.setState((prevState) => ({
        // loading: false,
        players: playersBoughtIn,
        numPlayersActive: players.length,
        numPlayersFolded: 0,
        numPlayersAllIn: 0,
        activePlayerIndex: dealerIndex,
        dealerIndex,
        blindIndex: {
          big: blindIndicies.bigBlindIndex,
          small: blindIndicies.smallBlindIndex,
        },
        deck: shuffle(generateDeckOfCards()),
        pot: 0,
        lastBet: prevState.minBet,
        highBet: prevState.minBet,
        betInputValue: prevState.minBet,
        phase: "initialDeal",
      }));
      this.runGameLoop();
    } else {
      let currentState =
        typeof this.props.lobby.state === "string"
          ? JSON.parse(this.props.lobby.state)
          : this.props.lobby.state;
      this.setState(currentState);
    }
    const imageLoaderRequest = new XMLHttpRequest();

    imageLoaderRequest.addEventListener("load", (e) => {
      // console.log(`${e.type}`);
      // console.log(e);
      // console.log("Image Loaded!");
      this.setState({
        loading: false,
      });
    });

    imageLoaderRequest.addEventListener("error", (e) => {
      // console.log(`${e.type}`);
      // console.log(e);
    });

    imageLoaderRequest.addEventListener("loadstart", (e) => {
      // console.log(`${e.type}`);
      // console.log(e);
    });

    imageLoaderRequest.addEventListener("loadend", (e) => {
      // console.log(`${e.type}`);
      // console.log(e);
    });

    imageLoaderRequest.addEventListener("abort", (e) => {
      // console.log(`${e.type}`);
      // console.log(e);
    });

    imageLoaderRequest.addEventListener("progress", (e) => {
      // console.log(`${e.type}`);
      // console.log(e);
    });

    imageLoaderRequest.open("GET", "./assets/table-nobg-svg-01.svg");
    imageLoaderRequest.send();
    this.updateState();
  }

  updateState = () => {
    const db = getFirestore();
    const ref = doc(db, "lobby", this.props.id);

    const unsub = onSnapshot(ref, (doc) => {
      if (doc.data().state === null) {
        if (this.props.userinfo.uid === this.props.lobby.admin) {
          updateGameTable(this.props.id, this.state);
        }
        this.setState({
          loading: true,
        });
      } else {
        let currentState =
          typeof doc.data().state === "string"
            ? JSON.parse(doc.data().state)
            : doc.data().state;
        this.setState(currentState);
        this.setState({
          loading: false,
        });
      }
    });
  };

  handleBetInputChange = (val, min, max) => {
    if (val === "") val = min;
    if (val > max) val = max;
    this.setState({
      betInputValue: parseInt(val, 10),
    });
    const newState = this.state;
    newState.betInputValue = parseInt(val, 10);
    updateGameTable(this.props.id, newState);
  };

  changeSliderInput = (val) => {
    this.setState({
      betInputValue: val[0],
    });
    updateGameTable(this.props.id, this.state);
  };

  pushAnimationState = (index, content) => {
    const newAnimationSwitchboard = Object.assign(
      {},
      this.state.playerAnimationSwitchboard,
      { [index]: { isAnimating: true, content } }
    );
    this.setState({ playerAnimationSwitchboard: newAnimationSwitchboard });
    updateGameTable(this.props.id, this.state);
  };

  popAnimationState = (index) => {
    const persistContent = this.state.playerAnimationSwitchboard[index].content;
    const newAnimationSwitchboard = Object.assign(
      {},
      this.state.playerAnimationSwitchboard,
      { [index]: { isAnimating: false, content: persistContent } }
    );
    this.setState({ playerAnimationSwitchboard: newAnimationSwitchboard });
    updateGameTable(this.props.id, this.state);
  };

  handleBetInputSubmit = (bet, min, max) => {
    const { playerAnimationSwitchboard, ...appState } = this.state;
    const { activePlayerIndex } = appState;
    this.pushAnimationState(
      activePlayerIndex,
      `${renderActionButtonText(
        this.state.highBet,
        this.state.betInputValue,
        this.state.players[this.state.activePlayerIndex]
      )} ${
        bet > this.state.players[this.state.activePlayerIndex].bet ? bet : ""
      }`
    );
    const newState = handleBet(
      cloneDeep(appState),
      parseInt(bet, 10),
      parseInt(min, 10),
      parseInt(max, 10)
    );
    this.setState(newState, () => {
      if (
        this.state.players[this.state.activePlayerIndex].robot &&
        this.state.phase !== "showdown"
      ) {
        setTimeout(() => {
          this.handleAI();
        }, 1200);
      }
    });
    updateGameTable(this.props.id, this.state);
  };

  handleFold = () => {
    const { playerAnimationSwitchboard, ...appState } = this.state;
    const newState = handleFold(cloneDeep(appState));
    this.setState(newState, () => {
      if (
        this.state.players[this.state.activePlayerIndex].robot &&
        this.state.phase !== "showdown"
      ) {
        setTimeout(() => {
          this.handleAI();
        }, 1200);
      }
    });
    updateGameTable(this.props.id, newState);
  };

  handleAI = () => {
    const { playerAnimationSwitchboard, ...appState } = this.state;
    const newState = handleAIUtil(cloneDeep(appState), this.pushAnimationState);

    setTimeout(() => {
      this.setState(
        {
          ...newState,
          betInputValue: newState.minBet,
        },
        () => {
          if (
            this.state.players[this.state.activePlayerIndex].robot &&
            this.state.phase !== "showdown"
          ) {
            setTimeout(() => {
              this.handleAI();
            }, 1200);
          }
        }
      );
      updateGameTable(this.props.id, this.state);
    }, 3000);
  };

  renderBoard = () => {
    const {
      players,
      activePlayerIndex,
      dealerIndex,
      clearCards,
      phase,
      playerAnimationSwitchboard,
    } = this.state;
    // Reverse Players Array for the sake of taking turns counter-clockwise.
    const reversedPlayers = players.reduce((result, player, index) => {
      const isActive = index === activePlayerIndex;
      const hasDealerChip = index === dealerIndex;

      result.unshift(
        <Player
          key={index}
          arrayIndex={index}
          isActive={isActive}
          hasDealerChip={hasDealerChip}
          player={player}
          clearCards={clearCards}
          phase={phase}
          playerAnimationSwitchboard={playerAnimationSwitchboard}
          endTransition={this.popAnimationState}
        />
      );
      return result;
    }, []);
    return reversedPlayers.map((component) => component);
  };

  renderCommunityCards = (purgeAnimation) => {
    return this.state.communityCards.map((card, index) => {
      let cardData = { ...card };
      if (purgeAnimation) {
        cardData.animationDelay = 0;
      }
      return <Card key={index} cardData={cardData} />;
    });
  };

  runGameLoop = () => {
    const newState = dealPrivateCards(cloneDeep(this.state));
    this.setState(newState, () => {
      if (
        this.state.players[this.state.activePlayerIndex].robot &&
        this.state.phase !== "showdown"
      ) {
        setTimeout(() => {
          this.handleAI();
        }, 1200);
      }
    });
    updateGameTable(this.props.id, this.state);
  };

  renderRankTie = (rankSnapshot) => {
    return rankSnapshot.map((player) => {
      return this.renderRankWinner(player);
    });
  };

  renderRankWinner = (player) => {
    
    const { name, bestHand, handRank } = player;
    const playerStateData = this.state.players.find(
      (statePlayer) => statePlayer.name === name
    );

    return (
      <div className="showdown-player--entity" key={name}>
        <ShowdownPlayer
          name={name}
          avatarURL={playerStateData.avatarURL}
          cards={playerStateData.cards}
          roundEndChips={playerStateData.roundEndChips}
          roundStartChips={playerStateData.roundStartChips}
        />
        <div className="showdown-player--besthand--container">
          <h5 className="showdown-player--besthand--heading">Best Hand</h5>
          <div
            className="showdown-player--besthand--cards"
            style={{ alignItems: "center" }}
          >
            {bestHand.map((card, index) => {
              // Reset Animation Delay
              const cardData = { ...card, animationDelay: 0 };
              return <Card key={index} cardData={cardData} />;
            })}
          </div>
        </div>
        <div className="showdown--handrank">{handRank}</div>
        {renderNetPlayerEarnings(
          playerStateData.roundEndChips,
          playerStateData.roundStartChips,
          playerStateData.id,
          playerStateData.name,
          this.state.isPublic
        )}
      </div>
    );
  };

  renderBestHands = () => {
    const { playerHierarchy } = this.state;

    return playerHierarchy.map((rankSnapshot) => {
      const tie = Array.isArray(rankSnapshot);
      return tie
        ? this.renderRankTie(rankSnapshot)
        : this.renderRankWinner(rankSnapshot);
    });
  };

  handleNextRound = async () => {
    const ccstate = this.state;
    ccstate.clearCards = true;

    const newState = beginNextRound(cloneDeep(ccstate));
    this.setState(newState);
    updateGameTable(this.props.id, newState);
    // Check win condition
    if (checkWin(newState.players)) {
      const winarray = newState.players.filter((player) => player.chips > 0);
      const winner = winarray[0];
      await addCareer(winner.name, "Pot Limit Ohama", true);

      const lostarray = newState.players.filter((player) => player.chips <= 0);
      lostarray.forEach(async (element) => {
        await addCareer(element.name, "Pot Limit Ohama", false);
      });
      this.setState({ winnerFound: true });
      updateGameTable(this.props.id, newState);
      return;
    }
  };

  renderActionButtons = () => {
    const {
      highBet,
      players,
      activePlayerIndex,
      phase,
      betInputValue,
      lastBet,
      pot,
      minBet,
    } = this.state;
    const min = determineMinBet(
      highBet,
      players[activePlayerIndex].chips,
      players[activePlayerIndex].bet
    );
    var fullAmount = 0;
    players.forEach((player) => {
      fullAmount = fullAmount + player.bet;
    });

    const max = lastBet * 3 + (fullAmount - lastBet) + pot;
    return players[activePlayerIndex].id !== this.props.userinfo.uid || phase === "showdown" ? null : (
      <React.Fragment>
        <button
          className="action-button"
          onClick={() => this.handleBetInputSubmit(betInputValue, min, max)}
        >
          {renderActionButtonText(
            highBet,
            betInputValue,
            players[activePlayerIndex]
          )}
        </button>
        <button className="fold-button" onClick={() => this.handleFold()}>
          Fold
        </button>
      </React.Fragment>
    );
  };

  renderShowdown = () => {
    return (
      <div className="showdown-container--wrapper">
        <h5 className="showdown-container--title">Round Complete!</h5>
        <div className="showdown-container--messages">
          {renderShowdownMessages(this.state.showDownMessages)}
        </div>
        <h5 className="showdown-container--community-card-label">
          Community Cards
        </h5>
        <div className="showdown-container--community-cards">
          {this.renderCommunityCards(true)}
        </div>
        {this.props.userinfo.uid === this.props.lobby.admin &&
          <button
            className="showdown--nextRound--button"
            onClick={() => this.handleNextRound()}
          >
            {" "}
            Next Round{" "}
          </button>
        }
        {this.renderBestHands()}
      </div>
    );
  };

  renderGame = () => {
    const {
      highBet,
      players,
      activePlayerIndex,
      phase,
      lastBet,
      pot,
      betInputValue,
    } = this.state;

    const min = determineMinBet(
      highBet,
      players[activePlayerIndex].chips,
      players[activePlayerIndex].bet
    );

    var fullAmount = 0;
    players.forEach((player) => {
      fullAmount = fullAmount + player.bet;
    });
    const max = lastBet * 3 + (fullAmount - lastBet) + pot;
    return (
      <div className="poker-app--background">
        <div className="poker-table--container">
        <font style={{color: 'white', fontSize: 28}}>Round : <i>{ renderPhaseStatement(this.state.phase) }</i></font>
          <img
            className="poker-table--table-image"
            src={"./assets/table-nobg-svg-01.svg"}
            alt="Poker Table"
          />
          {this.renderBoard()}
          <div className="community-card-container">
            {this.renderCommunityCards()}
          </div>
          <div className="pot-container">
            <img
              style={{ height: 55, width: 55 }}
              src={"./assets/pot.svg"}
              alt="Pot Value"
            />
            <h4> {`${this.state.pot}`} </h4>
          </div>
        </div>
        {this.state.phase === "showdown" && this.renderShowdown()}
        <div className="game-action-bar">
          <div className="action-buttons">{this.renderActionButtons()}</div>
          {!this.state.loading &&
            players[activePlayerIndex].id === this.props.userinfo.uid && (
              <>
                <div> Bet : {betInputValue}</div>
                <div>
                  <button
                    className="bet-button"
                    onClick={() =>
                      this.handleBetInputChange( betInputValue + 10, min, max)
                    }
                  >
                    +10
                  </button>
                  <button
                    className="bet-button"
                    onClick={() =>
                      this.handleBetInputChange((max - min) / 2, min, max)
                    }
                  >
                    Half
                  </button>
                </div>
              </>
            )}
          <div className="slider-boi">
            {!this.state.loading &&
              
              renderActionMenu(
                this.props.userinfo.uid,
                highBet,
                players,
                activePlayerIndex,
                phase,
                this.handleBetInputChange,
                lastBet,
                pot,
                betInputValue,
              )}
          </div>
        </div>
      </div>
    );
  };
  render() {
    return (
      <div className="App">
        <div className="poker-table--wrapper">
          {this.state.loading ? (
            <Spinner />
          ) : this.state.winnerFound ? (
            <WinScreen />
          ) : (
            this.renderGame()
          )}
        </div>
      </div>
    );
  }
}
