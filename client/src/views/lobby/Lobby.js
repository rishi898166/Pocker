import React from "react";
import styles from "./Lobby.module.css";

import { useHistory, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import {
  onSnapshot,
  doc,
  db,
  getUserDatabyUID,
  startGame,
  createPublicTable,
  openLobby,
  resetLobby,
} from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";

export default function Lobby(props) {
  const [lobby, setlobby] = useState();
  const [loading, setloading] = useState(true);
  const { id } = useParams();
  const history = useHistory();
  const { currentUser } = useAuth();

  const getLobbyData = async () => {
    const unsub = onSnapshot(doc(db, "lobby", id.toString()), (doc) => {
      setloading(true);

      if (doc.data().status !== "OPEN") {

        if (doc.data().game === "TEXAS") {
          history.replace("/texas/" + id);
        }
        if (doc.data().game === "PLO") {
          history.replace("/plo/" + id);
        }
      }

      if (doc.data().isPublic === true && doc.data().members.length === 9) {
        startGame(id);
      }

      if (!doc.data().members.includes(currentUser.uid)) {
        history.replace("/");
      }

      setlobby(doc.data());
      setloading(false);
    });
  };

  const startMyGame = async () => {
    startGame(id);
  };

  useEffect(() => {
    setTimeout(() => {
      getLobbyData();
    }, 2000);
  }, []);

  return (
    <div className={styles.main}>
      <h1 style={{ color: "white" }}>Waiting For Other Players ...</h1>

      {!loading && (
        <div>
          <DisplayTables lobby={lobby.members} />
          {currentUser.uid === lobby.admin && (
            <button
              type="button"
              disabled={lobby.members.length >= 2 ? false : true}
              style={{
                backgroundColor:
                  lobby.members.length >= 2 ? "rgba(191, 55, 57, 1)" : "#555",
                margin: 50,
              }}
              className={styles.joinNowBtn}
              onClick={startMyGame}
            >
              Start
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DisplayTables(props) {
  const [list, setlist] = useState([]);
  const data = props.lobby;

  const getUser = async () => {
    const lobbyusers = [];
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      const res = await getUserDatabyUID(element);
      lobbyusers.push(res);
    }
    setlist(lobbyusers);
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div>
      {list.map((user, index) => {
        return (
          <div className={styles.card} key={index}>
            <img src={user.data.imageUrl} alt={"pic"} />
            <p>@{user.id}</p>
          </div>
        );
      })}
    </div>
  );
}
