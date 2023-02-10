import React, { Component } from "react";
import "./App.css";
import "./Game.css";
import "./Dialog.css";

import Player from "./components/Player";
import Opponent from "./components/Opponent";
import Menu from "./components/Menu";
import Dialog from "./components/Dialog";

class Ofc2App extends Component {
  render() {
    const { inGame, dialog } = this.props.sstate.state;
    const playerName = this.props.playerState.state.name;
    const playerChips = this.props.playerState.state.chips;
    const opponentName = this.props.opponentState.state.name;
    const opponentChips = this.props.opponentState.state.chips;

    const opponent2Name = this.props.opponent2State.state.name;
    const opponent2Chips = this.props.opponent2State.state.chips;

    const game = (
      <div className="game">
         <img src="/plo/assets/table-nobg-svg-01.svg" className="table-bg" style={{position: 'fixed', zIndex: 0}}></img>
        <Player playerState={this.props.playerState} />
        {/* <div className="spacer" /> */}
        <Opponent playerState={this.props.opponentState} />
        <Opponent playerState={this.props.opponent2State} />
        {dialog ? (
          <Dialog
            playerName={playerName}
            playerChips={playerChips}
            opponentName={opponentName}
            opponentChips={opponentChips}
            opponent2Name={opponent2Name}
            opponent2Chips={opponent2Chips}
            sstate={this.props.sstate}
          />
        ) : (
          ""
        )}
      </div>
    );
    const menu = <Menu sstate={this.props.sstate} />;
    return inGame ? game : menu;
  }
}

export default Ofc2App;
