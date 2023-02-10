import React from "react";
import Dashboard from "./views/Dashboard";
import PrivateRoute from "./views/PrivateRoute";
import "./App.css";
import { Route, Switch } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./views/login/Login";
import SignUp from "./views/signup/Signup";
import TexasApp from "./games/texas/App";
import OfcApp from "./games/ofc/App";
import Ofc2App from "./games/ofc3/App";
import Career from "./views/career/Career";
import JoinClub from "./views/join club/JoinClub";
import CreateClub from "./views/create club/CreateClub";
import CreateTable from "./views/create table/CreateTable";
import Lobby from "./views/lobby/Lobby";
import PLOApp from "./games/plo/App";
import AdminLogin from "./views/admin/login/AdminLogin";
import AdminPanel from "./views/admin/panel/AdminPanel";
import Notification from "./views/notification/Notification";
import Profile from "./views/profile/Profile";
import PublicLobby from "./views/public lobby/PublicLobby";

import { Provider, Subscribe } from "unstated";
import { playerState, opponentState, sstate } from "./games/ofc/containers";
import "./games/ofc/communicate";

import {
  playerState2,
  opponentState2,
  opponent2State2,
  sstate2,
} from "./games/ofc3/containers";
import "./games/ofc3/communicate";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Switch>
          <PrivateRoute path="/" component={Dashboard} exact />
          <PrivateRoute path="/create-table" component={CreateTable} exact />
          <PrivateRoute path="/lobby/:id" component={Lobby} exact />
          <PrivateRoute path="/career" component={Career} exact />
          <PrivateRoute path="/public-lobby" component={PublicLobby} exact />
          <PrivateRoute path="/join-club" component={JoinClub} exact />
          <PrivateRoute path="/create-club" component={CreateClub} exact />
          <PrivateRoute path="/texas/:id" component={TexasApp} />
          <PrivateRoute path="/plo/:id" component={PLOApp} />
          <PrivateRoute path="/admin-panel" component={AdminPanel} />
          <Route path="/login" component={Login} exact />
          <Route path="/signup" component={SignUp} exact />
          <Route path="/admin" component={AdminLogin} exact />
          <PrivateRoute path="/notify" component={Notification} exact />
          <PrivateRoute path="/profile" component={Profile} exact />
          <PrivateRoute path="/ofc">
            <Provider>
              <Subscribe to={[playerState, opponentState, sstate]}>
                {(playerState, opponentState, sstate) => (
                  <OfcApp
                    playerState={playerState}
                    opponentState={opponentState}
                    sstate={sstate}
                  />
                )}
              </Subscribe>
            </Provider>
          </PrivateRoute>
          <PrivateRoute path="/ofc2">
            <Provider>
              <Subscribe
                to={[playerState2, opponentState2, opponent2State2, sstate2]}
              >
                {(playerState2, opponentState2, opponent2State2, sstate2) => (
                  <Ofc2App
                    playerState={playerState2}
                    opponentState={opponentState2}
                    opponent2State={opponent2State2}
                    sstate={sstate2}
                  />
                )}
              </Subscribe>
            </Provider>
          </PrivateRoute>
        </Switch>
      </AuthProvider>
    </div>
  );
}

export default App;
