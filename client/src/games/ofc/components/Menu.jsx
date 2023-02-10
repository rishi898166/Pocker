import React, { Component } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

import handler from "../communicate";

export default function Menu(props) {
  const { currentUser } = useAuth();
  const sstate = props.sstate;


  return (
   
      <MenuApp user={currentUser} sstate={sstate}/>
    
  );
}
class MenuApp extends Component {
  state = {
    name: this.props.user.displayName,
  };

  onJoin(e) {
    e.preventDefault();
    if (this.state.name === "") {
      alert("Must enter a name.");
      return;
    }
    this.props.sstate.showGameScreen();
    handler.joinGame(this.state.name.substring(0, 20));
  }

  updateName(event) {
    const name = event.target.value;
    this.setState(state => ({ ...state, name }));
  }

  componentDidMount(){
    this.props.sstate.showGameScreen();
    handler.joinGame(this.state.name.substring(0, 20));
  }

  render() {
    return (
      <div className="menu">
        <div className="logo">OFCjs</div>
        <div className="menu-body">
          <h3>Welcome!</h3>
          <p>
            Please enter your name and press "Start Game" to begin looking for an
            opponent.
          </p>
          <form>
            <div className="form-container">
              <div className="input-row">
                <label>Player Name</label>
                <input
                  type="text"
                  name="name"
                  onChange={e => this.updateName(e)}
                />
              </div>
              <div>
                <button className="dialog-button" onClick={e => this.onJoin(e)}>
                  Start Game
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
