/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import styles from "./PublicLobby.module.css";
import Navbar from "../navbar/Navbar";
import TexasTable from "../../assets/Texas Table.png";
import PLOTable from "../../assets/PLO Table.png";
import OFCTable from "../../assets/OFC Table.png";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  createPublicTable,
  getLobby,
  joinLobby,
  resetLobby,
  updateLobby,
} from "../../firebase";

export default function PublicLobby() {
  const { currentUser } = useAuth();
  const history = useHistory();

  const publicRedirect = async (lobbyID) => {
    await joinLobby(lobbyID, currentUser.uid);
    const data = await getLobby(lobbyID);
    console.log(data);

    if (data.members.length === 1) {
      const nextid = data.nextid;
      if (lobbyID = "texaspublic") {
        await createPublicTable("TEXAS", nextid, currentUser.uid);
      }
      if (lobbyID = "plopublic") {
        await createPublicTable("PLO", nextid, currentUser.uid);
      }
    } else {
      joinLobby(data.nextid, currentUser.uid);
    }

    if (data.members.length === 9) {
      resetLobby(lobbyID);
    }

    history.replace("/lobby/" + data.nextid);
  };

  const publicJoin = async (lobbyID) => {
    console.log("Joining " + lobbyID);
    const lobby = await getLobby(lobbyID);
    const data = await getLobby(lobby.currentid);
    console.log(lobby, data)

    if (data.status !== "CLOSED" && data.members.length < 9) {
      console.log("Joining Current Lobby")
      joinLobby(lobby.currentid, currentUser.uid);
      history.replace("/lobby/" + lobby.currentid);
    } else {
      console.log("Joining Next Lobby")
      updateLobby(lobbyID, lobby.nextid)
      joinLobby(lobby.nextid, currentUser.uid);
      history.replace("/lobby/" + lobby.nextid);
    }
  }



  const ofcRedirect = async () => {
    history.replace("/ofc");
  };

  const ofcRedirect2 = async () => {
    history.replace("/ofc2");
  };

  return (
    <div className={styles.main}>
      <Navbar />
      <div className={styles.body}>
        <div className={styles.wrapper}>
          <h2 style={{ color: "white" }}>Public Lobby</h2>
          <main style={{
            display: "flex",
            flexDirection: "row",
            width: "100vw",
            flexWrap: "wrap",
          }}>
            <section>
              <div className={styles.card}>
                <img src={TexasTable} />
                <div style={{ height: 19 }} />
                <button type="button" className={styles.joinNowBtn} onClick={(e) => {
                  publicJoin("texaspublic");
                }}
                >
                  Play Now
                </button>
              </div>
            </section>
            <section>
              <div className={styles.card}>
                <img src={PLOTable} />
                <div style={{ height: 19 }} />
                <button type="button" className={styles.joinNowBtn} onClick={(e) => {
                  publicJoin("plopublic");
                }}
                >
                  Play Now
                </button>
              </div>
            </section>
            <section>
              <div className={styles.card}>
                <img src={OFCTable} />
                <div style={{ height: 19 }} />
                <button type="button" className={styles.joinNowBtn} onClick={(e) => {
                  ofcRedirect();
                }}
                >
                  Play Now
                </button>
              </div>
            </section>
            <section>
              <div className={styles.card}>
                <img src={OFCTable} />
                <div style={{ height: 19 }} />
                <button type="button" className={styles.joinNowBtn} onClick={(e) => {
                  ofcRedirect2();
                }}
                >
                  Play Now ( 3P )
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
