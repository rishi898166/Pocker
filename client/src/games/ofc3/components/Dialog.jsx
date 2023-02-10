import React, { Component } from "react";
import handler from "../communicate";
import { sstate2 } from "../containers.js";

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
    const { playerName, opponentName, opponent2Name } = this.props;
    return (
      <tr>
        <th>Row</th>
        <th>{playerName}</th>
        <th>{opponentName}</th>
        <th>{opponent2Name}</th>
        <th>Winner</th>
        <th>Net</th>
      </tr>
    );
  }

  onQuit() {
    this.props.sstate2.showMainMenu();
    handler.quit();
  }

  onContinue() {
    handler.continue();
  }

  renderTableRow(row) {
    const { playerName, opponentName, opponent2Name } = this.props;
    const { table } = this.props.sstate2.state;
    const [playerHandType, playerRoyalty] = table[row][playerName];
    const [opponentHandType, opponentRoyalty] = table[row][opponentName];
    const [opponent2HandType, opponent2Royalty] = table[row][opponent2Name];

    let net;
    let winner;
    if (table[row]["winner"] === playerName) {
      winner = green(playerName);
      net = green(`+${playerRoyalty - opponentRoyalty + 1}`);
    } else if (table[row]["winner"] === opponentName) {
      winner = red(opponentName);
      net = red(`-${opponentRoyalty - playerRoyalty + 1}`);
    }else if (table[row]["winner"] === opponent2Name) {
      winner = red(opponent2Name);
      net = red(`-${opponent2Royalty - playerRoyalty + 1}`);
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
        <td>
          {opponent2HandType} (+{opponent2Royalty})
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
    const { playerName, opponentName, opponent2Name } = this.props;
    const scooped = this.props.sstate2.state.table.scooped;
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
    }else if (scooped === opponent2Name) {
      return (
        <div>
          <br />
          <b>{opponent2Name}</b> has scooped ({red("-3")} points).
        </div>
      );
    }
  }

  renderNet() {
    const { playerName, opponentName, opponent2Name} = this.props;
    const netPoints = this.props.sstate.state.table[playerName];
    const opponentNetPoints = this.props.sstate.state.table[opponentName];
    const opponent2NetPoints = this.props.sstate.state.table[opponent2Name];
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

        <br />

        <b>{opponent2Name}</b>
        {" has "}
        {opponent2NetPoints >= 0 ? green("won") : red("lost")}
        {` ${Math.abs(opponent2NetPoints)} points.`}
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
              onClick={() => sstate2.hideEndOfRound()}
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
