import React, { Component } from "react";
import handler from "../communicate";
import { sstate } from "../containers.js";

function green(e) {
  return <span className="dialog-player">{e}</span>;
}

function red(e) {
  return <span className="dialog-opponent">{e}</span>;
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

class Dialog extends Component {
  state = {};

  renderTableHeaders() {
    const { playerName, opponentName } = this.props;
    return (
      <tr>
        <th>Row</th>
        <th>{playerName}</th>
        <th>{opponentName}</th>
        <th>Winner</th>
        <th>Net</th>
      </tr>
    );
  }

  onQuit() {
    this.props.sstate.showMainMenu();
    handler.quit();
  }

  onContinue() {
    handler.continue();
  }

  renderTableRow(row) {
    const { playerName, opponentName } = this.props;
    const { table } = this.props.sstate.state;
    const [playerHandType, playerRoyalty] = table[row][playerName];
    const [opponentHandType, opponentRoyalty] = table[row][opponentName];

    let net;
    let winner;
    if (table[row]["winner"] === playerName) {
      winner = green(playerName);
      net = green(`+${playerRoyalty - opponentRoyalty + 1}`);
    } else if (table[row]["winner"] === opponentName) {
      winner = red(opponentName);
      net = red(`-${opponentRoyalty - playerRoyalty + 1}`);
    } else {
      winner = <span>TIE</span>;
      net = <span>0</span>;
    }

    return (
      <tr>
        <td>{capitalize(row)}</td>
        <td>
          {playerHandType} (+{playerRoyalty})
        </td>
        <td>
          {opponentHandType} (+{opponentRoyalty})
        </td>
        <td>{winner}</td>
        <td>{net}</td>
      </tr>
    );
  }

  renderTable() {
    return (
      <table className="dialog-table">
        <tbody>
          {this.renderTableHeaders()}
          {this.renderTableRow("front")}
          {this.renderTableRow("middle")}
          {this.renderTableRow("back")}
        </tbody>
      </table>
    );
  }

  renderScoops() {
    const { playerName, opponentName } = this.props;
    const scooped = this.props.sstate.state.table.scooped;
    if (!scooped) {
      return;
    }
    if (scooped === playerName) {
      return (
        <div>
          <br />
          <b>{playerName}</b> has scooped ({green("+3")} points).
        </div>
      );
    } else if (scooped === opponentName) {
      return (
        <div>
          <br />
          <b>{opponentName}</b> has scooped ({red("-3")} points).
        </div>
      );
    }
  }

  renderNet() {
    const { playerName, opponentName } = this.props;
    const netPoints = this.props.sstate.state.table[playerName];
    const opponentNetPoints = this.props.sstate.state.table[opponentName];
    return (
      <div>
        <b>{playerName}</b>
        {" has "}
        {netPoints >= 0 ? green("won") : red("lost")}
        {` ${Math.abs(netPoints)} points.`}

        <br />

        <b>{opponentName}</b>
        {" has "}
        {opponentNetPoints >= 0 ? green("won") : red("lost")}
        {` ${Math.abs(opponentNetPoints)} points.`}
      </div>
    );
  }

  renderTotal() {
    const { playerChips } = this.props;
    return <div>{`You now have ${playerChips} chips.`}</div>;
  }

  render() {
    return (
      <div className="dialog">
        <div className="dialog-content">
          <div className="dialog-title">
            <h2>Results</h2>
          </div>
          {this.renderNet()}
          <div className="dialog-textbox">
            <h3>Score Breakdowm</h3>
            {this.renderTable()}
            <br />
            {this.renderScoops()}
          </div>
          <div className="dialog-buttons">
            <button
              className="dialog-button"
              onClick={() => sstate.hideEndOfRound()}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Dialog;
