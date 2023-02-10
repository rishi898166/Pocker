import React, { Component } from "react";

class Card extends Component {
  render() {
    const playerState = this.props.playerState;
    const { selected } = playerState.state;
    const { rowId, n, visible} = this.props;
    const card = playerState.state[rowId][n];

    const style = {};
    if(visible){
      style["backgroundImage"] = `url(${process.env.PUBLIC_URL}/cards/${card}.svg)`;
    }else{
      style["backgroundImage"] = `url(${process.env.PUBLIC_URL}/cards/back.svg)`;
    }

    let outlineClass = "card-outline";
    if (rowId === "dealt" && selected === n) {
      outlineClass += " card-outline-selected";
    }

    return (
      <div className={outlineClass} onClick={this.props.onClick}>
        <div className="card" style={style} />
      </div>
    );
  }
}

export default Card;
