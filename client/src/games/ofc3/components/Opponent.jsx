import React, { Component } from "react";
import Card from "./Card";

class Opponent extends Component {
  renderRow(playerState, rowId) {
    const cards = playerState.state[rowId];
    let checkState = true
    playerState.state["dealt"].forEach(element => {
      if(element !== null){
        checkState = false
      }
    });
    
    return (
      <div className="card-row">
        {cards.map((_, i) => (
          <Card key={i} n={i} rowId={rowId} playerState={playerState} visible={rowId != "dealt" ? checkState : false} />
        ))}
      </div>
    );
  }

  render() {
    const playerState = this.props.playerState;
    const { name, chips } = playerState.state;

    return (
      <div className="player">
        <div className="rows-container">
          {this.renderRow(playerState, "front")}
          {this.renderRow(playerState, "middle")}
          {this.renderRow(playerState, "back")}
        </div>
        <div className="bottom">
          <div className="nameplate-container">
            <div className="nameplate">
              <div className="name">{name}</div>
              <div className="chips">{chips}</div>
            </div>
          </div>
          <div className="backrow-container">
            {this.renderRow(playerState, "dealt")}
          </div>
        </div>
      </div>
    );
  }
}

export default Opponent;
